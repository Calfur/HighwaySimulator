import P5 from "p5";
import Car from "./Car";
import HighwayPosition from "./HighwayPosition";

import environment from '../Environments/RegularHightway.json';
import Lane from "./Lane";

export default class TrafficCalculator {
   private static readonly SECONDS_BETWEEN_CALCULATIONS = 0.01;
   private static readonly MAX_SECONDS_TO_CALCULATE = 60;
   private static readonly CALCULATIONS_PER_EVENT_CYCLE = 10;

   private _p5: P5;
   private _carsAtTime: { second: number, cars: Car[] }[] = new Array();
   private _lastCalculatedSecond = 0;
   private _lanes: Lane[] = new Array();

   constructor(p5: P5) {
      this._p5 = p5;
   }

   public getClosestAvailableTime(requestedTime: number) {
      var closest = this._carsAtTime.reduce(function (prev, curr) {
         return (Math.abs(curr.second - requestedTime) < Math.abs(prev.second - requestedTime) ? curr : prev);
      });

      return closest.second;
   }

   public getCarsAtTime(second: number) {
      return this._carsAtTime.find(c => c.second == second).cars;
   }

   public getLoadedTime() {
      return this._lastCalculatedSecond;
   }

   public calculateTraffic() {
      this.createInitialCars();

      this.calculateNextSecondsAsync();
   }

   private calculateNextSecondsAsync() {
      setTimeout(() => {
         this.calculateNextSeconds();

         if (this._lastCalculatedSecond <= TrafficCalculator.MAX_SECONDS_TO_CALCULATE) {
            this.calculateNextSecondsAsync();
         } else {
            this.onAllSecondsCalculated()
         }
      }, 0);
   }

   private onAllSecondsCalculated() {
      console.log(this._carsAtTime)
   }

   private createInitialCars() {
      var initialCars: Car[] = new Array();

      const laneConfigs = environment.lanes;
      laneConfigs.forEach((laneConfig, i) => {
         const newLane = new Lane(i, laneConfig.maxSpeed / 3.6, laneConfig.beginning, laneConfig.end);
         this._lanes.push(newLane);

         for (var j = 0; j < laneConfig.amountOfCars; j++) {
            const seed = (i + 1) * (j - 2);

            const highwayPosition = new HighwayPosition((Car.LENGTH + laneConfig.distanceBetweeenInitialCars) * j, newLane);
            const color = this.getColor(seed);
            const startSpeed = laneConfig.startSpeedOfCars / 3.6;
            const goalLane = null;
            const checkSwitchInTicks = (laneConfig.amountOfCars - j) * 10;

            const car = new Car(
               this._p5,
               highwayPosition,
               color,
               startSpeed,
               goalLane,
               checkSwitchInTicks,
            );

            initialCars.push(car);
         }
      });

      this.sortCars(initialCars);
      console.log(initialCars)

      this._carsAtTime.push({ second: 0, cars: initialCars });
   }

   private sortCars(cars: Car[]) {
      cars.sort((c1, c2) => { return c1.highwayPosition.meter - c2.highwayPosition.meter });
   }

   private getColor(seed: number) {
      return this._p5.color("#" + Math.floor(Math.abs(Math.sin(seed) * 16777215)).toString(16));
   }

   private calculateNextSeconds() {
      for (var i = 0; i < TrafficCalculator.CALCULATIONS_PER_EVENT_CYCLE && this._lastCalculatedSecond <= TrafficCalculator.MAX_SECONDS_TO_CALCULATE; i++) {
         this.calculateNextVersionCars(this._lastCalculatedSecond);
         this._lastCalculatedSecond = this.calculateNextSecond(this._lastCalculatedSecond);
      }
   }

   private calculateNextVersionCars(lastSecond: number) {
      var nextSecond = this.calculateNextSecond(lastSecond);
      var nextVersionCars: Car[] = [];

      for (const previousVersionCar of this.getCarsAtTime(lastSecond)) {
         const nextVersionCar = this.calculateNextCar(previousVersionCar, lastSecond);
         nextVersionCars.push(nextVersionCar);
      };

      this.sortCars(nextVersionCars);

      this._carsAtTime.push({ second: nextSecond, cars: nextVersionCars });
   }

   private calculateNextCar(previousVersionCar: Car, lastSecond: number) {
      const previousVersionCars: Car[] = this._carsAtTime.find(c => c.second == lastSecond).cars;

      const car = previousVersionCar.createNextVersion(previousVersionCars, this._lanes, TrafficCalculator.SECONDS_BETWEEN_CALCULATIONS);

      return car;
   }

   private calculateNextSecond(lastSecond: number) {
      return Math.round((lastSecond + TrafficCalculator.SECONDS_BETWEEN_CALCULATIONS) * 10000) / 10000;
   }
}

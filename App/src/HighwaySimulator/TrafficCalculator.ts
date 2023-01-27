import P5 from "p5";
import Car from "./Car";
import HighwayPosition from "./HighwayPosition";
import JSONHandler from "./JSONConfigHandler";
import Lane from "./Lane";

export default class TrafficCalculator {
   private static readonly SECONDS_BETWEEN_CALCULATIONS = 0.01;
   private static readonly MAX_SECONDS_TO_CALCULATE = 60;
   private static readonly CALCULATIONS_PER_EVENT_CYCLE = 10;

   private _p5: P5;
   private _carsAtTime: { second: number, cars: Car[] }[] = new Array();
   private _lastCalculatedSecond = 0;
   private _lanes: Lane[] = new Array();
   private _environment;

   public get loadedTime() {
      return this._lastCalculatedSecond;
   }

   public get lanes() {
      return this._lanes;
   }

   constructor(p5: P5, environment?) {
      this._p5 = p5;

      if (environment != null) {
         this._environment = environment;         
      }
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

   public getAllCarsAtTime() {
      return this._carsAtTime;
   }

   public calculateTraffic(callBack?) {
      this.createInitialCars();
      this.calculateNextSecondsAsync(callBack);
   }

   private calculateNextSecondsAsync(callBack?) {
      setTimeout(() => {
         this.calculateNextSeconds();

         if (this._lastCalculatedSecond <= TrafficCalculator.MAX_SECONDS_TO_CALCULATE) {
            this.calculateNextSecondsAsync(callBack);
         } else {
            this.onAllSecondsCalculated(callBack)
         }
      }, 0);
   }

   private onAllSecondsCalculated(callBack?) {
      if (JSONHandler.getInstance().getDebugState()) {
      }
      if (callBack != null) {
         callBack(this._carsAtTime, this._environment);
      }
   }

   private createInitialCars() {
      var initialCars: Car[] = new Array();

      var laneConfigs = JSONHandler.getInstance().getSelectedEnvironment().lanes;

      if (this._environment != null) {
         laneConfigs = this._environment.lanes;
      }

      for (let i = 0; i < laneConfigs.length; i++) {
         const newLane = new Lane(i, laneConfigs[i].maxSpeed / 3.6, laneConfigs[i].beginning, laneConfigs[i].end);
         this._lanes.push(newLane);

         for (var j = 0; j < laneConfigs[i].amountOfCars; j++) {
            const seed = (i + 1) * (j - 2);

            const highwayPosition = new HighwayPosition((Car.LENGTH + laneConfigs[i].distanceBetweeenInitialCars) * j, newLane);
            const color = this.getColor(seed);
            const startSpeed = laneConfigs[i].startSpeedOfCars / 3.6;
            const goalLane = null;
            const checkSwitchInTicks = (laneConfigs[i].amountOfCars - j) * 10;

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
      };

      this.sortCars(initialCars);

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

         if (nextVersionCar.isOnLane()) {
            nextVersionCars.push(nextVersionCar);
         }
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

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
         }
      }, 0, this._lastCalculatedSecond);
   }

   private createInitialCars() {
      var initialCars: Car[] = new Array();
      
      for (let i:number = 0; i < environment.lanes.length; i++) {
         for (let j = 0; j < environment.lanes[i].amountOfCars; j++) {
            var newLane:Lane = new Lane(i, environment.lanes[i].maxSpeed, environment.lanes[i].beginning, environment.lanes[i].end);
            initialCars.push(new Car(this._p5, new HighwayPosition(Car.length + (Car.length + 1)*j, newLane), this._p5.color("red"), environment.lanes[i].startSpeed))
         }
      }

      this._carsAtTime.push({ second: 0, cars: initialCars });
      console.log(this._carsAtTime);
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
         const nextVersionCar = this.calculateNextCar(previousVersionCar, lastSecond); // 
         nextVersionCars.push(nextVersionCar);
      };

      this._carsAtTime.push({ second: nextSecond, cars: nextVersionCars });
   }

   private calculateNextCar(previousVersionCar: Car, lastSecond: number) {
      const cars:Car[] = this._carsAtTime.find(c => c.second == lastSecond).cars;

      return new Car(
         this._p5,
         previousVersionCar.calculatePositionOfNextVersion(cars, TrafficCalculator.SECONDS_BETWEEN_CALCULATIONS),
         previousVersionCar.color,
         previousVersionCar.speed
      );
   }

   private calculateNextSecond(lastSecond: number) {
      return Math.round((lastSecond + TrafficCalculator.SECONDS_BETWEEN_CALCULATIONS) * 10000) / 10000;
   }
}

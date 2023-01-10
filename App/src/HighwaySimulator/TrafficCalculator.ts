import P5 from "p5";
import Car from "./Car";
import HighwayPosition from "./HighwayPosition";

export default class TrafficCalculator {
   private static readonly SECONDS_BETWEEN_CALCULATIONS = 1;

   private _p5: P5;
   private _carsAtTime: { second: number, cars: Car[] }[] = new Array();

   constructor(p5: P5) {
      this._p5 = p5;

      this.calculateTraffic()
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

   private calculateTraffic() {
      this.createInitialCars();

      for (var lastCalculatedSecond = 0; lastCalculatedSecond <= 60; lastCalculatedSecond += TrafficCalculator.SECONDS_BETWEEN_CALCULATIONS) {
         this.calculateNextCars(lastCalculatedSecond);
      }
   }

   private createInitialCars() {
      var initialCars: Car[] = [
         new Car(this._p5, new HighwayPosition(10, 0), this._p5.color("red"), 0),
         new Car(this._p5, new HighwayPosition(20, 0), this._p5.color("blue"), 0),
         new Car(this._p5, new HighwayPosition(15, 1), this._p5.color("green"), 0),
         new Car(this._p5, new HighwayPosition(30, 1), this._p5.color("yellow"), 0),
      ];
      this._carsAtTime.push({ second: 0, cars: initialCars });
   }

   private calculateNextCars(lastSecond: number) {
      var nextSecond = lastSecond + TrafficCalculator.SECONDS_BETWEEN_CALCULATIONS;
      var nextCars: Car[] = [];

      this.getCarsAtTime(lastSecond).forEach(lastCar => {
         var nextCar = this.calculateNextCar(lastCar);
         nextCars.push(nextCar);
      });

      this._carsAtTime.push({ second: nextSecond, cars: nextCars });
   }

   private calculateNextCar(lastCar: Car) {
      return new Car(
         this._p5,
         lastCar.calculateNextPosition(TrafficCalculator.SECONDS_BETWEEN_CALCULATIONS),
         lastCar.color,
         lastCar.calculateNextSpeed(TrafficCalculator.SECONDS_BETWEEN_CALCULATIONS)
      );
   }
}

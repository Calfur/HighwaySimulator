import P5 from "p5";
import Car from "./Car";
import HighwayPosition from "./HighwayPosition";

export default class TrafficCalculator {
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

   public getCarsAtTime(seconds: number) {
      return this._carsAtTime.find(c => c.second == seconds).cars;
   }

   private calculateTraffic() {
      var previousCars: Car[] = [
         new Car(this._p5, new HighwayPosition(10, 0), this._p5.color("red"), 0),
         new Car(this._p5, new HighwayPosition(20, 0), this._p5.color("blue"), 0),
         new Car(this._p5, new HighwayPosition(15, 1), this._p5.color("green"), 0),
         new Car(this._p5, new HighwayPosition(30, 1), this._p5.color("yellow"), 0),
      ];

      for (var second = 1; second <= 20; second++) {
         var currentCars: Car[] = [];

         previousCars.forEach(previousCar => {
            currentCars.push(
               new Car(
                  this._p5, 
                  new HighwayPosition(previousCar.CalcNextPosition(), previousCar.highwayPosition.lane), 
                  previousCar.color, 
                  previousCar.CalcNewSpeed()
               )
            );
         });

         this._carsAtTime.push({ second: second, cars: currentCars });
         previousCars = currentCars;
      }
   }
}



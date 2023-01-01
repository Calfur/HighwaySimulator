import P5 from "p5";
import Car from "./Car";
import HighwayPosition from "./HighwayPosition";

export default class TrafficCalculator {
   private _p5: P5;
   private _carsAtTime: { seconds: number, cars: Car[] }[] = new Array();

   constructor(p5: P5) {
      this._p5 = p5;

      this.calculateTraffic()
   }

   public getClosestAvailableTime(requestedTime: number) {
      var closest = this._carsAtTime.reduce(function (prev, curr) {
         return (Math.abs(curr.seconds - requestedTime) < Math.abs(prev.seconds - requestedTime) ? curr : prev);
      });

      return closest.seconds;
   }

   public getCarsAtTime(seconds: number) {
      return this._carsAtTime.find(c => c.seconds == seconds).cars;
   }

   private calculateTraffic() {
      var cars1 = [
         new Car(this._p5, new HighwayPosition(10, 0), this._p5.color("red")),
         new Car(this._p5, new HighwayPosition(20, 0), this._p5.color("blue")),
         new Car(this._p5, new HighwayPosition(15, 1), this._p5.color("green")),
         new Car(this._p5, new HighwayPosition(30, 1), this._p5.color("yellow")),
      ];
      var cars2 = [
         new Car(this._p5, new HighwayPosition(15, 0), this._p5.color("red")),
         new Car(this._p5, new HighwayPosition(30, 0), this._p5.color("blue")),
         new Car(this._p5, new HighwayPosition(25, 1), this._p5.color("green")),
         new Car(this._p5, new HighwayPosition(40, 1), this._p5.color("yellow")),
      ];
      var cars3 = [
         new Car(this._p5, new HighwayPosition(25, 0), this._p5.color("red")),
         new Car(this._p5, new HighwayPosition(40, 0), this._p5.color("blue")),
         new Car(this._p5, new HighwayPosition(35, 1), this._p5.color("green")),
         new Car(this._p5, new HighwayPosition(50, 1), this._p5.color("yellow")),
      ];
      var cars4 = [
         new Car(this._p5, new HighwayPosition(35, 0), this._p5.color("red")),
         new Car(this._p5, new HighwayPosition(50, 0), this._p5.color("blue")),
         new Car(this._p5, new HighwayPosition(45, 1), this._p5.color("green")),
         new Car(this._p5, new HighwayPosition(60, 1), this._p5.color("yellow")),
      ];

      this._carsAtTime.push({ seconds: 0, cars: cars1 });
      this._carsAtTime.push({ seconds: 1, cars: cars2 });
      this._carsAtTime.push({ seconds: 2, cars: cars3 });
      this._carsAtTime.push({ seconds: 3, cars: cars4 });
   }
}



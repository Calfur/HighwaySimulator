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
      var cars: Car[] = [
         new Car(this._p5, new HighwayPosition(10, 0), this._p5.color("red")),
         new Car(this._p5, new HighwayPosition(20, 0), this._p5.color("blue")),
         new Car(this._p5, new HighwayPosition(15, 1), this._p5.color("green")),
         new Car(this._p5, new HighwayPosition(30, 1), this._p5.color("yellow")),
      ];
      this._carsAtTime.push({ seconds: second, cars: cars });
      var second:number;
      var carNum:number;
      for (second = 1; second<=20; second++) {
         for (carNum = 1; carNum<=20; carNum++) {
            cars[carNum].CalcAction(); //TODO Call not working
            cars[carNum].CalcNextPosition();
         }
         this._carsAtTime.push({ seconds: second, cars: cars });
      }
   }
}



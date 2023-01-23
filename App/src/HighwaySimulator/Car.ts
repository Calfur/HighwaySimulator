import P5 from "p5";
import HighwayPosition from "./HighwayPosition";

export default class Car {
   // car size from: https://www.bazonline.ch/autos-werden-immer-breiter-und-laenger-288912673833
   private static readonly LENGTH = 4.40;
   private static readonly WIDTH = 1.80;
   private static readonly ACCELERATION = 5; // Random Value, need to be replaced by something meeningfull
   private static readonly DECELERATION = 36; // Random Value, need to be replaced by something meeningfull

   // private static readonly POWER = 115100; // Watt = 156.5 PS --> https://de.statista.com/statistik/daten/studie/249880/umfrage/ps-zahl-verkaufter-neuwagen-in-deutschland/#:~:text=Die%20Statistik%20zeigt%20die%20durchschnittliche,entspricht%20etwa%20156%2C5%20PS.
   // private static readonly WEIGHT = 1400; // KG --> https://www.meinauto.de/lp-wie-schwer-ist-ein-auto#:~:text=Ein%20normales%20Auto%20wiegt%20heute,1.000%20kg%20und%201.800%20kg.
   // private static readonly BREAKSPEED = -8; // m/s^2 --> https://physikunterricht-online.de/jahrgang-10/bremsbewegungen/#:~:text=In%20einer%20realen%20Situation%20im,%2D1m%2Fs2%20sinken.

   private readonly _p5: P5;
   private readonly _highwayPosition: HighwayPosition;
   private readonly _color: P5.Color;
   private readonly _previousVersionSpeed: number; // the speed of the same care earlier in the calculation in m/s
   private _speed: number; // speed of this car in m/s
   private _laneOfNextVersion: number;

   public get highwayPosition() {
      return this._highwayPosition;
   }

   public get color() {
      return this._color;
   }

   public get speed() {
      return this._speed;
   }

   constructor(p5: P5, highwayPosition: HighwayPosition, color: P5.Color, previousVersionSpeed: number) {
      this._p5 = p5;
      this._highwayPosition = highwayPosition;
      this._color = color;
      this._previousVersionSpeed = previousVersionSpeed;
   }

   public draw(position: P5.Vector, pixelsPerMeter: number) {
      const pixelLength = Car.LENGTH * pixelsPerMeter;
      const pixelWidth = Car.WIDTH * pixelsPerMeter;

      this._p5.push();

      this._p5.noStroke();
      this._p5.fill(this._color);
      this._p5.rectMode("center");
      this._p5.rect(position.x, position.y, pixelLength, pixelWidth);

      this._p5.pop();
   }

   private getAccelerationSpeed(secondsBetweenCalculation: number) {
      var speed: number = this._previousVersionSpeed + secondsBetweenCalculation * (Car.ACCELERATION)

      // TODO: maxspeed of line
      if (speed > 120 / 3.6) {
         speed = 120 / 3.6;
      }
      return speed
   }

   private getDecelerationSpeed(secondsBetweenCalculation: number) {
      var speed: number = this._previousVersionSpeed - secondsBetweenCalculation * (Car.DECELERATION);

      if (speed < 0) {
         speed = 0
      }

      return speed
   }

   public calculatePositionOfNextVersion(cars: Car[], secondsBetweenCalculation: number): HighwayPosition {
      // Makes it possible for a Car to stand still (With a minus speed)
      if (this._previousVersionSpeed < 0) {
         this._speed = this._previousVersionSpeed;
         return this.highwayPosition;
      }

      var carInFront = this.getCarInFront(cars, this);

      this.calculateMove(secondsBetweenCalculation, carInFront);

      var speedOfNextVersion = this.highwayPosition.meter + secondsBetweenCalculation * this._speed;

      return new HighwayPosition(
         speedOfNextVersion,
         this._laneOfNextVersion
      );
   }

   private calculateMove(secondsBetweenCalculation: number, carInFront: Car) { //TODO Algorythmus    
      this._speed = this.calculateSpeed(secondsBetweenCalculation, carInFront);
      this._laneOfNextVersion = this.calculateLane();
   }

   private calculateSpeed(secondsBetweenCalculation: number, carInFront: Car) {
      if (carInFront == null) { // If there is no car in Front
         return this.getAccelerationSpeed(secondsBetweenCalculation);
      }

      var distanceToCarInFront: number = carInFront.highwayPosition.meter - this._highwayPosition.meter - (Car.LENGTH + 1);

      // Cant use the following function when speed = 0 because of math
      if (this._previousVersionSpeed == 0 && !(distanceToCarInFront < Car.LENGTH + 1)) {
         return this.getAccelerationSpeed(secondsBetweenCalculation);
      }

      // If Distance is greater than two seconds
      if (distanceToCarInFront / this._previousVersionSpeed > 2) {
         return this.getAccelerationSpeed(secondsBetweenCalculation);
      }

      // If Distance is smaler than two seconds
      return this.getDecelerationSpeed(secondsBetweenCalculation);
   }

   private calculateLane() {
      // add here logic for switching lane
      return this.highwayPosition.lane;
   }

   private getCarInFront(cars: Car[], car: Car) {
      var carsInSameLane = cars.filter(c => c.highwayPosition.lane == car.highwayPosition.lane);
      carsInSameLane = carsInSameLane.sort(function (a, b) {
         return a["highwayPosition"].meter - b["highwayPosition"].meter;
      });

      var indexOfCar = carsInSameLane.indexOf(car)
      var carInFront: Car = carsInSameLane[++indexOfCar];

      return carInFront;
   }
}

import P5 from "p5";
import HighwayPosition from "./HighwayPosition";

export default class Car {
   // car size from: https://www.bazonline.ch/autos-werden-immer-breiter-und-laenger-288912673833
   private static readonly LENGTH = 4.40;
   private static readonly WIDTH = 1.80;
   private static readonly ACCELERATION = 5;
   private static readonly DECELERATION = 36;

   // private static readonly POWER = 115100; // Watt = 156.5 PS --> https://de.statista.com/statistik/daten/studie/249880/umfrage/ps-zahl-verkaufter-neuwagen-in-deutschland/#:~:text=Die%20Statistik%20zeigt%20die%20durchschnittliche,entspricht%20etwa%20156%2C5%20PS.
   // private static readonly WEIGHT = 1400; // KG --> https://www.meinauto.de/lp-wie-schwer-ist-ein-auto#:~:text=Ein%20normales%20Auto%20wiegt%20heute,1.000%20kg%20und%201.800%20kg.
   // private static readonly BREAKSPEED = -8; // m/s^2 --> https://physikunterricht-online.de/jahrgang-10/bremsbewegungen/#:~:text=In%20einer%20realen%20Situation%20im,%2D1m%2Fs2%20sinken.

   private readonly _p5: P5;
   private readonly _highwayPosition: HighwayPosition;
   private readonly _color: P5.Color;
   private readonly _speed: number; // m/s

   public get highwayPosition() {
      return this._highwayPosition;
   }

   public get color() {
      return this._color;
   }

   constructor(p5: P5, highwayPosition: HighwayPosition, color: P5.Color, speed: number) {
      this._p5 = p5;
      this._highwayPosition = highwayPosition;
      this._color = color;
      this._speed = speed;
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

   private getAccelerationSpeed(secondsBetween : number) {
      var speed:number = this._speed + secondsBetween * (Car.ACCELERATION)

      // TODO: maxspeed of line
      if (speed > 120) {
         speed = 120;
      }
      return speed
   }

   private getDecelerationSpeed(secondsBetween : number) {
      var speed:number = this._speed - secondsBetween * (Car.DECELERATION);

      if (speed < 0) {
         speed = 0
      }
      
      return speed
   }

   public calculateNextSpeed(secondsBetween: number, carInFront: Car) { //TODO Algorythmus    
      var distance:number;
      if(carInFront != null) {
         distance = carInFront.highwayPosition.meter - this._highwayPosition.meter;   
      } else {
         distance = 999;
      }

      if(this._speed < 0) { // Exit for immovable Vehicles (minus velocity)
         return this._speed;
      }

      if (distance < Car.LENGTH + 1) { // The Distance should not get smaller than one meter
         return this.getDecelerationSpeed(secondsBetween);
      }

      if(this._speed == 0) { // Exit for immovable Vehicles
         return this.getAccelerationSpeed(secondsBetween);
      }

      if (distance / this._speed > 2) { // If Distance is greater than two seconds
         return this.getAccelerationSpeed(secondsBetween);
      }
      
      return this.getDecelerationSpeed(secondsBetween); // If Distance is smaler than two seconds
   }

   public calculateNextPosition(secondsBetween: number) {
      // Makes it possible for a Car to stand still (With a minus speed)
      if (this._speed >= 0) {
         this.highwayPosition.meter += secondsBetween * this._speed;
      }

      return new HighwayPosition(
         this.highwayPosition.meter,
         this.highwayPosition.lane
      );
   }
}
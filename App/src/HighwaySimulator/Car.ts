import P5 from "p5";
import HighwayPosition from "./HighwayPosition";

export default class Car {
   // car size from: https://www.bazonline.ch/autos-werden-immer-breiter-und-laenger-288912673833
   private static readonly LENGTH = 4.40;
   private static readonly WIDTH = 1.80;
   // private static readonly ACCELERATION = 5; // Random Value, need to be replaced by something meeningfull 
   private static readonly DECELERATION = 8; // m/s^2 --> https://physikunterricht-online.de/jahrgang-10/bremsbewegungen/#:~:text=In%20einer%20realen%20Situation%20im,%2D1m%2Fs2%20sinken.

   private static readonly POWER = 117679.8; // Watt = 160 PS --> https://auto-wirtschaft.ch/news/4811-schweizerinnen-und-schweizer-mogen-ps-starke-autos#:~:text=Autos%20in%20der%20Schweiz%20sind%20mit%20durchschnittlich%20160,PS%2C%20am%20wenigsten%20die%20Tessiner%20mit%20145%20PS.
   private static readonly WEIGHT = 1723; // KG --> https://de.statista.com/statistik/daten/studie/787633/umfrage/durchschnittliches-leergewicht-neuer-personenwagen-in-der-schweiz/

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

   public get speed() {
      return this._speed;
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

   private getAccelerationSpeed(secondsBetweenCalculation : number) {
      var speed:number = Math.sqrt(2 * (Math.pow(this._speed, 2) * Car.WEIGHT / 2 + Car.POWER * secondsBetweenCalculation) / Car.WEIGHT); // E = 1/2mv^2 + P*t ; v = sqrt(2E/m)

      // TODO: maxspeed of line
      if (speed > 120/3.6) {
         speed = 120/3.6;
      }
      return speed
   }

   private getDecelerationSpeed(secondsBetweenCalculation : number) {
      var speed:number = this._speed - secondsBetweenCalculation * (Car.DECELERATION);

      if (speed < 0) {
         speed = 0
      }
      
      return speed
   }

   public calculateNextSpeed(secondsBetweenCalculation: number, carInFront: Car) { //TODO Algorythmus    
      if(this._speed < 0) { // Exit for immovable Vehicles (minus velocity) DEVONLY
         return this._speed;
      }

      if(carInFront == null) { // If there is no car in Front
         return this.getAccelerationSpeed(secondsBetweenCalculation);
      }

      var distanceInMeter:number = carInFront.highwayPosition.meter - this._highwayPosition.meter - (Car.LENGTH + 1);   

      if(this._speed == 0 && !(distanceInMeter < Car.LENGTH + 1)) { // Cant use the following function when speed = 0 because of math
         return this.getAccelerationSpeed(secondsBetweenCalculation);
      }

      if (distanceInMeter / this._speed > 2) { // If Distance is greater than two seconds
         return this.getAccelerationSpeed(secondsBetweenCalculation);
      }
      
      return this.getDecelerationSpeed(secondsBetweenCalculation); // If Distance is smaler than two seconds
   }

   public calculateNextPosition(secondsBetweenCalculation: number) {
      // Makes it possible for a Car to stand still (With a minus speed)
      if (this._speed >= 0) {
         this.highwayPosition.meter += secondsBetweenCalculation * this._speed;
      }

      return new HighwayPosition(
         this.highwayPosition.meter,
         this.highwayPosition.lane
      );
   }
}
import P5 from "p5";
import HighwayPosition from "./HighwayPosition";
import Lane from "./Lane";

export default class Car {
   // car size from: https://www.bazonline.ch/autos-werden-immer-breiter-und-laenger-288912673833
   public static readonly LENGTH = 4.40;
   private static readonly WIDTH = 1.80;
   private static readonly DECELERATION = 8; // m/s^2 --> https://physikunterricht-online.de/jahrgang-10/bremsbewegungen/#:~:text=In%20einer%20realen%20Situation%20im,%2D1m%2Fs2%20sinken.
   private static readonly POWER = 117679.8; // Watt = 160 PS --> https://auto-wirtschaft.ch/news/4811-schweizerinnen-und-schweizer-mogen-ps-starke-autos#:~:text=Autos%20in%20der%20Schweiz%20sind%20mit%20durchschnittlich%20160,PS%2C%20am%20wenigsten%20die%20Tessiner%20mit%20145%20PS.
   private static readonly WEIGHT = 1723; // KG --> https://de.statista.com/statistik/daten/studie/787633/umfrage/durchschnittliches-leergewicht-neuer-personenwagen-in-der-schweiz/

   private readonly _p5: P5;
   private readonly _highwayPosition: HighwayPosition;
   private readonly _color: P5.Color;
   private readonly _previousVersionSpeed: number; // the speed of the same care earlier in the calculation in m/s
   private _speed: number; // speed of this car in m/s
   private _laneOfNextVersion: Lane;
   private _goalLane: Lane;

   public get highwayPosition() {
      return this._highwayPosition;
   }

   public get color() {
      return this._color;
   }

   public get speed() {
      return this._speed;
   }

   public get goalLane() {
      return this._goalLane;
   }

   constructor(p5: P5, highwayPosition: HighwayPosition, color: P5.Color, previousVersionSpeed: number, goalLane: Lane) {
      this._p5 = p5;
      this._highwayPosition = highwayPosition;
      this._color = color;
      this._previousVersionSpeed = previousVersionSpeed;
      this._goalLane = goalLane;
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

   private getAcceleratedSpeed(secondsBetweenCalculation: number) {
      var speed: number = Math.sqrt(2 * (Math.pow(this._previousVersionSpeed, 2) * Car.WEIGHT / 2 + Car.POWER * secondsBetweenCalculation) / Car.WEIGHT); // E = 1/2mv^2 + P*t ; v = sqrt(2E/m)

      // TODO: maxspeed of line
      if (speed > this.highwayPosition.lane.maxSpeed / 3.6) {
         speed = this.highwayPosition.lane.maxSpeed / 3.6;
      }
      return speed
   }

   private getDeceleratedSpeed(secondsBetweenCalculation: number) {
      var speed: number = this._previousVersionSpeed - secondsBetweenCalculation * (Car.DECELERATION);

      if (speed < 0) {
         speed = 0
      }

      return speed
   }

   public calculatePositionOfNextVersion(cars: Car[], lanes: Lane[], secondsBetweenCalculation: number): HighwayPosition {
      // Makes it possible for a Car to stand still (With a minus speed)
      if (this._previousVersionSpeed < 0) {
         this._speed = this._previousVersionSpeed;
         return this.highwayPosition;
      }


      this.calculateMove(secondsBetweenCalculation, cars, lanes);

      var speedOfNextVersion = this.highwayPosition.meter + secondsBetweenCalculation * this._speed;

      return new HighwayPosition(
         speedOfNextVersion,
         this._laneOfNextVersion
      );
   }

   private calculateMove(secondsBetweenCalculation: number, cars: Car[], lanes: Lane[]) {
      this._speed = this.calculateSpeed(cars, lanes, secondsBetweenCalculation);
      this._laneOfNextVersion = this.calculateLane(lanes, cars);
   }

   private calculateSpeed(cars: Car[], lanes: Lane[], secondsBetweenCalculation: number) {
      var carInFront = this.getCarInFront(cars, this);
      var laneright = lanes[this._highwayPosition.lane.id + 1];
      var laneleft = lanes[this._highwayPosition.lane.id - 1];

      var doAccelerate = this.doAccelerate(carInFront);
      var doAccelerateright = (laneright == null) || this.doAccelerateforLane(cars, laneright);
      var doAccelerateleft = (laneleft == null) || this.doAccelerateforLane(cars, laneleft);
      var doAccelerateforGoalLane = (this.goalLane == null) || this.doAccelerateforGoalLane(cars, this.goalLane);

      if (doAccelerate && doAccelerateright && doAccelerateleft && doAccelerateforGoalLane) {
         return this.getAcceleratedSpeed(secondsBetweenCalculation);
      } else {
         return this.getDeceleratedSpeed(secondsBetweenCalculation);
      }
   }

   private doAccelerateforLane(cars: Car[], lane: Lane) {
      var carInFrontforLane = this.getCarInFrontforLane(cars, this, lane);
      if (carInFrontforLane == null) {
         return true;
      }
      if (carInFrontforLane.goalLane != this._highwayPosition.lane) {
         return true;
      }
      return this.doAccelerate(carInFrontforLane);
   }

   private doAccelerateforGoalLane(cars: Car[], lane: Lane) {
      var carInFrontforLane = this.getCarInFrontforLane(cars, this, lane);
      if (carInFrontforLane == null) {
         return true;
      }
      return this.doAccelerate(carInFrontforLane);
   }

   private doAccelerate(carInFront: Car) {
      // If there is no car in Front
      if (carInFront == null) {
         return true
      }

      var distanceToCarInFront: number = carInFront.highwayPosition.meter - this._highwayPosition.meter - (Car.LENGTH + 1);

      // Cant use the following function when speed = 0 because of math
      if (this._previousVersionSpeed == 0 && !(distanceToCarInFront < Car.LENGTH + 1)) {
         return true
      }

      //Bremsweg: S = vo²/2a
      var BreakPathSelf = Math.pow(this._previousVersionSpeed,2) / (2 * Car.DECELERATION);
      var BreakPathInFront = Math.pow(carInFront._previousVersionSpeed,2) / (2 * Car.DECELERATION);

      // If Distance is greater than two seconds
      if (distanceToCarInFront > 2 * this._previousVersionSpeed + BreakPathSelf - BreakPathInFront) { 
         return true
      }

      // If Distance is smaler than two seconds
      return false
   }

   private calculateLane(lanes: Lane[], cars: Car[]) {
      if (this.goalLane != null) {
         var carInFront = this.getCarInFrontforLane(cars, this, this.goalLane);
         var doAccelerateinFront = this.doAccelerate(carInFront);
         var carInBack = this.getCarInBackforLane(cars, this, this.goalLane);
         var doAccelerateinBack = carInBack.doAccelerate(this);

         if (doAccelerateinBack && doAccelerateinFront) {
            var tempGoalLane = this.goalLane
            this._goalLane = null;

            return tempGoalLane;
         }
      }
      return this.highwayPosition.lane;

      // if (Math.round(Math.random() * 1000) == 1) { //TODO sinnvoller Algorithmus
      //    if (Math.round(Math.random()) == 1){
      //       if (lanes[this._highwayPosition.lane.id-1] != null){
      //          this._GoalLane = lanes[this._highwayPosition.lane.id-1];
      //       }
      //    } else {
      //       if (lanes[this._highwayPosition.lane.id+1] != null){
      //          this._GoalLane = lanes[this._highwayPosition.lane.id+1];
      //       }
      //    }
      //    this._GoalLane
      // }
   }

   private getCarInFront(cars: Car[], car: Car) {
      return this.getCarInFrontforLane(cars, car, car.highwayPosition.lane);
   }

   private getCarInFrontforLane(cars: Car[], car: Car, lane: Lane) {
      var carsInLane = cars.filter(c => c.highwayPosition.lane == lane);
      var carsAheadInLane = carsInLane.filter(c => c.highwayPosition.meter >= car.highwayPosition.meter && c != car);
      this.sortCarsByPosition(carsAheadInLane);

      return carsAheadInLane[0];
   }

   private getCarInBackforLane(cars: Car[], car: Car, lane: Lane) {
      var carsInLane = cars.filter(c => c.highwayPosition.lane == lane);
      var carsBackInLane = carsInLane.filter(c => c.highwayPosition.meter <= car.highwayPosition.meter && c != car)
      this.sortCarsByPosition(carsBackInLane);

      carsBackInLane.reverse();

      return carsBackInLane[0];
   }

   private sortCarsByPosition(carsBackInLane: Car[]) {
      carsBackInLane.sort(function (a, b) {
         return a["highwayPosition"].meter - b["highwayPosition"].meter;
      });
   }
}

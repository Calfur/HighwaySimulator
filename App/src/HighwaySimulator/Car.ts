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
   private _color: P5.Color;
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

      this._goalLane = this.calculateGoalLane(cars, lanes);

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
      var carInFront = this.getCarsInFront(cars, this)[0];
      var laneRight = lanes[this._highwayPosition.lane.id + 1];
      var laneLeft = lanes[this._highwayPosition.lane.id - 1];

      var doAccelerate = this.doAccelerate(carInFront);
      var doAccelerateright = (laneRight == null) || this.doAccelerateforLane(cars, laneRight);
      var doAccelerateleft = (laneLeft == null) || this.doAccelerateforLane(cars, laneLeft);
      var doAccelerateforGoalLane = (this.goalLane == null) || this.doAccelerateforGoalLane(cars, this.goalLane);

      if (this.highwayPosition.lane.id == 0) {
         console.log({doAccelerate, doAccelerateright, doAccelerateleft, doAccelerateforGoalLane});
      }
      
      if (doAccelerate && doAccelerateright && doAccelerateleft && doAccelerateforGoalLane) {
         return this.getAcceleratedSpeed(secondsBetweenCalculation);
      } else {
         return this.getDeceleratedSpeed(secondsBetweenCalculation);
      }
   }

   private doAccelerateforLane(cars: Car[], lane: Lane) {
      var carInFrontforLane = this.getCarsInFrontforLane(cars, this, lane)[0];
      if (carInFrontforLane == null) {
         return true;
      }
      if (carInFrontforLane.goalLane != this._highwayPosition.lane) {
         return true;
      }
      return this.doAccelerate(carInFrontforLane);
   }

   private doAccelerateforGoalLane(cars: Car[], lane: Lane) {
      var carInFrontforLane = this.getCarsInFrontforLane(cars, this, lane)[0];
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

      // If Distance is greater than two seconds
      if (distanceToCarInFront / this._previousVersionSpeed > 2) {
         return true
      }

      // If Distance is smaler than two seconds
      return false
   }

   private calculateGoalLane(cars: Car[], lanes: Lane[]) {
      var currentLaneKey: number = lanes.indexOf(this.highwayPosition.lane);

      var currentLane = this.getCarsInFront(cars, this);
      var leftLane = this.getCarsInFrontforLane(cars, this, lanes[--currentLaneKey]);
      var rightLane = this.getCarsInFrontforLane(cars, this, lanes[++currentLaneKey]);

      var avgSpeedCurrent = this.calculateAvgSpeed(currentLane, 0, 1, lanes[currentLaneKey]);
      var avgSpeedLeft = this.calculateAvgSpeed(leftLane, 0, 1, lanes[--currentLaneKey]);
      var avgSpeedRight = this.calculateAvgSpeed(rightLane, 0, 1, lanes[++currentLaneKey]);

      // console.log("_----------_");
      // console.log(avgSpeedCurrent);
      // console.log(avgSpeedLeft);
      // console.log(avgSpeedRight);

      var highterSpeedNeeded = 10; // in %
      var speedNeededForLaneSwitch = avgSpeedCurrent / 100 * (100 + highterSpeedNeeded);

      if (avgSpeedRight > avgSpeedLeft) {
         if (avgSpeedRight > speedNeededForLaneSwitch) {
            this._color = this._p5.color("red");
            return lanes[++currentLaneKey];
         }
      } else {
         if (avgSpeedLeft > speedNeededForLaneSwitch) {
            this._color = this._p5.color("green");
            return lanes[--currentLaneKey];
         }
      }

      this._color = this._p5.color("white");
      return null;
   }

   private calculateAvgSpeed(carsOfLane: Car[], start: number, end: number, lane: Lane) {
      var slicedArray = carsOfLane.slice(start, end);
      var sum: number = 0;

      slicedArray.forEach(car => {
         sum += car._previousVersionSpeed;
      });

      var avg: number = sum / slicedArray.length;

      if (avg == null || isNaN(avg) || slicedArray.length == 0) {
         try {
            var laneMaxSpeed: number = lane.maxSpeed;
         } catch (TypeError) {
            laneMaxSpeed = 0;
         }
         avg = laneMaxSpeed;
      }
      return avg;
   }

   private calculateLane(lanes: Lane[], cars: Car[]) {
      if (this.goalLane != null) {
         var carInFront = this.getCarsInFrontforLane(cars, this, this.goalLane);
         var carInBack = this.getCarInBackforLane(cars, this, this.goalLane);

         var doAccelerateinFront = this.doAccelerate(carInFront[0]);

         if (carInBack != null) {
            var doAccelerateinBack = carInBack.doAccelerate(this);
         } else {
            var doAccelerateinBack = true;
         }


         if (doAccelerateinBack && doAccelerateinFront) {
            var tempGoalLane = this.goalLane
            this._goalLane = null;

            return tempGoalLane;
         }
      }
      return this.highwayPosition.lane;
   }

   private getCarsInFront(cars: Car[], car: Car) {
      return this.getCarsInFrontforLane(cars, car, car.highwayPosition.lane);
   }

   private getCarsInFrontforLane(cars: Car[], car: Car, lane: Lane) {
      var carsInLane = cars.filter(c => c.highwayPosition.lane == lane);
      var carsAheadInLane = carsInLane.filter(c => c.highwayPosition.meter >= car.highwayPosition.meter && c != car);
      this.sortCarsByPosition(carsAheadInLane);

      return carsAheadInLane;
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

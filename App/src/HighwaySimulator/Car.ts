import P5 from "p5";
import Blinker from "./Blinker";
import HighwayPosition from "./HighwayPosition";
import Lane from "./Lane";
import LaneHelper from "./LaneHelper";
import LaneRecommendation from "./LaneRecommendation";

export default class Car {
   // car size from: https://www.bazonline.ch/autos-werden-immer-breiter-und-laenger-288912673833
   public static readonly LENGTH = 4.40;
   private static readonly WIDTH = 1.80;
   private static readonly DECELERATION = 8; // m/s^2 --> https://physikunterricht-online.de/jahrgang-10/bremsbewegungen/#:~:text=In%20einer%20realen%20Situation%20im,%2D1m%2Fs2%20sinken.
   private static readonly POWER = 117679.8; // Watt = 160 PS --> https://auto-wirtschaft.ch/news/4811-schweizerinnen-und-schweizer-mogen-ps-starke-autos#:~:text=Autos%20in%20der%20Schweiz%20sind%20mit%20durchschnittlich%20160,PS%2C%20am%20wenigsten%20die%20Tessiner%20mit%20145%20PS.
   private static readonly WEIGHT = 1723; // KG --> https://de.statista.com/statistik/daten/studie/787633/umfrage/durchschnittliches-leergewicht-neuer-personenwagen-in-der-schweiz/
   private static readonly CHECK_SWITCH_AFTER = 500; // KG --> https://de.statista.com/statistik/daten/studie/787633/umfrage/durchschnittliches-leergewicht-neuer-personenwagen-in-der-schweiz/
   private static readonly REQUIRED_SPEED_IMPROVEMENT_FOR_SWITCH_PERCENTAGE = 20; // in %
   private static readonly REQUIRED_SPEED_IMPROVEMENT_FOR_SWITCH_ABSOLUTE = 2; // in m/s
   private static readonly REQUIRED_REACTION_TIME_SECONDS = 2;
   private static readonly MUST_EXIT_HIGHWAY_COLOR = "#FF0000";

   private readonly _p5: P5;
   private readonly _highwayPosition: HighwayPosition;
   private readonly _color: P5.Color;
   private readonly _previousVersionSpeed: number; // the speed of the same care earlier in the calculation in m/s
   private readonly _previousVersionGoalLane: Lane;
   private readonly _mustLeaveTheHighway: boolean;
   private _checkSwitchInTicks: number;
   private _didBreakforSwitch: boolean;
   private _didBreakforFront: boolean;

   public get highwayPosition() {
      return this._highwayPosition;
   }

   public get checkSwitchInTicks() {
      return this._checkSwitchInTicks;
   }

   public get previousVersionSpeed() {
      return this._previousVersionSpeed;
   }

   public get previousVersionGoalLane() {
      return this._previousVersionGoalLane;
   }

   public get didBreakforSwitch() {
      return this._didBreakforSwitch;
   }

   public get didBreakforFront() {
      return this._didBreakforFront;
   }

   private get reactionTimeDistance() {
      return this._previousVersionSpeed * Car.REQUIRED_REACTION_TIME_SECONDS;
   }

   private get breakPath() {
      return Math.pow(this._previousVersionSpeed, 2) / (2 * Car.DECELERATION);
   }

   constructor(
      p5: P5,
      highwayPosition: HighwayPosition,
      color: P5.Color,
      previousVersionSpeed: number,
      previousVersionGoalLane: Lane,
      checkSwitchInTicks: number,
      mustLeaveTheHighway: boolean
   ) {
      this._p5 = p5;
      this._highwayPosition = highwayPosition;
      this._color = color;
      this._previousVersionSpeed = previousVersionSpeed;
      this._previousVersionGoalLane = previousVersionGoalLane;
      this._checkSwitchInTicks = checkSwitchInTicks;
      this._mustLeaveTheHighway = mustLeaveTheHighway;
   }

   public draw(position: P5.Vector, pixelsPerMeter: number) {
      const carPixelLength = Car.LENGTH * pixelsPerMeter;
      const carPixelWidth = Car.WIDTH * pixelsPerMeter;
      const positionX = position.x + carPixelLength / 2;

      this._p5.push();

      this._p5.noStroke();
      this._p5.rectMode("center");
      this._p5.fill(this._color);
      this._p5.rect(positionX, position.y, carPixelLength, carPixelWidth);

      const blinker = new Blinker(this._p5, this._highwayPosition.lane, this._previousVersionGoalLane);
      blinker.drawBlinkers(position, carPixelLength, carPixelWidth);

      if (this._mustLeaveTheHighway) {
         this._p5.fill(Car.MUST_EXIT_HIGHWAY_COLOR);
         this._p5.rect(positionX, position.y, carPixelLength / 4, carPixelWidth / 4);
      }

      this._p5.pop();
   }

   public drawBreakPathWithReactionTime(carPosition: P5.Vector, pixelsPerMeter: number) {
      const carPixelLength = Car.LENGTH * pixelsPerMeter;
      const carPixelWidth = Car.WIDTH * pixelsPerMeter;

      const breakPath = this.breakPath;
      const reactionTime = this.reactionTimeDistance
      const breakPathWithReactionTime = breakPath + reactionTime;

      const pixelSizeXBreakPathWithReactionTime = breakPathWithReactionTime * pixelsPerMeter;
      const pixelSizeY = 2;
      const pixelPositionX = carPosition.x + carPixelLength;
      const pixelPositionY = carPosition.y + carPixelWidth / 2;

      this._p5.push();

      this._p5.noStroke();
      this._p5.rectMode("corner");
      this._p5.fill(this._p5.color("coral"));
      this._p5.rect(pixelPositionX, pixelPositionY, pixelSizeXBreakPathWithReactionTime, pixelSizeY);

      this._p5.pop();
   }

   public createNextVersion(cars: Car[], lanes: Lane[], secondsBetweenCalculation: number): Car {
      // Makes it possible for a Car to stand still (With a minus speed)
      if (this._previousVersionSpeed < 0) {
         return this.clone();
      }

      const goalLane = this.calculateGoalLane(lanes, cars);
      const speed = this.calculateSpeed(cars, lanes, secondsBetweenCalculation)

      const lane = this.calculateLaneOfNextVersion(cars, goalLane);
      const meter = this.calculateMeterOfNextVersion(speed, secondsBetweenCalculation)
      const highwayPosition = new HighwayPosition(meter, lane)

      const isExitedHighway = lane.isExitLane && lane.end <= meter && lane.end > this.highwayPosition.meter;
      if(isExitedHighway){
         return null;
      }

      return new Car(
         this._p5,
         highwayPosition,
         this._color,
         speed,
         goalLane,
         this.checkSwitchInTicks,
         this._mustLeaveTheHighway
      );
   }

   private clone() {
      return new Car(
         this._p5,
         this._highwayPosition,
         this._color,
         this._previousVersionSpeed,
         this._previousVersionGoalLane,
         this._checkSwitchInTicks,
         this._mustLeaveTheHighway
      );
   }

   private calculateMeterOfNextVersion(speed: number, secondsBetweenCalculation: number) {
      var metersOfNextVersion = this.highwayPosition.meter + secondsBetweenCalculation * speed;

      return metersOfNextVersion;
   }

   private calculateSpeed(cars: Car[], lanes: Lane[], secondsBetweenCalculation: number) {
      const carInFront = this.getCarsInFront(cars, this)[0];
      const laneRight = lanes[this._highwayPosition.lane.id + 1];
      const laneLeft = lanes[this._highwayPosition.lane.id - 1];

      const doDecelerateToExit = (this._mustLeaveTheHighway) && this.highwayPosition.lane.isOnlyForNotExitingCarsAt(this.highwayPosition.meter, lanes)
      const doDecelerateToNotExit = (!this._mustLeaveTheHighway) && this.highwayPosition.lane.isOnlyForExitingCarsAt(this.highwayPosition.meter)
      const doAccelerate = this.doAccelerate(carInFront);
      const doAccelerateRight = (laneRight == null) || this.doAccelerateForLane(cars, laneRight);
      const doAccelerateLeft = (laneLeft == null) || this.doAccelerateForLane(cars, laneLeft);
      const doAccelerateForGoalLane = (this._previousVersionGoalLane == null) || this.doAccelerateForGoalLane(cars);

      this._didBreakforFront = !doAccelerate;
      this._didBreakforSwitch = !doAccelerateForGoalLane || !doAccelerateLeft || !doAccelerateRight || doDecelerateToExit || doDecelerateToNotExit;

      if (
         !doDecelerateToExit 
         && !doDecelerateToNotExit 
         && doAccelerate 
         && doAccelerateRight 
         && doAccelerateLeft 
         && doAccelerateForGoalLane
      ) {
         return this.calculateAcceleratedSpeed(secondsBetweenCalculation);
      } else {
         return this.calculateDeceleratedSpeed(secondsBetweenCalculation);
      }
   }

   private doAccelerateForLane(cars: Car[], lane: Lane) {
      var carInFrontforLane = this.getCarsInBreakRangeForLane(cars, this, lane)[0];
      if (carInFrontforLane == null) {
         return true;
      }
      if (carInFrontforLane.previousVersionGoalLane != this._highwayPosition.lane) {
         return true;
      }

      var doAccelerate = this.doAccelerate(carInFrontforLane);
      return doAccelerate;
   }

   private doAccelerateForGoalLane(cars: Car[]) {
      var carInFrontforLane = this.getCarsInFrontForLane(cars, this, this._previousVersionGoalLane)[0];
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

      const distanceToCarInFront = this.getDistanceBetween(carInFront)

      if (distanceToCarInFront <= 0) {
         return false;
      }

      // Cant use the following function when speed = 0 because of math
      if (this._previousVersionSpeed == 0 && distanceToCarInFront > 0) {
         return true
      }

      // Bremsweg: S = vo²/2a
      const breakPathSelf = this.breakPath;
      const breakPathInFront = carInFront.breakPath;

      const minimumRequiredDistance = this.reactionTimeDistance + breakPathSelf - breakPathInFront + (Car.LENGTH + 1);

      if (distanceToCarInFront > minimumRequiredDistance) {
         return true
      }

      return false
   }

   private calculateAcceleratedSpeed(secondsBetweenCalculation: number) {
      var speed: number = Math.sqrt(2 * (Math.pow(this._previousVersionSpeed, 2) * Car.WEIGHT / 2 + Car.POWER * secondsBetweenCalculation) / Car.WEIGHT); // E = 1/2mv^2 + P*t ; v = sqrt(2E/m)

      if (speed > this.highwayPosition.lane.maxSpeed) {
         speed = this.highwayPosition.lane.maxSpeed;
      }
      return speed
   }

   private calculateDeceleratedSpeed(secondsBetweenCalculation: number) {
      var speed: number = this._previousVersionSpeed - secondsBetweenCalculation * (Car.DECELERATION);

      if (speed < 0) {
         speed = 0
      }

      return speed
   }

   private calculateLaneRecommendations(lanes: Lane[], cars: Car[]): LaneRecommendation[] {
      const laneRecommendations = new Array();

      lanes.forEach(lane => {
         const laneRecommendation = this.calculateLaneRecommendation(lane, cars, lanes);

         laneRecommendations.push(laneRecommendation);
      });

      return laneRecommendations;
   }

   private calculateLaneRecommendation(lane: Lane, cars: Car[], lanes: Lane[]): LaneRecommendation {
      const laneRecommendation = new LaneRecommendation(lane);
      const meter = this.highwayPosition.meter;
      const currentLane = this.highwayPosition.lane;

      laneRecommendation.isAvailable = lane.isAvailableAt(meter);
      if (!laneRecommendation.isAvailable) {
         return laneRecommendation;
      }

      laneRecommendation.isLaneInRange = lane.id >= currentLane.id - 1 && lane.id <= currentLane.id + 1;
      if (!laneRecommendation.isLaneInRange) {
         return laneRecommendation;
      }

      laneRecommendation.isOnlyForExitingCars = lane.isOnlyForExitingCarsAt(meter);
      laneRecommendation.isOnlyForNotExitingCars = lane.isOnlyForNotExitingCarsAt(meter, lanes);

      laneRecommendation.isRecommendedForExitingCars = lane.isRecommendedForExitingCarsAt(meter, lanes);
      laneRecommendation.isRecommendedForNotExitingCars = lane.isRecommendedForNotExitingCarsAt(meter);

      laneRecommendation.estimatedSpeedOnLane = this.getExpectedSpeedforLane(cars, lane)

      return laneRecommendation;
   }

   private calculateGoalLane(lanes: Lane[], cars: Car[]): Lane {
      const laneRecommendations = this.calculateLaneRecommendations(lanes, cars);

      var possibleLaneRecommendations = laneRecommendations.filter(lr =>
         lr.isAvailable && lr.isLaneInRange
      );

      if (this._mustLeaveTheHighway) {
         possibleLaneRecommendations = possibleLaneRecommendations.filter(lr => !lr.isOnlyForNotExitingCars);
      } else {
         possibleLaneRecommendations = possibleLaneRecommendations.filter(lr => !lr.isOnlyForExitingCars);
      }

      if (possibleLaneRecommendations.length == 0) {
         console.error("No possible goal lane found for car", this, laneRecommendations.filter(lr =>
            lr.isAvailable && lr.isLaneInRange
         ));
         return null;
      }

      const bestRecommendedLaneRecommendation = this.getBestLaneRecommendation(possibleLaneRecommendations);

      // returns if current lane is not possible
      if (!this.currentLaneIsInPossibleRecommendations(possibleLaneRecommendations)) {
         return bestRecommendedLaneRecommendation.lane;
      }

      // returns if ticks are not ready
      if (this._checkSwitchInTicks > 0) {
         this._checkSwitchInTicks--;
         return null;
      }

      const recommendationForCurrentLane = this.calculateLaneRecommendation(this.highwayPosition.lane, cars, lanes);

      // returns if more recommended
      if (this._mustLeaveTheHighway) {
         if (!recommendationForCurrentLane.isRecommendedForExitingCars && bestRecommendedLaneRecommendation.isRecommendedForExitingCars) {
            return bestRecommendedLaneRecommendation.lane;
         }
      } else {
         if (!recommendationForCurrentLane.isRecommendedForNotExitingCars && bestRecommendedLaneRecommendation.isRecommendedForNotExitingCars) {
            return bestRecommendedLaneRecommendation.lane;
         }
      }

      const wantedImprovementFactor = 1 / 100 * (100 + Car.REQUIRED_SPEED_IMPROVEMENT_FOR_SWITCH_PERCENTAGE);
      const speedNeededForLaneSwitch = Math.max(wantedImprovementFactor * recommendationForCurrentLane.estimatedSpeedOnLane, recommendationForCurrentLane.estimatedSpeedOnLane + Car.REQUIRED_SPEED_IMPROVEMENT_FOR_SWITCH_ABSOLUTE);

      // returns if speed improvement big enough
      if (bestRecommendedLaneRecommendation.estimatedSpeedOnLane > speedNeededForLaneSwitch) {
         return bestRecommendedLaneRecommendation.lane;
      }

      // returns null to stay on current lane
      return null;
   }

   private getBestLaneRecommendation(possibleLaneRecommendations: LaneRecommendation[]) {
      if (this._mustLeaveTheHighway) {
         if (possibleLaneRecommendations.some(lr => lr.isRecommendedForExitingCars)) {
            possibleLaneRecommendations = possibleLaneRecommendations.filter(lr => lr.isRecommendedForExitingCars);
         }
      } else {
         if (possibleLaneRecommendations.some(lr => lr.isRecommendedForNotExitingCars)) {
            possibleLaneRecommendations = possibleLaneRecommendations.filter(lr => lr.isRecommendedForNotExitingCars);
         }
      }

      // fastest first
      possibleLaneRecommendations.sort((a, b) => {
         return b.estimatedSpeedOnLane - a.estimatedSpeedOnLane;
      });

      return possibleLaneRecommendations[0];
   }

   private currentLaneIsInPossibleRecommendations(possibleLaneRecommendations: LaneRecommendation[]) {
      return possibleLaneRecommendations.map(lr => lr.lane).some(l => l == this.highwayPosition.lane);
   }

   private getExpectedSpeedforLane(cars: Car[], lane: Lane) {
      if (lane == null || !lane.isAvailableAt(this.highwayPosition.meter)) {
         return 0;
      }

      const carsInFront = this.getCarsInFrontForLane(cars, this, lane);
      
      var lowestSpeed:number;
      if (carsInFront[0] == null) {
         lowestSpeed = lane.maxSpeed;
      } else {
         var carsInFrontfiltered = carsInFront.filter(c => c.highwayPosition.meter <= this.highwayPosition.meter + 100);
         lowestSpeed = this.calculateLowestSpeed(carsInFrontfiltered, 0, 5, lane);
      }

      return lowestSpeed;
   }

   private getDistanceBetween(carInFront: Car) {
      return carInFront.highwayPosition.meter - this._highwayPosition.meter - (Car.LENGTH + 1);
   }

   private calculateLowestSpeed(carsOfLane: Car[], start: number, end: number, lane: Lane) {
      if (lane == null || !lane.isAvailableAt(this.highwayPosition.meter)) {
         return 0;
      }

      const slicedArray = carsOfLane.slice(start, end);

      if (slicedArray[0] == null) {
         return lane.maxSpeed;
      }
      const sortedArray = slicedArray.sort(function (a, b) {
         return a.previousVersionSpeed - b.previousVersionSpeed;
      })

      if (sortedArray[0] == null) {
         return lane.maxSpeed;
      }
      return sortedArray[0].previousVersionSpeed;
   }

   private calculateLaneOfNextVersion(cars: Car[], goalLane: Lane) {
      if (goalLane == null) {
         return this.highwayPosition.lane;
      }

      var carInFront = this.getCarsInFrontForLane(cars, this, goalLane);
      var carInBack = this.getCarInBackForLane(cars, this, goalLane);

      var doAccelerateinFront = this.doAccelerate(carInFront[0]);

      var doAccelerateinBack = (carInBack == null) || carInBack.doAccelerate(this);

      if (doAccelerateinBack && doAccelerateinFront) {
         this._checkSwitchInTicks = Car.CHECK_SWITCH_AFTER;
         return goalLane;
      }

      return this.highwayPosition.lane;
   }

   private getCarsInFront(cars: Car[], car: Car) {
      return this.getCarsInFrontForLane(cars, car, car.highwayPosition.lane);
   }

   private getCarsInFrontForLane(cars: Car[], car: Car, lane: Lane) {
      var carsInLane = cars.filter(c => c.highwayPosition.lane == lane);
      var carsAheadInLane = carsInLane.filter(c => c.highwayPosition.meter >= car.highwayPosition.meter && c != car);
      this.sortCarsByPosition(carsAheadInLane);

      return carsAheadInLane;
   }

   private getCarsInBreakRangeForLane(cars: Car[], car: Car, lane: Lane) {
      var carsInLane = cars.filter(c => c.highwayPosition.lane == lane);
      var carsAheadInLane = carsInLane.filter(
         c => c.highwayPosition.meter >= car.highwayPosition.meter
            && c != car
            && car.getDistanceBetween(c) < car.reactionTimeDistance + car.breakPath - c.breakPath + (Car.LENGTH + 1)
            && car.getDistanceBetween(c) + 1 > car.reactionTimeDistance + car.breakPath - c.breakPath + (Car.LENGTH + 1)
      );
      this.sortCarsByPosition(carsAheadInLane);
      if (carsAheadInLane[0] == null) {
         return carsAheadInLane;
      }

      return carsAheadInLane;
   }

   private getCarInBackForLane(cars: Car[], car: Car, lane: Lane) {
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

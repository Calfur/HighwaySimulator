import Lane from "./Lane";

export default class LaneRecommendation {
   private readonly _lane: Lane;

   // only switch on lanes where these are true
   private _isAvailable: boolean;
   private _isLaneInRange: boolean;

   // try to switch, break if on such a lane
   private _isOnlyForExitingCars: boolean;
   private _isOnlyForNotExitingCars: boolean;

   // try to switch away if not recommended
   private _isRecommendedForExitingCars: boolean;
   private _isRecommendedForNotExitingCars: boolean;

   // take in consideration only if all other conditions are equal
   private _estimatedSpeedOnLane: number; // in m/s


   public get lane(){
      return this._lane;
   }

   public get isAvailable() {
      return this._isAvailable;
   }

   public set isAvailable(isAvailable) {
      this._isAvailable = isAvailable;
   }

   public get isLaneInRange() {
      return this._isLaneInRange;
   }

   public set isLaneInRange(isLaneInRange) {
      this._isLaneInRange = isLaneInRange;
   }

   public get isOnlyForExitingCars() {
      return this._isOnlyForExitingCars;
   }

   public set isOnlyForExitingCars(isOnlyForExitingCars) {
      this._isOnlyForExitingCars = isOnlyForExitingCars;
   }

   public get isOnlyForNotExitingCars() {
      return this._isOnlyForNotExitingCars;
   }

   public set isOnlyForNotExitingCars(isOnlyForNotExitingCars) {
      this._isOnlyForNotExitingCars = isOnlyForNotExitingCars;
   }

   public get isRecommendedForExitingCars() {
      return this._isRecommendedForExitingCars;
   }

   public set isRecommendedForExitingCars(isRecommendedForExitingCars) {
      this._isRecommendedForExitingCars = isRecommendedForExitingCars;
   }

   public get isRecommendedForNotExitingCars() {
      return this._isRecommendedForNotExitingCars;
   }

   public set isRecommendedForNotExitingCars(isRecommendedForNotExitingCars) {
      this._isRecommendedForNotExitingCars = isRecommendedForNotExitingCars;
   }

   public get estimatedSpeedOnLane() {
      return this._estimatedSpeedOnLane;
   }

   public set estimatedSpeedOnLane(estimatedSpeedOnLane) {
      this._estimatedSpeedOnLane = estimatedSpeedOnLane;
   }

   constructor(lane: Lane) {
      this._lane = lane;
   }
}

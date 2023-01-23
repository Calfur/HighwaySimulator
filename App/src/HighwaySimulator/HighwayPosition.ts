import Lane from "./Lane";

export default class HighwayPosition {
   private _meter: number;
   private _lane: Lane;

   public get meter() {
      return this._meter;
   }

   public get lane() {
      return this._lane;
   }

   public set meter(meter: number) {
      this._meter = meter;
   }

   public set lane(lane: Lane) {
      this._lane = lane;
   }

   constructor(meter: number, lane: Lane) {
      this._meter = meter;
      this._lane = lane;
   }
}
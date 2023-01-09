export default class HighwayPosition {
   private _meter: number;
   private _lane: number;

   public get meter() {
      return this._meter;
   }

   public get lane() {
      return this._lane;
   }

   public set meter(meter: number) {
      this._meter = meter;
   }

   public set lane(lane: number) {
      this._lane = lane;
   }

   constructor(meter: number, lane: number) {
      this._meter = meter;
      this._lane = lane;
   }
}

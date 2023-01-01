export default class HighwayPosition {
   private readonly _meter: number;
   private readonly _lane: number;

   public get meter() {
      return this._meter;
   }

   public get lane() {
      return this._lane;
   }

   constructor(meter: number, lane: number) {
      this._meter = meter;
      this._lane = lane;
   }
}

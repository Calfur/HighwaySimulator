import P5 from "p5";

export default class Lane {
   // Lane width from: https://www.saldo.ch/artikel/artikeldetail/mit-den-aussenspiegeln-wirds-eng-auf-der-ueberholspur/
   private static readonly LANE_WIDTH_IN_METERS = 3.5;
   private static readonly LANE_SPACING_IN_METERS = 0.3;
   private static readonly COLOR = "#575757";
   private static readonly MARKING_COLOR = "#FFF";

   private _p5: P5;
   private _id: number;
   private _maxSpeed: number; // in m/s
   private _isBreakdownLane: boolean;
   private _beginning: number;
   private _end: number;

   public get id() {
      return this._id;
   }

   public get maxSpeed() {
      return this._maxSpeed;
   }

   constructor(p5: P5, id: number, maxSpeed: number, isBreakdownLane: boolean,beginning?: number, end?: number) {
      this._p5 = p5;
      this._id = id;
      this._maxSpeed = maxSpeed;
      this._isBreakdownLane = isBreakdownLane;
      this._beginning = beginning;
      this._end = end;
   }
   public getLaneHeight(pixelsPerMeter: number) {
      return pixelsPerMeter * Lane.LANE_WIDTH_IN_METERS;
   }

   private getLaneSpacing(pixelsPerMeter: number) {
      return pixelsPerMeter * Lane.LANE_SPACING_IN_METERS;
   }

   public draw(firstLaneY: number, pixelsPerMeter: number, viewPositionXInMeter: number, totalXInMeters: number) {
      const beginningMeters = this._isBreakdownLane ? 0 : this._beginning; 
      const positionX = this.getDrawPositionX(beginningMeters, viewPositionXInMeter, pixelsPerMeter);
      const positionY = this.getLaneYTop(firstLaneY, pixelsPerMeter);

      const endPositionXInMeters = (this._isBreakdownLane || this._end == null) ? (viewPositionXInMeter + totalXInMeters) : this._end;
      const endPositionX = this.getDrawPositionX(endPositionXInMeters, viewPositionXInMeter, pixelsPerMeter);
      const sizeX = endPositionX - positionX;

      const laneHeight = this.getLaneHeight(pixelsPerMeter);

      this._p5.push();

      this._p5.noStroke();
      this._p5.rectMode("corner");

      this._p5.fill(Lane.COLOR);
      this._p5.rect(positionX, positionY, sizeX, laneHeight);

      if(this._beginning != 0){
         const positionX = this.getDrawPositionX(this._beginning, viewPositionXInMeter, pixelsPerMeter);
         this.drawMarking(pixelsPerMeter, positionX, positionY, laneHeight);
      }

      if(this._end != null){
         const positionX = this.getDrawPositionX(this._end, viewPositionXInMeter, pixelsPerMeter);
         this.drawMarking(pixelsPerMeter, positionX, positionY, laneHeight);
      }

      this._p5.pop();
   }

   private drawMarking(pixelsPerMeter: number, positionX: number, positionY: number, laneHeight: number) {
      const markingWidth = 0.2 * pixelsPerMeter;
      this._p5.fill(Lane.MARKING_COLOR);
      this._p5.rect(positionX, positionY, markingWidth, laneHeight);
   }

   public isAvailableAt(meter: number) {
      if (this._isBreakdownLane) {
         return true;
      }
      return meter >= this._beginning && meter <= (this._end || Number.MAX_VALUE);
   }

   public getLaneYTop(firstLaneY: number, pixelsPerMeter: number) {
      const laneSpacing = this.getLaneSpacing(pixelsPerMeter);
      const spaceUsedByPreviousLanes = this.id * (this.getLaneHeight(pixelsPerMeter) + laneSpacing);

      return firstLaneY + spaceUsedByPreviousLanes + this.getLaneSpacing(pixelsPerMeter);
   }

   public getLaneYCenter(firstLaneY: number, pixelsPerMeter: number) {
      return this.getLaneYTop(firstLaneY, pixelsPerMeter) + this.getLaneHeight(pixelsPerMeter) / 2;
   }

   private getDrawPositionX(meter: number, viewPositionXInMeter: number, pixelsPerMeter: number) {
      return (meter - viewPositionXInMeter) * pixelsPerMeter
   }
}

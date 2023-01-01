import P5 from "p5";
import Car from "./Car";

export default class Highway {
   // Lane width from: https://www.saldo.ch/artikel/artikeldetail/mit-den-aussenspiegeln-wirds-eng-auf-der-ueberholspur/
   private static readonly LANE_WIDTH_IN_METERS = 3.5;
   private static readonly LANE_SPACING_IN_METERS = 0.3;
   private static readonly BACKGROUND_COLOR = "#008f00";
   private static readonly LANE_COLOR = "#575757";

   private readonly _p5: P5;
   private readonly _position: P5.Vector;
   private readonly _size: P5.Vector;
   private readonly _lengthInMeter: number;
   private readonly _amountOfLanes: number;
   private readonly _cars: Car[];

   public get lane() {
      return this._position;
   }

   private get pixelsPerMeter() {
      return this._size.x / this._lengthInMeter;
   }

   private get laneHeight() {
      return this.pixelsPerMeter * Highway.LANE_WIDTH_IN_METERS;
   }

   private get laneSpacing() {
      return this.pixelsPerMeter * Highway.LANE_SPACING_IN_METERS;
   }

   constructor(p5: P5, position: P5.Vector, size: P5.Vector, xInMeter: number, amountOfLanes: number, cars: Car[]) {
      this._p5 = p5;
      this._position = position;
      this._size = size;
      this._lengthInMeter = xInMeter;
      this._amountOfLanes = amountOfLanes;
      this._cars = cars;
   }

   public draw() {
      this.drawBackground();

      for (let i = 0; i < this._amountOfLanes; i++) {
         this.drawLane(i);
      }

      this._cars.forEach(car => {
         const carPositionX = car.highwayPosition.meter * this.pixelsPerMeter;
         const carPositionY = this.getLaneYCenter(car.highwayPosition.lane);

         car.draw(this._p5.createVector(carPositionX, carPositionY), this.pixelsPerMeter);
      });
   }

   private drawBackground() {
      this._p5.push();

      this._p5.noStroke();
      this._p5.fill(Highway.BACKGROUND_COLOR);
      this._p5.rectMode("corner");
      this._p5.rect(this._position.x, this._position.y, this._size.x, this._size.y);

      this._p5.pop();
   }

   private drawLane(laneNumber: number) {
      const positionY = this.getLaneYTop(laneNumber);

      this._p5.push();

      this._p5.noStroke();
      this._p5.fill(Highway.LANE_COLOR);
      this._p5.rectMode("corner");
      this._p5.rect(this._position.x, positionY, this._size.x, this.laneHeight);

      this._p5.pop();
   }

   private getLaneYTop(laneNumber: number) {
      const spaceUsedByPreviousLanes = laneNumber * (this.laneHeight + this.laneSpacing);

      return this._position.y + spaceUsedByPreviousLanes + this.laneSpacing;
   }

   private getLaneYCenter(laneNumber: number) {
      return this.getLaneYTop(laneNumber) + this.laneHeight / 2;
   }
}

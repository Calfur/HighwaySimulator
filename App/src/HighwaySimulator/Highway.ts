import P5 from "p5";
import Car from "./Car";
import environment from '../Environments/RegularHightway.json';

export default class Highway {
   // Lane width from: https://www.saldo.ch/artikel/artikeldetail/mit-den-aussenspiegeln-wirds-eng-auf-der-ueberholspur/
   private static readonly LANE_WIDTH_IN_METERS = 3.5;
   private static readonly LANE_SPACING_IN_METERS = 0.3;
   private static readonly BACKGROUND_COLOR = "#008f00";
   private static readonly LANE_COLOR = "#575757";

   private readonly _p5: P5;
   private readonly _drawPosition: P5.Vector;
   private readonly _size: P5.Vector;
   private readonly _lengthInMeter: number;
   private readonly _viewPositionXInMeter: number;
   private readonly _amountOfLanes: number;
   private readonly _cars: Car[];

   private get pixelsPerMeter() {
      return this._size.x / this._lengthInMeter;
   }

   private get laneHeight() {
      return this.pixelsPerMeter * Highway.LANE_WIDTH_IN_METERS;
   }

   private get laneSpacing() {
      return this.pixelsPerMeter * Highway.LANE_SPACING_IN_METERS;
   }

   constructor(p5: P5, drawPosition: P5.Vector, size: P5.Vector, lengthInMeter: number, viewPositionXInMeter: number, amountOfLanes: number, cars: Car[]) {
      this._p5 = p5;
      this._drawPosition = drawPosition;
      this._size = size;
      this._lengthInMeter = lengthInMeter;
      this._viewPositionXInMeter = viewPositionXInMeter;
      this._amountOfLanes = amountOfLanes;
      this._cars = cars;
   }

   public draw() {
      this.drawBackground();

      this.drawLanes();

      this.drawSigns();

      this.drawCars();
   }

   private drawBackground() {
      this._p5.push();

      this._p5.noStroke();
      this._p5.fill(Highway.BACKGROUND_COLOR);
      this._p5.rectMode("corner");
      this._p5.rect(this._drawPosition.x, this._drawPosition.y, this._size.x, this._size.y);

      this._p5.pop();
   }

   private drawLanes() {
      for (let i = 0; i < this._amountOfLanes; i++) {
         this.drawLane(i);
      }
   }

   private drawSigns() {
      const firstSignPosition = this._viewPositionXInMeter - this._viewPositionXInMeter % 100 + 100;
      for (var i = 0; i * 100 < this._lengthInMeter; i++) {
         var positionXInMeters = firstSignPosition + i * 100;
         this.drawSign(positionXInMeters);
      }
   }

   private drawCars() {
      this._cars.forEach(car => {
         const carPositionX = this.getDrawPositionX(car.highwayPosition.meter);
         const carPositionY = this.getLaneYCenter(car.highwayPosition.lane.id);

         car.draw(this._p5.createVector(carPositionX, carPositionY), this.pixelsPerMeter);

         if(environment["debug"]){
            car.drawBreakPathWithReactionTime(this._p5.createVector(carPositionX, carPositionY), this.pixelsPerMeter);
         }
      });
   }

   private drawLane(laneNumber: number) {
      const positionY = this.getLaneYTop(laneNumber);

      this._p5.push();

      this._p5.noStroke();
      this._p5.fill(Highway.LANE_COLOR);
      this._p5.rectMode("corner");
      this._p5.rect(this._drawPosition.x, positionY, this._size.x, this.laneHeight);

      this._p5.pop();
   }

   private drawSign(positionXInMeters: number) {
      const text = `${positionXInMeters / 1000} km`;
      const textSize = 15;
      const positionX = this.getDrawPositionX(positionXInMeters);
      const positionY = this.getLaneYTop(this._amountOfLanes) + textSize * 0.8;

      this._p5.push();

      this._p5.fill("white");
      this._p5.textSize(textSize);
      this._p5.text(text, positionX, positionY);

      this._p5.pop();
   }

   private getLaneYTop(laneNumber: number) {
      const spaceUsedByPreviousLanes = laneNumber * (this.laneHeight + this.laneSpacing);

      return this._drawPosition.y + spaceUsedByPreviousLanes + this.laneSpacing;
   }

   private getLaneYCenter(laneNumber: number) {
      return this.getLaneYTop(laneNumber) + this.laneHeight / 2;
   }

   private getDrawPositionX(meter: number) {
      return (meter - this._viewPositionXInMeter) * this.pixelsPerMeter
   }
}

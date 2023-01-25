import P5 from "p5";
import Car from "./Car";
import JSONHandler from "./JSONConfigHandler";
import Lane from "./Lane";

export default class Highway {
   private static readonly BACKGROUND_COLOR = "#008f00";

   private readonly _p5: P5;
   private readonly _drawPosition: P5.Vector;
   private readonly _size: P5.Vector;
   private readonly _lengthInMeter: number;
   private readonly _viewPositionXInMeter: number;
   private readonly _lanes: Lane[];
   private readonly _cars: Car[];

   private get pixelsPerMeter() {
      return this._size.x / this._lengthInMeter;
   }

   constructor(p5: P5, drawPosition: P5.Vector, size: P5.Vector, lengthInMeter: number, viewPositionXInMeter: number, lanes: Lane[], cars: Car[]) {
      this._p5 = p5;
      this._drawPosition = drawPosition;
      this._size = size;
      this._lengthInMeter = lengthInMeter;
      this._viewPositionXInMeter = viewPositionXInMeter;
      this._lanes = lanes;
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
      this._lanes.forEach(lane => {
         lane.draw(this._drawPosition.y, this.pixelsPerMeter, this._viewPositionXInMeter, this._lengthInMeter);
      });
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
         this.drawCar(car)
      });
   }

   private drawSign(positionXInMeters: number) {
      const text = `${positionXInMeters / 1000} km`;
      const textSize = 15;
      const positionX = this.getDrawPositionX(positionXInMeters);
      const lastLane = this._lanes[this._lanes.length-1];
      const positionY = lastLane.getLaneYTop(this._drawPosition.y, this.pixelsPerMeter) + textSize * 0.8 + lastLane.getLaneHeight(this.pixelsPerMeter);

      this._p5.push();

      this._p5.fill("white");
      this._p5.textSize(textSize);
      this._p5.text(text, positionX, positionY);

      this._p5.pop();
   }

   private drawCar(car: Car) {
      const carPositionX = this.getDrawPositionX(car.highwayPosition.meter);
      const carPositionY = car.highwayPosition.lane.getLaneYCenter(this._drawPosition.y, this.pixelsPerMeter);

      car.draw(this._p5.createVector(carPositionX, carPositionY), this.pixelsPerMeter);

      if (JSONHandler.getInstance().getDebugState()) {
         car.drawBreakPathWithReactionTime(this._p5.createVector(carPositionX, carPositionY), this.pixelsPerMeter);
      }
   }

   private getDrawPositionX(meter: number) {
      return (meter - this._viewPositionXInMeter) * this.pixelsPerMeter
   }
}

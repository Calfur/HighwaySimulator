import P5 from "p5";
import Lane from "./Lane";

export default class Blinker {
   private readonly _p5: P5;
   private readonly _currentLane: Lane;
   private readonly _goalLane: Lane;
   private readonly _color: P5.Color;

   constructor(p5: P5, currentLane: Lane, goalLane: Lane) {
      this._p5 = p5;
      this._currentLane = currentLane;
      this._goalLane = goalLane;

      this._color = this._p5.color("rgb(255, 255, 0)")
   }

   private get isBlinkingLeft() {
      return this._currentLane.id - 1 == this._goalLane.id;
   }
   
   private get isBlinkingRight() {
      return this._currentLane.id + 1 == this._goalLane.id;
   }

   public drawBlinkers(carPosition: P5.Vector, carPixelLength: number, carPixelWidth: number) {
      if (this._goalLane != null) {
         const blinkerPixelWidth = carPixelWidth * 0.25;

         if (this.isBlinkingLeft) {
            const positionY = carPosition.y - carPixelWidth / 2;

            this.drawBlinker(carPosition.x, positionY, carPixelLength, blinkerPixelWidth);
         }

         if (this.isBlinkingRight) {
            const positionY = carPosition.y + carPixelWidth / 2 - blinkerPixelWidth;

            this.drawBlinker(carPosition.x, positionY, carPixelLength, blinkerPixelWidth);
         }
      }
   }

   private drawBlinker(positionX: number, positionY: number, sizeX: number, sizeY: number) {
      this._p5.rectMode("corner");
      this._p5.fill(this._color);
      this._p5.rect(positionX, positionY, sizeX, sizeY);
   }
}

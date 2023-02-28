import P5, { Vector } from "p5";

export default class SpeedSign {
   private static readonly SIZE = 2; // in meters

   private readonly _p5: P5;
   private readonly _speed: number;

   constructor(p5: P5, speed: number) {
      this._p5 = p5
      this._speed = speed;
   }

   public draw(position: Vector, pixelsPerMeter: number) {
      const textPosition = new Vector()
      textPosition.x = position.x + pixelsPerMeter * SpeedSign.SIZE / 8;
      textPosition.y = position.y + pixelsPerMeter * SpeedSign.SIZE / 8;

      this.drawSign(position, pixelsPerMeter);
      this.drawText(textPosition, pixelsPerMeter);
   }

   private drawSign(position: Vector, pixelsPerMeter: number) {
      this._p5.push();

      this._p5.fill("red");
      this._p5.circle(position.x, position.y, pixelsPerMeter * SpeedSign.SIZE)

      this._p5.pop();
   }

   private drawText(position: Vector, pixelsPerMeter: number) {
      this._p5.push();

      this._p5.fill("white");
      this._p5.textSize(pixelsPerMeter * SpeedSign.SIZE / 8 * 6);
      this._p5.text(this._speed, position.x, position.y);

      this._p5.pop();
   }
}
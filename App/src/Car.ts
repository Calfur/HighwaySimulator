import P5 from "p5";
import HighwayPosition from "./HighwayPosition";

export default class Car {
   // car size from: https://www.bazonline.ch/autos-werden-immer-breiter-und-laenger-288912673833
   private static readonly _length = 4.40;
   private static readonly _width = 1.80; 
   
   private readonly _p5: P5;
	private readonly _highwayPosition: HighwayPosition;
   private readonly _color: P5.Color;
   
   public get highwayPosition(){
      return this._highwayPosition;
   }

	constructor(p5: P5, highwayPosition: HighwayPosition, color: P5.Color) {
		this._p5 = p5;
		this._highwayPosition = highwayPosition;
      this._color = color;
	}

	public draw(position: P5.Vector, pixelsPerMeter: number) {
      const pixelLength = Car._length * pixelsPerMeter;
      const pixelWidth = Car._width * pixelsPerMeter;
      
		this._p5.push();

		this._p5.noStroke();
		this._p5.fill(this._color);
      this._p5.rectMode("center");
		this._p5.rect(position.x, position.y, pixelLength, pixelWidth);

		this._p5.pop();
	}
}

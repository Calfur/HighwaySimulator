import P5 from "p5";
import HighwayPosition from "./HighwayPosition";

export default class Car {
   // car size from: https://www.bazonline.ch/autos-werden-immer-breiter-und-laenger-288912673833
   private static readonly LENGTH = 4.40;
   private static readonly WIDTH = 1.80; 
   private static readonly ACCELERATION = 5; // m/s^2
   
   private readonly _p5: P5;
	private readonly _highwayPosition: HighwayPosition;
   private readonly _color: P5.Color;
   private readonly _speed: number; // m/s
   
   public get highwayPosition(){
      return this._highwayPosition;
   }

   public get color(){
      return this._color;
   }

	constructor(p5: P5, highwayPosition: HighwayPosition, color: P5.Color, speed: number) {
		this._p5 = p5;
		this._highwayPosition = highwayPosition;
      this._color = color;
      this._speed = speed;
	}

	public draw(position: P5.Vector, pixelsPerMeter: number) {
      const pixelLength = Car.LENGTH * pixelsPerMeter;
      const pixelWidth = Car.WIDTH * pixelsPerMeter;
      
		this._p5.push();

		this._p5.noStroke();
		this._p5.fill(this._color);
      this._p5.rectMode("center");
		this._p5.rect(position.x, position.y, pixelLength, pixelWidth);

		this._p5.pop();
	}

   public CalcNewSpeed(){
      return this._speed + Car.ACCELERATION; //TODO Algorythmus
   }

   public CalcNextPosition(){
      return this.highwayPosition.meter + this._speed;
   }
}

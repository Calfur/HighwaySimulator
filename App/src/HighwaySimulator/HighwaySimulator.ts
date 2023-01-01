import P5 from "p5";
import Car from "./Car";
import ConfigurationHandler from "./ConfigurationHandler";
import Highway from "./Highway";
import TrafficCalculator from "./TrafficCalculator";

export default class HighwaySimulator {
   private static readonly AMOUNT_OF_LANES = 2;
   
   private _canvasWidth: number;
   private _canvasHeight: number;
   private _trafficCalculator: TrafficCalculator;
   private _configurationHandler = new ConfigurationHandler();

   public load(){
      const sketch = (p5: P5) => {
         this._canvasWidth = p5.windowWidth - 50;
         this._canvasHeight = p5.windowHeight - 200;
         this._trafficCalculator = new TrafficCalculator(p5);
      
         this.setup(p5);
         this.draw(p5);
      };

      new P5(sketch);
   }

   private setup(p5: P5) {
      p5.setup = () => {
         const canvas = p5.createCanvas(this._canvasWidth, this._canvasHeight);
         canvas.parent("p5js-app");
      };
   }

   private draw(p5: P5) {
      p5.draw = () => {
         var requestedTime = this._configurationHandler.timeInSeconds();
         var closestAvailableTime = this._trafficCalculator.getClosestAvailableTime(requestedTime);
         var cars = this._trafficCalculator.getCarsAtTime(closestAvailableTime);

         this.drawMap(p5, cars);

         this.addTextForClosestAvailableTime(p5, closestAvailableTime, this._canvasHeight);
      };
   }

   private drawMap(p5: P5, cars: Car[]) {
      var mapPosition = p5.createVector(0, 0);
      var mapSize = p5.createVector(this._canvasWidth, this._canvasHeight);
      var mapXInMeters = this._configurationHandler.mapXInMeters();
   
      var map = new Highway(
         p5,
         mapPosition,
         mapSize,
         mapXInMeters,
         HighwaySimulator.AMOUNT_OF_LANES,
         cars
      );
   
      map.draw();
   }

   private addTextForClosestAvailableTime(p5: P5, seconds: number, canvasHeight: number) {
      p5.push();
   
      p5.fill("white");
      p5.textSize(20);
      p5.text(`Angezeigte Zeit: ${seconds.toString()} Sekunden`, 15, canvasHeight - 15);
   
      p5.pop();
   }
}

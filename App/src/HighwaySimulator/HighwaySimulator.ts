import P5 from "p5";
import AutoPlay from "./Autoplay";
import Car from "./Car";
import ConfigurationHandler from "./ConfigurationHandler";
import Highway from "./Highway";
import SimulatorStatistic from "./SimulatorStatistic";
import TrafficCalculator from "./TrafficCalculator";

export default class HighwaySimulator {
   private static readonly AMOUNT_OF_LANES = 2;

   private _canvasWidth: number;
   private _canvasHeight: number;
   private _trafficCalculator: TrafficCalculator;
   private _configurationHandler = new ConfigurationHandler();
   private _autoPlay = new AutoPlay(this._configurationHandler);
   private _calculationStarted = false;

   public load() {
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
         if (!this._calculationStarted) {
            this._trafficCalculator.calculateTraffic();
            this._calculationStarted = true;
         }

         const simulatorStatistic = new SimulatorStatistic(p5, this._canvasHeight);

         var requestedTime = this._configurationHandler.timeInSeconds;
         var closestAvailableTime = this._trafficCalculator.getClosestAvailableTime(requestedTime);
         var cars = this._trafficCalculator.getCarsAtTime(closestAvailableTime);

         this.drawMap(p5, cars);

         simulatorStatistic.addStatistic("Angezeigte Zeit", `${(Math.round(closestAvailableTime * 10) / 10).toString()} Sekunden`);
         simulatorStatistic.addStatistic("Anzahl Autos", cars.length.toString());

         simulatorStatistic.draw();
      };
   }

   private drawMap(p5: P5, cars: Car[]) {
      var mapPosition = p5.createVector(0, 0);
      var mapSize = p5.createVector(this._canvasWidth, this._canvasHeight);
      var mapXInMeters = this._configurationHandler.mapXInMeters;

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
}

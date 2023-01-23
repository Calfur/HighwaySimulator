import P5 from "p5";
import AutoPlay from "./AutoPlay";
import Car from "./Car";
import ConfigurationHandler from "./ConfigurationHandler";
import Highway from "./Highway";
import SimulatorStatistic from "./SimulatorStatistic";
import TrafficCalculator from "./TrafficCalculator";
import environment from '../Environments/RegularHightway.json';

export default class HighwaySimulator {
   private static readonly AMOUNT_OF_LANES = environment.lanes.length;
   
   private _canvasWidth: number;
   private _canvasHeight: number;
   private _trafficCalculator: TrafficCalculator;
   private _configurationHandler = new ConfigurationHandler();
   private _autoPlay = new AutoPlay(this._configurationHandler);
   private _calculationStarted = false;

   public load() {
      const sketch = (p5: P5) => {
         this._canvasWidth = p5.windowWidth - 50;
         this._canvasHeight = p5.windowHeight - 400;
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

         const requestedTime = this._configurationHandler.timeInSeconds;
         const closestAvailableTime = this._trafficCalculator.getClosestAvailableTime(requestedTime);
         const cars = this._trafficCalculator.getCarsAtTime(closestAvailableTime);

         this.drawMap(p5, cars);

         simulatorStatistic.addStatistic("Anzahl Autos", cars.length.toString());

         const heighestSpeed = this.getHeighestSpeed(cars);         
         simulatorStatistic.addStatistic("↑ Geschwindigkeit", `${(Math.round(heighestSpeed * 3.6)).toString()} km/h`);

         const averageSpeed = this.getAverageSpeed(cars);
         simulatorStatistic.addStatistic("Ø Geschwindigkeit", `${(Math.round(averageSpeed * 3.6)).toString()} km/h`);

         const lowestSpeed = this.getLowestSpeed(cars);
         simulatorStatistic.addStatistic("↓ Geschwindigkeit", `${(Math.round(lowestSpeed * 3.6)).toString()} km/h`);         

         const loadedTime = this._trafficCalculator.getLoadedTime();
         simulatorStatistic.addStatistic("Bereits berechnete Zeit", `${(Math.round(loadedTime)).toString()} Sekunden`);

         simulatorStatistic.draw();
      };
   }

   private drawMap(p5: P5, cars: Car[]) {
      var mapPosition = p5.createVector(0, 0);
      var mapSize = p5.createVector(this._canvasWidth, this._canvasHeight);
      var lengthInMeter = this._configurationHandler.mapSizeXInMeters;
      var viewPositionXInMeter = this._configurationHandler.mapPositionXInMeters;

      var map = new Highway(
         p5,
         mapPosition,
         mapSize,
         lengthInMeter,
         viewPositionXInMeter,
         HighwaySimulator.AMOUNT_OF_LANES,
         cars
      );

      map.draw();
   }

   private getAverageSpeed(cars: Car[]) {
      let sum = cars.reduce((a, b) => a + b.speed, 0);
      return sum / cars.length;
   }

   private getLowestSpeed(cars: Car[]) {
      return Math.min(...cars.map(car => car.speed));
   }

   private getHeighestSpeed(cars: Car[]) {
      return Math.max(...cars.map(car => car.speed));
   }
}

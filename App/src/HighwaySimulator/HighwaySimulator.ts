import P5 from "p5";
import AutoPlay from "./AutoPlay";
import Car from "./Car";
import UISliderHandler from "./UISliderHandler";
import Highway from "./Highway";
import SimulatorStatistic from "./SimulatorStatistic";
import TrafficCalculator from "./TrafficCalculator";
import JSONHandler from "./JSONConfigHandler";
import Lane from "./Lane";

export default class HighwaySimulator {
   private static readonly AMOUNT_OF_LANES = JSONHandler.getInstance().getSelectedEnvironment().lanes.length;
   
   private _canvasWidth: number;
   private _canvasHeight: number;
   private _trafficCalculator: TrafficCalculator;
   private _uiSliderHandler = new UISliderHandler();
   private _autoPlay = new AutoPlay(this._uiSliderHandler);

   public load() {
      const sketch = (p5: P5) => {
         this._canvasWidth = p5.windowWidth - 50;
         this._canvasHeight = p5.windowHeight - 400;

         this._trafficCalculator = new TrafficCalculator(p5);
         this._trafficCalculator.calculateTraffic();

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
         const simulatorStatistic = new SimulatorStatistic(p5, this._canvasHeight);

         const requestedTime = this._uiSliderHandler.timeInSeconds;
         const closestAvailableTime = this._trafficCalculator.getClosestAvailableTime(requestedTime);
         const cars = this._trafficCalculator.getCarsAtTime(closestAvailableTime);
         const lanes = this._trafficCalculator.lanes;

         this.drawMap(p5, cars, lanes);

         simulatorStatistic.addStatistic("Anzahl Autos", cars.length.toString());

         const heighestSpeed = this.getHeighestSpeed(cars);         
         simulatorStatistic.addStatistic("↑ Geschwindigkeit", `${(Math.round(heighestSpeed * 3.6)).toString()} km/h`);

         const averageSpeed = this.getAverageSpeed(cars);
         simulatorStatistic.addStatistic("Ø Geschwindigkeit", `${(Math.round(averageSpeed * 3.6)).toString()} km/h`);

         const lowestSpeed = this.getLowestSpeed(cars);
         simulatorStatistic.addStatistic("↓ Geschwindigkeit", `${(Math.round(lowestSpeed * 3.6)).toString()} km/h`);         

         const loadedTime = this._trafficCalculator.loadedTime;
         simulatorStatistic.addStatistic("Bereits berechnete Zeit", `${(Math.round(loadedTime)).toString()} Sekunden`);

         simulatorStatistic.draw();
      };
   }

   private drawMap(p5: P5, cars: Car[], lanes: Lane[]) {
      var mapPosition = p5.createVector(0, 0);
      var mapSize = p5.createVector(this._canvasWidth, this._canvasHeight);
      var lengthInMeter = this._uiSliderHandler.mapSizeXInMeters;
      var viewPositionXInMeter = this._uiSliderHandler.mapPositionXInMeters;

      var map = new Highway(
         p5,
         mapPosition,
         mapSize,
         lengthInMeter,
         viewPositionXInMeter,
         lanes,
         cars
      );

      map.draw();
   }

   private getAverageSpeed(cars: Car[]) {
      let sum = cars.reduce((a, b) => a + b.previousVersionSpeed, 0);
      return sum / cars.length;
   }

   private getLowestSpeed(cars: Car[]) {
      return Math.min(...cars.map(car => car.previousVersionSpeed));
   }

   private getHeighestSpeed(cars: Car[]) {
      return Math.max(...cars.map(car => car.previousVersionSpeed));
   }
}

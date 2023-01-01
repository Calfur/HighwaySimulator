import P5 from "p5";
import ConfigurationHandler from "./ConfigurationHandler";
import Highway from "./Highway";
import TrafficCalculator from "./TrafficCalculator";
import "./styles.scss";
import Car from "./Car";

const sketch = (p5: P5) => {

   const canvasWidth = p5.windowWidth - 50;
   const canvasHeight = p5.windowHeight - 200;
   var configurationHandler = new ConfigurationHandler();
   var trafficCalculator = new TrafficCalculator(p5);

   p5.setup = () => {
      const canvas = p5.createCanvas(canvasWidth, canvasHeight);
      canvas.parent("p5js-app");
   };

   p5.draw = () => {
      var seconds = configurationHandler.TimeInSeconds();
      var timeCars = trafficCalculator.getClosestStateAtTime(seconds);

      var mapSize = p5.createVector(canvasWidth, canvasHeight);
      drawMap(p5, mapSize, configurationHandler, timeCars.cars);

      addTextForCurrentlyShownSecond(p5, timeCars.seconds, canvasHeight);
   };
};

new P5(sketch);

function drawMap(p5: P5, mapSize: P5.Vector, configurationHandler: ConfigurationHandler, cars: Car[]) {
   var mapPosition = p5.createVector(0, 0);
   var mapXInMeters = configurationHandler.MapXInMeters();
   var amountOfLanes = 2;

   var map = new Highway(
      p5,
      mapPosition,
      mapSize,
      mapXInMeters,
      amountOfLanes,
      cars
   );

   map.draw();
}

function addTextForCurrentlyShownSecond(p5: P5, seconds: number, canvasHeight: number) {
   p5.push();

   p5.fill("white");
   p5.textSize(20);
   p5.text(`Angezeigte Zeit: ${seconds.toString()} Sekunden`, 15, canvasHeight - 15);

   p5.pop();
}

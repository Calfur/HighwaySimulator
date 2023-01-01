import P5 from "p5";
import Car from "./Car";
import ConfigurationHandler from "./ConfigurationHandler";
import Highway from "./Highway";
import HighwayPosition from "./HighwayPosition";
import "./styles.scss";
import TrafficCalculator from "./TrafficCalculator";

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

      var mapPosition = p5.createVector(0, 0);
      var mapSize = p5.createVector(canvasWidth, canvasHeight);
      var mapXInMeters = configurationHandler.MapXInMeters();
      var amountOfLanes = 2;

      var map = new Highway(
         p5,
         mapPosition,
         mapSize,
         mapXInMeters,
         amountOfLanes,
         timeCars.cars
      );

      map.draw();

      addTextForCurrentlyShownSecond(p5, timeCars.seconds, canvasHeight);
   };
};

new P5(sketch);

function addTextForCurrentlyShownSecond(p5: P5, seconds: number, canvasHeight: number) {
   p5.push();

   p5.fill("white");
   p5.textSize(20);
   p5.text(`Angezeigte Zeit: ${seconds.toString()} Sekunden`, 15, canvasHeight - 15);

   p5.pop();
}

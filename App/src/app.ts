import P5 from "p5";
import Car from "./Car";
import ConfigurationHandler from "./ConfigurationHandler";
import Highway from "./Highway";
import HighwayPosition from "./HighwayPosition";
import "./styles.scss";

const sketch = (p5: P5) => {

   const canvasWidth = p5.windowWidth - 50;
   const canvasHeight = p5.windowHeight - 200;
   var configurationHandler = new ConfigurationHandler();

   p5.setup = () => {
      const canvas = p5.createCanvas(canvasWidth, canvasHeight);
      canvas.parent("p5js-app");

      p5.background("gray");
   };

   p5.draw = () => {
      var cars = [
         new Car(p5, new HighwayPosition(10, 0), p5.color("red")),
         new Car(p5, new HighwayPosition(20, 0), p5.color("blue")),
         new Car(p5, new HighwayPosition(15, 1), p5.color("green")),
         new Car(p5, new HighwayPosition(30, 1), p5.color("yellow")),
      ];

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
         cars
      );

      map.draw();
   };
};

new P5(sketch);

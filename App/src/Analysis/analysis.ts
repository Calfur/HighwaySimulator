import P5 from "p5";
import Car from "../HighwaySimulator/Car";
import JSONHandler from "../HighwaySimulator/JSONConfigHandler";
import TrafficCalculator from "../HighwaySimulator/TrafficCalculator";
import { Chart } from "chart.js";
import { Spinner } from 'spin.js';
import "./analysis.scss";

const sketch = (p5: P5) => {
   p5.setup = () => {
      const canvas = p5.createCanvas(0, 0);
      canvas.parent("dumpForP5DoNotRemove");
   };
};

var p5 = new P5(sketch);

var simulations = new Array();



var opts = {
   lines: 13, // The number of lines to draw
   length: 38, // The length of each line
   width: 17, // The line thickness
   radius: 45, // The radius of the inner circle
   scale: 1, // Scales overall size of the spinner
   corners: 1, // Corner roundness (0..1)
   speed: 1, // Rounds per second
   rotate: 0, // The rotation offset
   animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
   direction: 1, // 1: clockwise, -1: counterclockwise
   color: '#ffffff', // CSS color or array of colors
   fadeColor: 'transparent', // CSS color or array of colors
   top: '50%', // Top position relative to parent
   left: '50%', // Left position relative to parent
   shadow: '0 0 1px transparent', // Box-shadow for the lines
   zIndex: 2000000000, // The z-index (defaults to 2e9)
   className: 'spinner', // The CSS class to assign to the spinner
   position: 'absolute', // Element positioning
};

var target = document.getElementById('spinner');
var spinner = new Spinner(opts).spin(target);

getSimulation(0);

async function getSimulation(i: number) {
   var environments = JSONHandler.getInstance().getEnvironments();
   var trafficCalculator = new TrafficCalculator(p5, environments[i]);
   trafficCalculator.calculateTraffic(callback);
}

function callback(arrayOfCars, environment) {
   var environments = JSONHandler.getInstance().getEnvironments();
   var i = environments.indexOf(environment);

   simulations.push([environment.name, arrayOfCars]);

   i++;
   if (i < environments.length) {
      getSimulation(i);
   } else {
      generateCharts(simulations);
   }
}

function generateCharts(simulations) {
   var datasets = [];

   var dataOfFirst = simulations[0][1];
   var seconds = dataOfFirst[dataOfFirst.length - 1].second;

   var labels = [];
   for (let i = 0; i < seconds; i++) {
      labels.push(i);
   }

   for (let i = 0; i < simulations.length; i++) {
      const element = simulations[i];

      var dataPoints = [];
      for (let j = 0; j < seconds; j++) {
         var dataOfSecond = simulations[i][1].filter(s => s.second == j);
         var cars: Car[] = dataOfSecond[0].cars;

         var totalMeters = 0;
         for (let index = 0; index < cars.length; index++) {
            totalMeters += cars[index].highwayPosition.meter;
         }

         dataPoints.push(totalMeters / cars.length);
      }

      var data = {
         data: dataPoints,
         label: element[0],
         fill: false
      }

      datasets.push(data);
   }

   console.log(datasets);

   new Chart(<HTMLCanvasElement>document.getElementById("time-meter-line-chart"), {
      type: 'line',
      data: {
         labels: labels,
         datasets: datasets
      },
      options: {
         plugins: {
            title: {
               display: true,
               text: 'Chart.js Line Chart - Cubic interpolation mode'
            },
         }
      }
   });

   spinner.stop();
}
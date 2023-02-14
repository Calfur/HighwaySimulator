import Chart from "chart.js/auto";
import P5 from "p5";
import Car from "../HighwaySimulator/Car";
import JSONHandler from "../HighwaySimulator/JSONConfigHandler";
import TrafficCalculator from "../HighwaySimulator/TrafficCalculator";
import "./analysis.scss";
import "./../styles.scss";

const sketch = (p5: P5) => {
   p5.setup = () => {
      const canvas = p5.createCanvas(0, 0);
      canvas.parent("dumpForP5DoNotRemove");
   };
};

// in ms
const liveChartUpdatesInterval = 1000;

const p5 = new P5(sketch);
const environments = JSONHandler.getInstance().getEnvironments();
const trafficCalculatorItems: { evironmentIndex: number, trafficCalculator: TrafficCalculator }[] = new Array();
var selectedEnvironments: number[] = new Array();
var chart1: Chart;
var chart2: Chart;
var chart3: Chart;
var liveChartUpdatesActive = false;


for (let i = 0; i < environments.length; i++) {
   const environment = environments[i];

   var checkbox = document.createElement('input');
   checkbox.type = 'checkbox';
   checkbox.id = i.toString();
   checkbox.name = environment.name;
   checkbox.value = i.toString();

   var label = document.createElement('label')
   label.htmlFor = i.toString();
   label.appendChild(document.createTextNode(environment.name));

   var br = document.createElement('br');

   var container = document.getElementById('checkBoxWrapper');
   container.appendChild(checkbox);
   container.appendChild(label);
   container.appendChild(br);
}

document.getElementById("getData").addEventListener("click", getData)

function getData() {
   selectedEnvironments = new Array();

   for (let i = 0; i < environments.length; i++) {
      var checkbox = <HTMLInputElement>document.getElementById(i.toString());
      if (checkbox.checked == true) {
         selectedEnvironments.push(i);
      }
   }

   callback();
};


async function getSimulation(environmentIndex: number) {
   const trafficCalculator = new TrafficCalculator(p5, environments[environmentIndex]);

   trafficCalculatorItems.push({ evironmentIndex: environmentIndex, trafficCalculator: trafficCalculator });

   trafficCalculator.calculateTraffic(callback);

   if (!liveChartUpdatesActive) {
      liveChartUpdatesActive = true;
      startLiveChartUpdates();
   }
}

function startLiveChartUpdates() {
   setTimeout(() => {
      if (liveChartUpdatesActive) {
         generateCharts()

         startLiveChartUpdates()
      }
   }, liveChartUpdatesInterval);
}

function callback() {
   const notLoadedSelectedEnvironments = selectedEnvironments.filter(
      s => trafficCalculatorItems.filter(
         t => t.evironmentIndex == s
      )[0] == null
   )

   if (notLoadedSelectedEnvironments.length != 0) {
      getSimulation(notLoadedSelectedEnvironments[0]);
   } else {
      liveChartUpdatesActive = false;
   }

   generateCharts();
}

function generateCharts() {
   const simulations = new Array();

   selectedEnvironments.forEach(selectedEnvironment => {
      const environment = environments[selectedEnvironment];
      const trafficCalculatorItem = trafficCalculatorItems.filter(t => t.evironmentIndex == selectedEnvironment)[0];

      if (trafficCalculatorItem != null) {
         const arrayOfCars = trafficCalculatorItem.trafficCalculator.carsAtTime;

         const simulation = { environmentName: environment.name, carsAtTime: arrayOfCars };
         simulations.push(simulation);
      }
   });

   generateLineMeterChart(simulations);
   generateLineSpeedChart(simulations);
   generateLineBreakChart(simulations);
}

function generateLineMeterChart(simulations: { environmentName: string, carsAtTime: { second: number, cars: Car[] }[] }[]) {
   var datasets = [];

   var seconds = getLastSecond();

   var labels = [];
   for (let i = 0; i <= seconds; i++) {
      labels.push(i);
   }

   for (let i = 0; i < simulations.length; i++) {
      const simulation = simulations[i];
      var initialAverage = 0;

      var dataPoints = [];
      for (let j = 0; j <= seconds; j++) {
         var dataOfSecond = simulations[i].carsAtTime.filter(s => s.second == j);
         if (dataOfSecond[0] != null) {
            var cars: Car[] = dataOfSecond[0].cars;

            var totalMeters = 0;
            for (let index = 0; index < cars.length; index++) {
               totalMeters += cars[index].highwayPosition.meter;
            }
            if (initialAverage == 0) {
               initialAverage = totalMeters / cars.length;
            }
            dataPoints.push((totalMeters / cars.length) - initialAverage);
         }
      }

      var data = {
         data: dataPoints,
         label: simulation.environmentName,
         fill: false
      }

      datasets.push(data);
   }

   if (chart1 != null) {
      chart1.destroy();
   }
   chart1 = new Chart(<HTMLCanvasElement>document.getElementById("time-meter-line-chart"), {
      type: 'line',
      data: {
         labels: labels,
         datasets: datasets
      },
      options: {
         scales: {
            y: {
               title: {
                  display: true,
                  text: 'Distanz in Meter'
               },
               beginAtZero: true
            },
            x: {
               title: {
                  display: true,
                  text: 'Zeit in Sekunden'
               },
               beginAtZero: true
            }
         },
         animation: false,
         plugins: {
            title: {
               display: true,
               text: 'Durchschnittliche Distanz pro Zeit'
            },
         }
      }
   });
}

function generateLineSpeedChart(simulations: { environmentName: string, carsAtTime: { second: number, cars: Car[] }[] }[]) {
   var datasets = [];

   var seconds = getLastSecond();

   var labels = [];
   for (let i = 0; i <= seconds; i++) {
      labels.push(i);
   }

   for (let i = 0; i < simulations.length; i++) {
      const simulation = simulations[i];

      var dataPoints = [];
      for (let j = 0; j <= seconds; j++) {
         var dataOfSecond = simulations[i].carsAtTime.filter(s => s.second == j);
         if (dataOfSecond[0] != null) {
            var cars: Car[] = dataOfSecond[0].cars;

            var totalSpeed = 0;
            for (let index = 0; index < cars.length; index++) {
               totalSpeed += cars[index].previousVersionSpeed * 3.6;
            }

            dataPoints.push(totalSpeed / cars.length);
         }
      }

      var data = {
         data: dataPoints,
         label: simulation.environmentName,
         fill: false
      }

      datasets.push(data);
   }

   if (chart2 != null) {
      chart2.destroy();
   }
   chart2 = new Chart(<HTMLCanvasElement>document.getElementById("time-speed-line-chart"), {
      type: 'line',
      data: {
         labels: labels,
         datasets: datasets
      },
      options: {
         scales: {
            y: {
               title: {
                  display: true,
                  text: 'Geschwindigkeit in km/h'
               },
               beginAtZero: true
            },
            x: {
               title: {
                  display: true,
                  text: 'Zeit in Sekunden'
               },
               beginAtZero: true
            }
         },
         animation: false,
         plugins: {
            title: {
               display: true,
               text: 'Durchschnittliche Geschwindigkeit pro Zeit'
            },
         }
      }
   });
}

function generateLineBreakChart(simulations: { environmentName: string, carsAtTime: { second: number, cars: Car[] }[] }[]) {
   var datasets = [];

   var seconds = getLastSecond();

   var labels = [];
   for (let i = 0; i <= seconds; i++) {
      labels.push(i);
   }

   for (let i = 0; i < simulations.length; i++) {
      const simulation = simulations[i];

      var dataPointsFront = [];
      var dataPointsSwitch = [];
      for (let j = 0; j <= seconds; j++) {
         var dataOfSecond = simulations[i].carsAtTime.filter(s => s.second == j);
         if (dataOfSecond[0] != null) {
            var cars: Car[] = dataOfSecond[0].cars;

            var totalBreaksforFront = 0;
            var totalBreaksforSwitch = 0;
            for (let index = 0; index < cars.length; index++) {
               if (cars[index].didBreakforFront) {
                  totalBreaksforFront += 1;
               }
               if (cars[index].didBreakforSwitch) {
                  totalBreaksforSwitch += 1;
               }
            }

            dataPointsFront.push(totalBreaksforFront);
            dataPointsSwitch.push(totalBreaksforSwitch);
         }
      }

      var dataBreak = {
         data: dataPointsFront,
         label: simulation.environmentName + ' Bremsen durch Stau',
         fill: false
      }
      var dataSwitch = {
         data: dataPointsSwitch,
         label: simulation.environmentName + ' Bremsen durch Fahrbahnwechsel',
         fill: false
      }

      datasets.push(dataBreak);
      datasets.push(dataSwitch);
   }

   if (chart3 != null) {
      chart3.destroy();
   }
   chart3 = new Chart(<HTMLCanvasElement>document.getElementById("time-break-line-chart"), {
      type: 'line',
      data: {
         labels: labels,
         datasets: datasets
      },
      options: {
         scales: {
            y: {
               title: {
                  display: true,
                  text: 'Ticks gebremst'
               },
               beginAtZero: true
            },
            x: {
               title: {
                  display: true,
                  text: 'Zeit in Sekunden'
               },
               beginAtZero: true
            }
         },
         animation: false,
         plugins: {
            title: {
               display: true,
               text: 'Bremsungen aufgrund Stau/Spurwechsel'
            },
         }
      }
   });
}

function getLastSecond() {
   return TrafficCalculator.MAX_SECONDS_TO_CALCULATE;
}

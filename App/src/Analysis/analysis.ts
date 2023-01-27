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

const p5 = new P5(sketch);
const environments = JSONHandler.getInstance().getEnvironments();
const trafficCalculatorItems: {evironmentIndex: number, trafficCalculator: TrafficCalculator}[] = new Array();
var selectedEnvironments:number[] = new Array();
var simulations = new Array();
var chart1: Chart;
var chart2: Chart;
var chart3: Chart;



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
	simulations = new Array();
	for (let i = 0; i < environments.length; i++) {
		var checkbox = <HTMLInputElement>document.getElementById(i.toString());
		if (checkbox.checked == true) {
			selectedEnvironments.push(i);
		}
	}
	console.log(selectedEnvironments);
	getSimulation(selectedEnvironments[0]);
};


async function getSimulation(environmentIndex: number) {
   var trafficCalculatorItem = trafficCalculatorItems.filter(t => t.evironmentIndex == environmentIndex)[0]
   if(trafficCalculatorItem != null){
      callback();
      return;
   }

	const trafficCalculator = new TrafficCalculator(p5, environments[environmentIndex]);

   trafficCalculatorItems.push({evironmentIndex: environmentIndex, trafficCalculator: trafficCalculator});

	trafficCalculator.calculateTraffic(callback);
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
      selectedEnvironments.forEach(selectedEnvironment => {
         const environment = environments[selectedEnvironment];
         const arrayOfCars = trafficCalculatorItems.filter(t => t.evironmentIndex == selectedEnvironment)[0].trafficCalculator.carsAtTime;
	      simulations.push([environment.name, arrayOfCars]);
      });

		generateCharts(simulations);
	}
}

function generateCharts(simulations) {
	generateLineMeterChart(simulations);
	generateLineSpeedChart(simulations);
	generateLineBreakChart(simulations);
}

function generateLineMeterChart(simulations) {
	var datasets = [];

	var dataOfFirst = simulations[0][1];
	var seconds = dataOfFirst[dataOfFirst.length - 1].second;
	var initialAverage = 0;

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
			if (initialAverage == 0) {
				initialAverage = totalMeters / cars.length;
			}
			dataPoints.push((totalMeters / cars.length)-initialAverage);
		}

		var data = {
			data: dataPoints,
			label: element[0],
			fill: false
		}

		datasets.push(data);
	}

	console.log(datasets);

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
					title:{
						display: true,
						text: 'Distanz in Meter'
					},
					beginAtZero: true
				},
				x: {
					title:{
						display: true,
						text: 'Zeit in Sekunden'
					},
					beginAtZero: true
				}	
			},
			plugins: {
				title: {
					display: true,
					text: 'Durchschnittliche Distanz pro Zeit'
				},
			}
		}
	});
}

function generateLineSpeedChart(simulations) {
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

			var totalSpeed = 0;
			for (let index = 0; index < cars.length; index++) {
				totalSpeed += cars[index].previousVersionSpeed * 3.6;
			}

			dataPoints.push(totalSpeed / cars.length);
		}

		var data = {
			data: dataPoints,
			label: element[0],
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
					title:{
						display: true,
						text: 'Geschwindigkeit in km/h'
					},
					beginAtZero: true
				},
				x: {
					title:{
						display: true,
						text: 'Zeit in Sekunden'
					},
					beginAtZero: true
				}	
			},
			plugins: {
				title: {
					display: true,
					text: 'Durchschnittliche Geschwindigkeit pro Zeit'
				},
			}
		}
	});
}
function generateLineBreakChart(simulations) {
	var datasets = [];

	var dataOfFirst = simulations[0][1];
	var seconds = dataOfFirst[dataOfFirst.length - 1].second;

	var labels = [];
	for (let i = 0; i < seconds; i++) {
		labels.push(i);
	}

	for (let i = 0; i < simulations.length; i++) {
		const element = simulations[i];

		var dataPointsFront = [];
		var dataPointsSwitch = [];
		for (let j = 0; j < seconds; j++) {
			var dataOfSecond = simulations[i][1].filter(s => s.second == j);
			var cars: Car[] = dataOfSecond[0].cars;

			var totalBreaksforFront = 0;
			var totalBreaksforSwitch = 0;
			for (let index = 0; index < cars.length; index++) {
				totalBreaksforFront += cars[index].didBreakforSwitch * 3.6;
				totalBreaksforSwitch += cars[index].didBreakforSwitch * 3.6;
			}

			dataPointsFront.push(totalBreaksforFront / cars.length);
			dataPointsFront.push(totalBreaksforSwitch / cars.length);
		}

		var dataBreak = {
			data: dataPointsFront,
			label: element[0] + ' Bremsen durch Stau',
			fill: false
		}
		var dataSwitch = {
			data: dataPointsSwitch,
			label: element[0] + ' Bremsen durch Fahrbahnwechsel',
			fill: false
		}

		datasets.push(dataBreak);
		datasets.push(dataSwitch);
	}

	console.log(datasets);

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
					title:{
						display: true,
						text: 'Geschwindigkeit in km/h'
					},
					beginAtZero: true
				},
				x: {
					title:{
						display: true,
						text: 'Zeit in Sekunden'
					},
					beginAtZero: true
				}	
			},
			plugins: {
				title: {
					display: true,
					text: 'Durchschnittliche Geschwindigkeit pro Zeit'
				},
			}
		}
	});
}

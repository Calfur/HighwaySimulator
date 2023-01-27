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

var p5 = new P5(sketch);
var environments = JSONHandler.getInstance().getEnvironments();
var selectedEnvironments = new Array();
var simulations = new Array();
var chart1: Chart;
var chart2: Chart;



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
			selectedEnvironments.push(environments[i]);
		}
	}
	console.log(selectedEnvironments);
	getSimulation(0);
};


async function getSimulation(i: number) {
	var trafficCalculator = new TrafficCalculator(p5, selectedEnvironments[i]);
	trafficCalculator.calculateTraffic(callback);
}

function callback(arrayOfCars, environment) {
	var i = selectedEnvironments.indexOf(environment);
	simulations.push([environment.name, arrayOfCars]);

	i++;
	if (i < selectedEnvironments.length) {
		getSimulation(i);
	} else {
		generateCharts(simulations);
	}
}

function generateCharts(simulations) {
	generateLineMeterChart(simulations);
	generateLineSpeedChart(simulations);
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

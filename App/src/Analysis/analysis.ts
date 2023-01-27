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
	var simulations = new Array();
	for (let i = 0; i < environments.length; i++) {
		var checkbox = <HTMLInputElement>document.getElementById(i.toString());
		if (checkbox.checked == true) {
			selectedEnvironments.push(environments[i]);
		}
	}
	console.log(selectedEnvironments)
	getSimulation(0);
};


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
			plugins: {
				title: {
					display: true,
					text: 'Chart.js Line Chart - Cubic interpolation mode'
				},
			}
		}
	});
}

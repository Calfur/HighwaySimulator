import HighwaySimulator from "./HighwaySimulator/HighwaySimulator";
import ConfigHandler from "./HighwaySimulator/JSONConfigHandler";
import "./styles.scss";

const configHandlerInstance:ConfigHandler = ConfigHandler.getInstance();
const environments = configHandlerInstance.getEnvironments();

const variantSelection = document.getElementById('variantSelection');

var htmlText:string = "<ul>";
environments.forEach(environment => {
    htmlText += "<li><a href=/?environment=" + environment.name + ">" + environment.name + "</a></li>"
}); 
htmlText += "</ul>";

variantSelection.innerHTML = htmlText;

const title = document.getElementById('title');
title.innerHTML = "Autobahn Simulator - " + configHandlerInstance.getSelectedEnvironment().name;

var highwaySimulator = new HighwaySimulator();
highwaySimulator.load();

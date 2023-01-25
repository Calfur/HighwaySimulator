import HighwaySimulator from "./HighwaySimulator/HighwaySimulator";
import ConfigHandler from "./HighwaySimulator/JSONConfigHandler";
import "./styles.scss";

const configHandlerInstance:ConfigHandler = ConfigHandler.getInstance();
const environments = configHandlerInstance.getEnvironments();
const variantSelection = document.getElementById('variantSelection');

var htmlText:string = "";
environments.forEach(environment => {
    htmlText += "<a href=/?environment=" + environment.name + ">Variante: " + environment.name + "</a></br>"
}); 

variantSelection.innerHTML = htmlText;

var highwaySimulator = new HighwaySimulator();
highwaySimulator.load();

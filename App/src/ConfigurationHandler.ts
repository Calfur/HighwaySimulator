
export default class ConfigurationHandler {

   constructor(){
      const input = <HTMLInputElement>document.querySelector("#map-x-in-meters");
      const valueOutputElement = document.querySelector("#map-x-in-meters-value");
      
      input.addEventListener("input", (event) => {
         valueOutputElement.textContent = (<HTMLInputElement>event.target).value
       })
   }

   public MapXInMeters(): number {
      const input = <HTMLInputElement>document.querySelector("#map-x-in-meters");

      return parseFloat(input.value);
   }
}

export default class ConfigurationHandler {
   private static MAP_X_IN_METERS_INPUT_SELECTOR = "#map-x-in-meters";
   private static TIME_IN_SECONDS_INPUT_SELECTOR = "#time-in-seconds";
   private static MAP_X_IN_METERS_OUTPUT_SELECTOR = "#map-x-in-meters-value";
   private static TIME_IN_SECONDS_OUTPUT_SELECTOR = "#time-in-seconds-value";

   private readonly _rangeInputOutputs: { inputSelector: string, outputSelector: string }[] = [
      {
         inputSelector: ConfigurationHandler.MAP_X_IN_METERS_INPUT_SELECTOR,
         outputSelector: ConfigurationHandler.MAP_X_IN_METERS_OUTPUT_SELECTOR
      },
      {
         inputSelector: ConfigurationHandler.TIME_IN_SECONDS_INPUT_SELECTOR,
         outputSelector: ConfigurationHandler.TIME_IN_SECONDS_OUTPUT_SELECTOR
      }
   ];

   constructor() {
      this.addRangeInputEventListeners();
   }

   public get mapXInMeters() {
      const input = <HTMLInputElement>document.querySelector(ConfigurationHandler.MAP_X_IN_METERS_INPUT_SELECTOR);

      return parseFloat(input.value);
   }

   public get timeInSeconds() {
      const input = <HTMLInputElement>document.querySelector(ConfigurationHandler.TIME_IN_SECONDS_INPUT_SELECTOR);

      return parseFloat(input.value);
   }

   public set timeInSeconds(value: number) {
      const input = <HTMLInputElement>document.querySelector(ConfigurationHandler.TIME_IN_SECONDS_INPUT_SELECTOR);
      const output = document.querySelector(ConfigurationHandler.TIME_IN_SECONDS_OUTPUT_SELECTOR);

      var roundedValue = Math.round(value * 10)/10;

      input.value = roundedValue.toString();
      output.textContent = input.value;
   }

   private addRangeInputEventListeners() {
      this._rangeInputOutputs.forEach(rangeInputOutput => {
         this.addRangeInputEventListener(rangeInputOutput.inputSelector, rangeInputOutput.outputSelector);
      });
   }

   private addRangeInputEventListener(inputSelector: string, outputSelector: string) {
      const input = <HTMLInputElement>document.querySelector(inputSelector);
      const output = document.querySelector(outputSelector);

      input.onchange = (event) => {
         output.textContent = (<HTMLInputElement>event.target).value;
      };
   }
}

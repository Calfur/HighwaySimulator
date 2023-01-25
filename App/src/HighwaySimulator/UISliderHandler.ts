
export default class UISliderHandler {
   private static MAP_SIZE_X_IN_METERS_INPUT_SELECTOR = "#map-size-x-in-meters";
   private static MAP_SIZE_X_IN_METERS_OUTPUT_SELECTOR = "#map-size-x-in-meters-value";
   private static MAP_POSITION_X_IN_METERS_INPUT_SELECTOR = "#map-position-x-in-meters";
   private static MAP_POSITION_X_IN_METERS_OUTPUT_SELECTOR = "#map-position-x-in-meters-value";
   private static TIME_IN_SECONDS_INPUT_SELECTOR = "#time-in-seconds";
   private static TIME_IN_SECONDS_OUTPUT_SELECTOR = "#time-in-seconds-value";

   private readonly _rangeInputOutputs: { inputSelector: string, outputSelector: string }[] = [
      {
         inputSelector: UISliderHandler.MAP_SIZE_X_IN_METERS_INPUT_SELECTOR,
         outputSelector: UISliderHandler.MAP_SIZE_X_IN_METERS_OUTPUT_SELECTOR,
      },
      {
         inputSelector: UISliderHandler.MAP_POSITION_X_IN_METERS_INPUT_SELECTOR,
         outputSelector: UISliderHandler.MAP_POSITION_X_IN_METERS_OUTPUT_SELECTOR
      },
      {
         inputSelector: UISliderHandler.TIME_IN_SECONDS_INPUT_SELECTOR,
         outputSelector: UISliderHandler.TIME_IN_SECONDS_OUTPUT_SELECTOR
      }
   ];

   constructor() {
      this.addRangeInputEventListeners();
   }

   public get mapSizeXInMeters() {
      const input = <HTMLInputElement>document.querySelector(UISliderHandler.MAP_SIZE_X_IN_METERS_INPUT_SELECTOR);
      const output = document.querySelector(UISliderHandler.MAP_SIZE_X_IN_METERS_OUTPUT_SELECTOR);

      output.textContent = input.value;

      return parseFloat(input.value);
   }

   public get mapPositionXInMeters() {
      const input = <HTMLInputElement>document.querySelector(UISliderHandler.MAP_POSITION_X_IN_METERS_INPUT_SELECTOR);
      const output = document.querySelector(UISliderHandler.MAP_POSITION_X_IN_METERS_OUTPUT_SELECTOR);

      output.textContent = input.value;

      return parseFloat(input.value);
   }

   public get timeInSeconds() {
      const input = <HTMLInputElement>document.querySelector(UISliderHandler.TIME_IN_SECONDS_INPUT_SELECTOR);
      const output = document.querySelector(UISliderHandler.TIME_IN_SECONDS_OUTPUT_SELECTOR);

      output.textContent = input.value;

      return parseFloat(input.value);
   }

   public set timeInSeconds(value: number) {
      const input = <HTMLInputElement>document.querySelector(UISliderHandler.TIME_IN_SECONDS_INPUT_SELECTOR);
      const output = document.querySelector(UISliderHandler.TIME_IN_SECONDS_OUTPUT_SELECTOR);

      input.value = (Math.round(value * 100) / 100).toString();
      output.textContent = (Math.round(value * 10) / 10).toString();
   }

   private addRangeInputEventListeners() {
      for (const rangeInputOutput of this._rangeInputOutputs) {
         this.addRangeInputEventListener(rangeInputOutput.inputSelector, rangeInputOutput.outputSelector);
      };
   }

   private addRangeInputEventListener(inputSelector: string, outputSelector: string) {
      const input = <HTMLInputElement>document.querySelector(inputSelector);
      const output = document.querySelector(outputSelector);

      input.onchange = (event) => {
         output.textContent = (<HTMLInputElement>event.target).value;
      };
   }
}

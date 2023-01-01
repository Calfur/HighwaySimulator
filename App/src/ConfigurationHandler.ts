
export default class ConfigurationHandler {
   private readonly _rangeInputOutputs: { inputId: string, outputId: string }[] = [
      { inputId: "#map-x-in-meters", outputId: "#map-x-in-meters-value" },
      { inputId: "#time-in-seconds", outputId: "#time-in-seconds-value" }
   ];

   constructor() {
      this.addRangeInputEventListeners();
   }

   public MapXInMeters() {
      const input = <HTMLInputElement>document.querySelector("#map-x-in-meters");

      return parseFloat(input.value);
   }

   public TimeInSeconds() {
      const input = <HTMLInputElement>document.querySelector("#time-in-seconds");

      return parseFloat(input.value);
   }

   private addRangeInputEventListeners() {
      this._rangeInputOutputs.forEach(rangeInputOutput => {
         this.addRangeInputEventListener(rangeInputOutput);
      });
   }

   private addRangeInputEventListener(rangeInputOutput: { inputId: string; outputId: string; }) {
      const inputElement = <HTMLInputElement>document.querySelector(rangeInputOutput.inputId);
      const outputElement = document.querySelector(rangeInputOutput.outputId);

      inputElement.addEventListener("input", (event) => {
         outputElement.textContent = (<HTMLInputElement>event.target).value;
      });
   }
}

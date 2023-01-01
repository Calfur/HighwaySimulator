import P5 from "p5";

export default class SimulatorStatistic {
   private readonly _statistics: { description: string, value: string }[] = new Array();
   private readonly _p5: P5;
   private readonly _canvasHeight: number;

   constructor(p5: P5, canvasHeight: number){
      this._p5 = p5;
      this._canvasHeight = canvasHeight;
   }

   public addStatistic(description: string, value: string) {
      this._statistics.push({description: description, value: value});
   }

   public draw(){
      this._statistics.forEach((statistic, index) => {
         this.drawStatistic(statistic.description, statistic.value, index);
      });
   }

   private drawStatistic(description: string, value: string, index: number) {
      const positionX = 15;
      const height = 20;
      const spaceBetween = 15;

      this._p5.push();
   
      this._p5.fill("white");
      this._p5.textSize(20);
      this._p5.text(`${description}: ${value}`, positionX, this._canvasHeight - spaceBetween - index * (height + spaceBetween));
   
      this._p5.pop();
   }
}

export default class AutoPlay {
   private static CONTROL_CLASS = ".play-pause-btn";

   constructor() {
      const control = <HTMLElement>document.querySelector(AutoPlay.CONTROL_CLASS);
      control.onclick = () => {
         console.log("clicked");
      };
   }
}
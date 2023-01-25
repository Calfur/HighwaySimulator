import UISliderHandler from "./UISliderHandler";

export default class AutoPlay {
   private static readonly PLAY_PAUSE_SELECTOR = ".play-pause-button";
   private static readonly PAUSE_SELECTOR = ".pause-button";
   private static readonly TIMEOUT = 10;

   private readonly _uiSliderHandlerHandler: UISliderHandler;
   private _lastUpdateTime: number;

   private _isPlaying = false;

   constructor(uiSliderHandler: UISliderHandler) {
      this._uiSliderHandlerHandler = uiSliderHandler;

      this.loadPlayPauseButtons();
      this.loadPauseButtons();
      this.loadPlayer();
   }

   private loadPlayPauseButtons() {
      const controls = <NodeListOf<HTMLElement>>document.querySelectorAll(AutoPlay.PLAY_PAUSE_SELECTOR);

      controls.forEach((control: HTMLElement) => {
         this.loadPlayPauseButton(control);
      });
   }

   private loadPlayPauseButton(control: HTMLElement) {
      control.onclick = () => {
         this._isPlaying = !this._isPlaying;
      };
   }

   private loadPauseButtons() {
      const controls = <NodeListOf<HTMLElement>>document.querySelectorAll(AutoPlay.PAUSE_SELECTOR);

      controls.forEach((control: HTMLElement) => {
         this.loadPauseButton(control);
      });
   }

   private loadPauseButton(control: HTMLElement) {
      control.onclick = () => {
         this._isPlaying = false;
      };
   }

   private loadPlayer() {
      setInterval(() => {
         if (this._isPlaying) {
            this._uiSliderHandlerHandler.timeInSeconds += (Date.now() - this._lastUpdateTime) / 1000;
         }
         this._lastUpdateTime = Date.now();
      }, AutoPlay.TIMEOUT);
   }
}

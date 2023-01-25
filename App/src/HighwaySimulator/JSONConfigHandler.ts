import JSON from '../Environments/RegularHightway.json';

export default class JSONHandler {
   private static instance: JSONHandler;
   private readonly debug: boolean = JSON.debug;
   private readonly environments = JSON.environments;
   private readonly searchParams = new URLSearchParams(window.location.search);

   private constructor() { }

   public static getInstance(): JSONHandler {
      if (!JSONHandler.instance) {
         JSONHandler.instance = new JSONHandler();
      }
      return JSONHandler.instance;
   }

   public getEnvironments() {
      return this.environments;
   }

   public getDebugState() {
      return this.debug;
   }

   public getSelectedEnvironment() {
      var selectedEnvironment:string = this.searchParams.get("environment")
      return this.environments.find(e => e.name == selectedEnvironment);
   }
}
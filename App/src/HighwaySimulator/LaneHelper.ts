import Lane from "./Lane";

export default class LaneHelper {

   public getExitLane(lanes: Lane[]) {
      const exitLanes = lanes.filter(l => l.isExitLane);

      if (exitLanes.length > 1) {
         console.error("Found more than one exit lines:", exitLanes);
      }

      if (exitLanes.length == 0) {
         return null;
      }

      return exitLanes[0];
   }
}

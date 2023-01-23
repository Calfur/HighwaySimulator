export default class Lane {
    private _id: number;
    private _maxSpeed: number;
    private _beginning: number;
    private _end: number;
 
    constructor(id:number, maxSpeed: number, beginning?:number, end?:number) {
       this._id = id;
       this._maxSpeed = maxSpeed;
       this._beginning = beginning;
       this._end = end;
    }

    public get id() {
        return this._id;
    }
  
    public get maxSpeed() {
       return this._maxSpeed;
    }
  
    public get beginning() {
       return this._beginning;
    }

    public get end() {
       return this._end;
    }
}
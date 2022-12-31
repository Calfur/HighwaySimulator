"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const p5_min_js_1 = __importDefault(require("../node_modules/p5/lib/p5.min.js"));
const sketch = (p5) => {
    p5.setup = () => {
        const canvas = p5.createCanvas(200, 200);
        canvas.parent("p5js-app");
        p5.background("black");
    };
    p5.draw = () => {
    };
};
new p5_min_js_1.default(sketch);
console.log("Hallo");

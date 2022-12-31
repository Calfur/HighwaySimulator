import P5 from "../node_modules/p5/lib/p5.min.js";

const sketch = (p5: P5) => {
   p5.setup = () => {
      const canvas = p5.createCanvas(200, 200);
      canvas.parent("p5js-app");

      p5.background("black");
   }

   p5.draw = () => {

   }
}

new P5(sketch);

console.log("Hallo")
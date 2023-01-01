import p5 from "p5";

const sketch = (p5: p5) => {
   p5.setup = () => {
      const canvas = p5.createCanvas(200, 200);
      canvas.parent("p5js-app");

      p5.background("black");
   }

   p5.draw = () => {

   }
}

new p5(sketch);

console.log("Hallo")
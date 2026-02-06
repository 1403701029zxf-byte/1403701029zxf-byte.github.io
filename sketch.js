let imgStart, imgEnd, transparent;
let points = [];
let t = 0;
let maxParticles = 2500;

function preload() {
  imgStart = loadImage('CSWADI.png');
  imgEnd = loadImage('horse.png');
  transparent = loadImage('transparent.png');
}

function setup() {
  let canvasWidth = min(windowWidth, imgStart.width);
  let canvasHeight = canvasWidth * (imgStart.height / imgStart.width); // 横屏保持比例
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('p5-canvas');

  // 缩放图片到 canvas 尺寸
  imgStart.resize(width, height);
  imgEnd.resize(width, height);
  transparent.resize(width, height);

  background(20);
  noiseDetail(2, 2.5);

  // 初始化粒子
  for (let i = 0; i < 1000; i++) {
    let x = random(width);
    let y = random(height);
    let cStart = imgStart.get(floor(x), floor(y));
    let cEnd = imgEnd.get(floor(x), floor(y));
    points.push(new Points(x, y, cStart, cEnd));
  }
}

function draw() {
  t = min(t + 0.004, 1); // 控制动画速度

  // 每帧生成少量新粒子
  if (points.length < maxParticles) {
    for (let i = 0; i < 15; i++) {
      let x = random(width);
      let y = random(height);
      let cStart = imgStart.get(floor(x), floor(y));
      let cEnd = imgEnd.get(floor(x), floor(y));
      points.push(new Points(x, y, cStart, cEnd));
    }
  }

  // 更新粒子
  for (let i = points.length - 1; i >= 0; i--) {
    let p = points[i];
    p.show(t);
    p.update();
    if (p.isOut()) points.splice(i, 1);
  }

  // 遮罩层
  let maskStartT = 0.2;
  if (t >= maskStartT) {
    let maskT = constrain(map(t, maskStartT, 1, 0, 1), 0, 1);
    loadPixels();
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        let alphaVal = alpha(transparent.get(x, y));
        if (alphaVal > 0) {
          let c = imgEnd.get(x, y);
          let alphaMask = maskT * (alphaVal / 255.0) * 255;
          pixels[y * width + x] = color(red(c), green(c), blue(c), alphaMask);
        }
      }
    }
    updatePixels();
  }
}

class Points {
  constructor(x, y, cStart, cEnd) {
    this.pos = createVector(x, y);
    this.cStart = cStart;
    this.cEnd = cEnd;
    this.alpha = 150;
    this.size = 1;
    this.curl = 2;
    this.direction = -1;
    this.arrow = createVector(0, 0);
  }

  show(t) {
    let c = lerpColor(this.cStart, this.cEnd, t);
    noStroke();
    fill(red(c), green(c), blue(c), this.alpha);
    ellipse(this.pos.x, this.pos.y, 12 * this.size, 12 * this.size);
  }

  update() {
    this.alpha += 5;
    this.size -= 0.03;
    let angle = map(noise(this.pos.x * 0.01, this.pos.y * 0.01), 0, 1, 0, PI);
    this.arrow.set(this.direction * this.curl * cos(angle), -sin(angle));
    this.pos.add(this.arrow);
  }

  isOut() {
    return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height || this.size <= 0);
  }
}

function windowResized() {
  let canvasWidth = min(windowWidth, imgStart.width);
  let canvasHeight = canvasWidth * (imgStart.height / imgStart.width);
  resizeCanvas(canvasWidth, canvasHeight);
  imgStart.resize(width, height);
  imgEnd.resize(width, height);
  transparent.resize(width, height);
}

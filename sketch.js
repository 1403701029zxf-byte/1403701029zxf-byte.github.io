let imgStart, imgEnd;
let points = [];
let t = 0;
let maxParticles = 2000;  // 手机优化粒子总数
let canvasWidth, canvasHeight;
let targetWidth = 720;     // 横屏显示目标宽度
let scaleRatio;

function preload() {
  imgStart = loadImage('CSWADI.png');
  imgEnd = loadImage('horse.png');
}

function setup() {
  // 自动横屏缩放
  scaleRatio = targetWidth / imgStart.width;
  canvasWidth = imgStart.width * scaleRatio;
  canvasHeight = imgStart.height * scaleRatio;

  if (canvasHeight > windowHeight) {
    scaleRatio = windowHeight / imgStart.height;
    canvasHeight = windowHeight;
    canvasWidth = imgStart.width * scaleRatio;
  }

  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('p5-canvas');

  // 缩放图片到 canvas 尺寸
  imgStart.resize(canvasWidth, canvasHeight);
  imgEnd.resize(canvasWidth, canvasHeight);

  background(20);
  noiseDetail(2, 2.5);

  // 初始化粒子（一次性生成）
  for (let i = 0; i < maxParticles; i++) {
    let x = random(width);
    let y = random(height);
    let cStart = imgStart.get(floor(x), floor(y));
    let cEnd = imgEnd.get(floor(x), floor(y));
    points.push(new Points(x, y, cStart, cEnd));
  }
}

function draw() {
  t = min(t + 0.004, 1);

  background(10); // 背景

  // 绘制所有粒子
  for (let i = points.length - 1; i >= 0; i--) {
    let p = points[i];
    p.show(t);
    p.update();
    if (p.isOut()) points.splice(i, 1);
  }
}

// ---------------------- Points 类 ----------------------
class Points {
  constructor(x, y, cStart, cEnd) {
    this.pos = createVector(x, y);
    this.cStart = cStart;
    this.cEnd = cEnd;
    this.alpha = 200;
    this.size = 1.5;
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
    this.alpha += 2;
    this.size -= 0.02;
    let angle = map(noise(this.pos.x * 0.01, this.pos.y * 0.01), 0, 1, 0, PI);
    this.arrow.set(this.direction * this.curl * cos(angle), -sin(angle));
    this.pos.add(this.arrow);
  }

  isOut() {
    return (
      this.pos.x < 0 || this.pos.x > width ||
      this.pos.y < 0 || this.pos.y > height ||
      this.size <= 0
    );
  }
}

// ---------------------- 手机旋转适配 ----------------------
function windowResized() {
  canvasWidth = windowWidth;
  canvasHeight = canvasWidth * (imgStart.height / imgStart.width);
  if (canvasHeight > windowHeight) {
    canvasHeight = windowHeight;
    canvasWidth = canvasHeight * (imgStart.width / imgStart.height);
  }

  resizeCanvas(canvasWidth, canvasHeight);
  imgStart.resize(canvasWidth, canvasHeight);
  imgEnd.resize(canvasWidth, canvasHeight);

  // 重新初始化粒子，保证覆盖整个画布
  points = [];
  for (let i = 0; i < maxParticles; i++) {
    let x = random(width);
    let y = random(height);
    let cStart = imgStart.get(floor(x), floor(y));
    let cEnd = imgEnd.get(floor(x), floor(y));
    points.push(new Points(x, y, cStart, cEnd));
  }
}

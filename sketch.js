let imgStart, imgEnd, transparent;
let points = [];

let t = 0;
let ready = false;

// 粒子初始化控制
const INIT_TOTAL = 8000;
let initCount = 0;

// 遮罩缓存
let maskLayer;
let maskBuilt = false;

function preload() {
  imgStart = loadImage("CSWADI.png");
  imgEnd = loadImage("horse.png");
  transparent = loadImage("transparent.png");
}

function setup() {
  let canvas = createCanvas(imgStart.width, imgStart.height);
  canvas.parent("p5-canvas");

  background(20);
  noiseDetail(2, 2.5);
  pixelDensity(1);

  // 像 Processing 一样，提前锁定像素
  imgStart.loadPixels();
  imgEnd.loadPixels();
  transparent.loadPixels();

  maskLayer = createGraphics(width, height);
  maskLayer.pixelDensity(1);
}

function draw() {
  if (!ready) {
    drawLoading();
    initParticlesStep();
    return;
  }

  t = min(t + 0.002, 1);

  // 每帧继续补充粒子（对应 PDE 的 draw 里 +50）
  for (let i = 0; i < 50; i++) {
    spawnParticle();
  }

  for (let i = points.length - 1; i >= 0; i--) {
    let p = points[i];
    p.show(t);
    p.update();
    if (p.isOut()) points.splice(i, 1);
  }

  drawMask();
}

/* ================= 加载阶段 ================= */

function drawLoading() {
  background(20);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  text("正在生成粒子…", width / 2, height / 2 - 20);

  noStroke();
  fill(255, 60);
  rect(width / 4, height / 2 + 20, width / 2, 10);

  fill(255);
  rect(
    width / 4,
    height / 2 + 20,
    (width / 2) * (initCount / INIT_TOTAL),
    10
  );
}

function initParticlesStep() {
  let batch = 300; // 每帧生成，避免卡死

  for (let i = 0; i < batch; i++) {
    spawnParticle();
    initCount++;
    if (initCount >= INIT_TOTAL) {
      ready = true;
      return;
    }
  }
}

/* ================= 粒子 ================= */

class Points {
  constructor(x, y, cStart, cEnd) {
    this.pos = createVector(x, y);
    this.cStart = cStart;
    this.cEnd = cEnd;
    this.alpha = 150;
    this.size = 1;
    this.curl = 2;
    this.direction = -1;
  }

  show(t) {
    let r = lerp(this.cStart[0], this.cEnd[0], t);
    let g = lerp(this.cStart[1], this.cEnd[1], t);
    let b = lerp(this.cStart[2], this.cEnd[2], t);

    noStroke();
    fill(r, g, b, this.alpha);
    ellipse(this.pos.x, this.pos.y, 12 * this.size);
  }

  update() {
    this.alpha += 5;
    this.size -= 0.03;

    let angle = map(
      noise(this.pos.x * 0.01, this.pos.y * 0.01),
      0,
      1,
      0,
      PI
    );

    let vx = this.direction * this.curl * cos(angle);
    let vy = -sin(angle);
    this.pos.add(vx, vy);
  }

  isOut() {
    return (
      this.pos.x < 0 ||
      this.pos.x > width ||
      this.pos.y < 0 ||
      this.pos.y > height ||
      this.size <= 0
    );
  }
}

/* ================= 遮罩（一次性构建） ================= */

function drawMask() {
  if (t < 0.2) return;

  if (!maskBuilt) {
    buildMask();
    maskBuilt = true;
  }

  let alphaMask = map(t, 0.2, 1, 0, 255);
  tint(255, alphaMask);
  image(maskLayer, 0, 0);
  noTint();
}

function buildMask() {
  maskLayer.clear();
  maskLayer.loadPixels();

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      let i = (x + y * width) * 4;
      let a = transparent.pixels[i + 3];
      if (a > 0) {
        maskLayer.pixels[i] = imgEnd.pixels[i];
        maskLayer.pixels[i + 1] = imgEnd.pixels[i + 1];
        maskLayer.pixels[i + 2] = imgEnd.pixels[i + 2];
        maskLayer.pixels[i + 3] = a;
      }
    }
  }
  maskLayer.updatePixels();
}

/* ================= 工具 ================= */

function spawnParticle() {
  let x = random(width);
  let y = random(height);
  let cStart = sample(imgStart, x, y);
  let cEnd = sample(imgEnd, x, y);
  points.push(new Points(x, y, cStart, cEnd));
}

function sample(img, x, y) {
  x = floor(constrain(x, 0, img.width - 1));
  y = floor(constrain(y, 0, img.height - 1));
  let i = (x + y * img.width) * 4;
  return [
    img.pixels[i],
    img.pixels[i + 1],
    img.pixels[i + 2],
    img.pixels[i + 3],
  ];
}

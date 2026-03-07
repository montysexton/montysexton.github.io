const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const ballCountInput = document.getElementById("ballCount");
const ballCountValue = document.getElementById("ballCountValue");
const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");
const colorInput = document.getElementById("color");
const resetButton = document.getElementById("reset");

const GRAVITY = 1200; // pixels / second^2
const BOUNCE = 0.88;

let balls = [];
let lastTime = 0;
let speedFactor = Number(speedInput.value);
let ballColor = colorInput.value;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

class Ball {
  constructor(x, y, radius, vx, vy) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vx = vx;
    this.vy = vy;
  }

  update(dt) {
    const gravityAccel = GRAVITY * dt * speedFactor;
    this.vy += gravityAccel;

    this.x += this.vx * dt * speedFactor;
    this.y += this.vy * dt * speedFactor;

    const minX = this.radius;
    const minY = this.radius;
    const maxX = canvas.clientWidth - this.radius;
    const maxY = canvas.clientHeight - this.radius;

    if (this.x < minX) {
      this.x = minX;
      this.vx = -this.vx * BOUNCE;
    } else if (this.x > maxX) {
      this.x = maxX;
      this.vx = -this.vx * BOUNCE;
    }

    if (this.y < minY) {
      this.y = minY;
      this.vy = -this.vy * BOUNCE;
    } else if (this.y > maxY) {
      this.y = maxY;
      this.vy = -this.vy * BOUNCE;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.stroke();
  }
}

function resolveBallCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;
  if (distance === 0 || distance >= minDist) {
    return;
  }

  // Move balls so they no longer overlap
  const overlap = minDist - distance;
  const nx = dx / distance;
  const ny = dy / distance;

  const correction = overlap / 2;
  a.x -= nx * correction;
  a.y -= ny * correction;
  b.x += nx * correction;
  b.y += ny * correction;

  // Elastic collision (equal mass)
  const dvx = b.vx - a.vx;
  const dvy = b.vy - a.vy;
  const impactSpeed = dvx * nx + dvy * ny;
  if (impactSpeed > 0) {
    return;
  }

  const impulse = (-(1 + BOUNCE) * impactSpeed) / 2;
  const impulseX = impulse * nx;
  const impulseY = impulse * ny;

  a.vx -= impulseX;
  a.vy -= impulseY;
  b.vx += impulseX;
  b.vy += impulseY;
}

function updatePhysics(dt) {
  for (const ball of balls) {
    ball.update(dt);
  }

  for (let i = 0; i < balls.length; i += 1) {
    for (let j = i + 1; j < balls.length; j += 1) {
      resolveBallCollision(balls[i], balls[j]);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  for (const ball of balls) {
    ball.draw();
  }
}

function tick(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  updatePhysics(dt);
  draw();
  requestAnimationFrame(tick);
}

function createBalls(count) {
  const newBalls = [];
  const radius = 22;
  const maxAttempts = 200;

  for (let i = 0; i < count; i += 1) {
    let attempt = 0;
    let x, y;

    while (attempt < maxAttempts) {
      x = randomBetween(radius + 10, canvas.clientWidth - radius - 10);
      y = randomBetween(radius + 10, canvas.clientHeight - radius - 10);
      const overlap = newBalls.some((other) => {
        const dx = x - other.x;
        const dy = y - other.y;
        return Math.hypot(dx, dy) < radius * 2.2;
      });

      if (!overlap) {
        break;
      }
      attempt += 1;
    }

    const speed = randomBetween(200, 520);
    const angle = randomBetween(0, Math.PI * 2);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    newBalls.push(new Ball(x, y, radius, vx, vy));
  }

  balls = newBalls;
}

function updateControls() {
  ballCountValue.textContent = ballCountInput.value;
  speedValue.textContent = `${Number(speedInput.value).toFixed(2)}×`;
  speedFactor = Number(speedInput.value);
  ballColor = colorInput.value;
}

function reset() {
  resizeCanvas();
  createBalls(Number(ballCountInput.value));
}

window.addEventListener("resize", () => {
  resizeCanvas();
});

ballCountInput.addEventListener("input", () => {
  updateControls();
  createBalls(Number(ballCountInput.value));
});

speedInput.addEventListener("input", () => {
  updateControls();
});

colorInput.addEventListener("input", () => {
  updateControls();
});

resetButton.addEventListener("click", () => {
  reset();
});

function init() {
  resizeCanvas();
  updateControls();
  createBalls(Number(ballCountInput.value));
  requestAnimationFrame(tick);
}

init();

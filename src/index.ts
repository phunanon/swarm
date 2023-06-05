type Vec = { x: number; y: number };
type Ant = Vec & {
  direction: number;
  home: number;
  food: number;
  wandering: boolean;
  carrying: boolean;
};
type Food = Vec & { radius: number };

const scale = 6;
const speed = 1;
const screamRadius = 16;
const ants: Ant[] = [];
const foods: Food[] = [];
const home = { x: 0, y: 0, radius: 4 };
let collected = 0;

window.addEventListener('DOMContentLoaded', () => {
  const ctx = document.querySelector('canvas')?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.addEventListener('mousemove', e => {
    home.x = e.offsetX / scale;
    home.y = e.offsetY / scale;
  });

  const width = document.body.offsetWidth / scale;
  const height = document.body.offsetHeight / scale;

  ants.push(
    ...new Array(512).fill(0).map(() => ({
      ...{ x: Math.random() * width, y: Math.random() * height },
      ...{ home: 0, food: 0, wandering: true, carrying: false },
      direction: Math.random() * Math.PI * 2,
    }))
  );
  foods.push(
    ...new Array(3).fill(0).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 4,
    }))
  );

  home.x = 32;
  home.y = height / 2;

  Render(ctx);
});

const Render = (ctx: CanvasRenderingContext2D) => {
  const width = document.body.offsetWidth;
  const height = document.body.offsetHeight;
  ctx.canvas.style.width = `${(ctx.canvas.width = width)}`;
  ctx.canvas.style.height = `${(ctx.canvas.height = height)}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.scale(scale, scale);

  ants.forEach(ant => {
    ctx.fillStyle = ant.carrying ? 'red' : 'black';
    ctx.fillRect(ant.x, ant.y, 1, 1);
  });
  ctx.fillStyle = 'blue';
  foods.forEach(food => {
    ctx.beginPath();
    ctx.arc(food.x, food.y, food.radius, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(home.x, home.y, home.radius, 0, 2 * Math.PI);
  ctx.fill();

  const updates = Update();
  updates.forEach(([x1, y1, x2, y2, food, home]) => {
    ctx.strokeStyle = `rgba(${food && home ? 128 : 0}, ${
      food && !home ? 0 : 128
    }, ${food && !home ? 128 : 0}, 0.05)`;
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
  });

  ctx.fillStyle = 'black';
  ctx.font = '8px monospace';
  ctx.fillText(`Collected ${collected}`, 2, 8);

  ctx.restore();

  setTimeout(() => Render(ctx), 10);
};

const near = (a: Vec, b: Vec, radius: number) =>
  a.x > b.x - radius &&
  a.x < b.x + radius &&
  a.y > b.y - radius &&
  a.y < b.y + radius;

const Update = () => {
  const updates: [number, number, number, number, boolean, boolean][] = [];

  ants.forEach(ant => {
    ant.x += Math.cos(ant.direction) * speed;
    ant.y += Math.sin(ant.direction) * speed;

    if (ant.x < 0) {
      ant.direction = Math.PI - ant.direction;
      ant.wandering = true;
    }
    if (ant.x > document.body.offsetWidth / scale) {
      ant.direction = Math.PI - ant.direction;
      ant.wandering = true;
    }
    if (ant.y < 0) {
      ant.direction = -ant.direction;
      ant.wandering = true;
    }
    if (ant.y > document.body.offsetHeight / scale) {
      ant.direction = -ant.direction;
      ant.wandering = true;
    }

    if (near(ant, home, home.radius) && ant.carrying) {
      ant.carrying = false;
      ant.home = 0;
      ant.direction += Math.PI;
      ++collected;
    }

    if (!ant.carrying) {
      foods.forEach(food => {
        if (near(ant, food, food.radius)) {
          ant.carrying = true;
          ant.food = 0;
          ant.direction += Math.PI;
          food.radius -= 0.001;
          if (food.radius < 1) {
            food.x = (Math.random() * document.body.offsetWidth) / scale;
            food.y = (Math.random() * document.body.offsetHeight) / scale;
            food.radius = 4;
          }
        }
      });
    }

    if (ant.wandering) {
      ant.direction += Math.random() * 0.1 - 0.05;
    }
    ++ant.food;
    ++ant.home;
  });

  ants.forEach(ant => {
    ants.forEach(other => {
      if (ant === other) return;
      if (!near(ant, other, screamRadius)) return;
      const f = ant.food + screamRadius;
      const h = ant.home + screamRadius;
      const closerFood = f < other.food;
      const closerHome = h < other.home;
      const goFood = !other.carrying && closerFood;
      const goHome = other.carrying && closerHome;
      const newDir =
        Math.atan2(ant.y - other.y, ant.x - other.x) +
        Math.random() * 0.5 -
        0.25;
      if (closerFood) {
        other.food = f;
      } else if (closerHome) {
        other.home = h;
      }
      if (closerFood || closerHome) {
        updates.push([ant.x, ant.y, other.x, other.y, closerFood, closerHome]);
      }
      if (goFood || goHome) {
        other.direction = newDir;
        other.wandering = false;
      }
    });
  });

  return updates;
};

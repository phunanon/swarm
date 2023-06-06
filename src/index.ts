type Vec = { x: number; y: number };
type Vec3 = Vec & { direction: number };
type Ant = Vec3 & { home: number; food: number; carrying: boolean };
type Food = Vec3 & { radius: number };
type Wall = { a: Vec; b: Vec };

const scale = 6;
const speed = 1;
const screamRadius = 16;
const ants: Ant[] = [];
const foods: Food[] = [];
const newHome = { x: 0, y: 0 };
const home = { x: 0, y: 0, radius: 4 };
let collected = 0;
const w = () => document.body.offsetWidth / scale;
const h = () => document.body.offsetHeight / scale;

window.addEventListener('DOMContentLoaded', () => {
  const ctx = document.querySelector('canvas')?.getContext('2d');
  if (!ctx) return;
  ctx.canvas.addEventListener('mousemove', e => {
    newHome.x = e.offsetX / scale;
    newHome.y = e.offsetY / scale;
  });
  document.body.addEventListener('keyup', e => {
    if (e.key === ' ') {
      home.x = newHome.x;
      home.y = newHome.y;
    }
  });

  ants.push(
    ...new Array(512).fill(0).map(() => ({
      ...{ x: Math.random() * w(), y: Math.random() * h() },
      ...{ home: 0, food: 0, carrying: false },
      direction: Math.random() * Math.PI * 2,
    }))
  );
  foods.push(
    ...new Array(3).fill(0).map(() => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      radius: 4,
      direction: Math.random() * Math.PI * 2,
    }))
  );

  home.x = 32;
  home.y = h() / 2;

  Render(ctx);
});

const Render = (ctx: CanvasRenderingContext2D) => {
  const width = document.body.offsetWidth;
  const height = document.body.offsetHeight;
  ctx.canvas.style.width = `${(ctx.canvas.width = width)}`;
  ctx.canvas.style.height = `${(ctx.canvas.height = height)}`;
  ctx.fillStyle = 'rgba(128, 128, 128, 1)';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.scale(scale, scale);

  const updates = Update();
  updates.forEach(([x1, y1, x2, y2, food]) => {
    ctx.strokeStyle = `rgba(0, ${food ? 0 : 255}, ${food ? 255 : 0}, 0.1)`;
    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.stroke();
  });

  ants.forEach(ant => {
    ctx.fillStyle = ant.carrying ? 'white' : 'black';
    ctx.fillRect(ant.x, ant.y, 1, 1);
  });
  foods.forEach(food => {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(food.x, food.y, food.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(food.x, food.y, food.radius * 0.9, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.fillStyle = 'rgb(0, 255, 0)';
  ctx.beginPath();
  ctx.arc(home.x, home.y, home.radius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.font = '6px monospace';
  ctx.fillText(`${collected}`, 2, 6);

  ctx.restore();

  setTimeout(() => Render(ctx), 10);
};

const near = (a: Vec, b: Vec, radius: number) =>
  a.x > b.x - radius &&
  a.x < b.x + radius &&
  a.y > b.y - radius &&
  a.y < b.y + radius;

/** Moves an object and bounces it off the canvas bounds */
const move = (vec: Vec3, radius = 0, pace = 1) => {
  vec.x += Math.cos(vec.direction) * speed * pace;
  vec.y += Math.sin(vec.direction) * speed * pace;

  if (vec.x < radius) {
    vec.x = radius;
    vec.direction = Math.PI - vec.direction;
  }
  if (vec.x + radius > w()) {
    vec.x = w() - radius;
    vec.direction = Math.PI - vec.direction;
  }
  if (vec.y < radius) {
    vec.y = radius;
    vec.direction = -vec.direction;
  }
  if (vec.y + radius > h()) {
    vec.y = h() - radius;
    vec.direction = -vec.direction;
  }
};

const Update = () => {
  const updates: [number, number, number, number, boolean][] = [];

  foods.forEach(food => move(food, food.radius, 0.2));

  ants.forEach(ant => {
    move(ant);

    if (ant.x < 0) {
      ant.direction = Math.PI - ant.direction;
      ant.x = 0;
    }
    if (ant.x > w()) {
      ant.direction = Math.PI - ant.direction;
      ant.x = w();
    }
    if (ant.y < 0) {
      ant.direction = -ant.direction;
      ant.y = 0;
    }
    if (ant.y > h()) {
      ant.direction = -ant.direction;
      ant.y = h();
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
            food.x = Math.random() * w();
            food.y = Math.random() * h();
            food.radius = 4;
            food.direction = Math.random() * Math.PI * 2;
          }
        }
      });
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
      const updateFood = !other.carrying && f < other.food;
      const updateHome = other.carrying && h < other.home;
      const newDir =
        Math.atan2(ant.y - other.y, ant.x - other.x) +
        Math.random() * 0.5 -
        0.25;
      if (updateFood) {
        other.food = f;
      } else if (updateHome) {
        other.home = h;
      }
      if (updateFood || updateHome) {
        other.direction = newDir;
        updates.push([ant.x, ant.y, other.x, other.y, updateFood]);
      }
    });
  });

  return updates;
};

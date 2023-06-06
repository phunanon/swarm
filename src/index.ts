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
const walls: Wall[] = [];
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
  walls.push(
    ...new Array(8).fill(0).map(() => {
      const [x, y] = [Math.random() * w(), Math.random() * h()];
      const horizontal = Math.random() > 0.5;
      return {
        a: { x, y },
        b: {
          x: x + 4 + Math.random() * (horizontal ? 64 : 0),
          y: y + 4 + Math.random() * (horizontal ? 0 : 64),
        },
      };
    })
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
  ctx.fillStyle = 'black';
  walls.forEach(wall => {
    ctx.fillRect(wall.a.x, wall.a.y, wall.b.x - wall.a.x, wall.b.y - wall.a.y);
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

/** Moves an object and bounces it off the canvas bounds */
const move = (vec: Vec3, radius = 0, speedMult = 1) => {
  vec.x += Math.cos(vec.direction) * speed * speedMult;
  vec.y += Math.sin(vec.direction) * speed * speedMult;

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
  const updates: [number, number, number, number, boolean, boolean][] = [];

  foods.forEach(food => move(food, food.radius, 0.2));

  ants.forEach(ant => {
    move(ant);

    walls.forEach(wall => {
      const inX = ant.x > wall.a.x && ant.x < wall.b.x;
      const x0d = inX ? ant.x - wall.a.x : 0;
      const x1d = inX ? wall.b.x - ant.x : 0;
      const inY = ant.y > wall.a.y && ant.y < wall.b.y;
      const y0d = inY ? ant.y - wall.a.y : 0;
      const y1d = inY ? wall.b.y - ant.y : 0;
      if (inX && inY) {
        //Check if hit top or bottom sides
        if (Math.min(y0d, y1d) < Math.min(x0d, x1d)) {
          ant.direction = -ant.direction;
        } else {
          ant.direction = Math.PI - ant.direction;
        }
        move(ant);
      }
    });

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
      }
    });
  });

  return updates;
};

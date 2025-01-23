type Vec = { x: number; y: number };
type Vec3 = Vec & { direction: number };
type Ant = Vec3 & { home: number; food: number; carrying: boolean };
type Food = Vec3 & { radius: number };

const help = ['Click/tap to move home', 'Hold to toggle speech'];
const speed = 1;
const screamRadius = 12;
const ants: Ant[] = [];
const foods: Food[] = [];
const home = { x: 0, y: 0, radius: 4 };
let collected = 0;
let showUpdates = true;
let helpOpacity = 1;
let tapAt: Date | null = null;
const scale = () =>
  Math.min(document.body.offsetWidth, document.body.offsetHeight) / 100;
const w = () => document.body.offsetWidth / scale();
const h = () => document.body.offsetHeight / scale();

window.addEventListener('DOMContentLoaded', () => {
  const ctx = document.querySelector('canvas')?.getContext('2d');
  if (!ctx) return;
  document.body.addEventListener('pointerdown', e => (tapAt = new Date()));
  document.body.addEventListener('pointerup', e => {
    if (tapAt && new Date().getTime() - tapAt.getTime() < 500) {
      home.x = e.offsetX / scale();
      home.y = e.offsetY / scale();
    } else {
      showUpdates = !showUpdates;
    }
    tapAt = null;
  });

  ants.push(
    ...new Array(400).fill(0).map(() => ({
      ...{ x: Math.random() * w(), y: Math.random() * h() },
      ...{ home: 0, food: 0, carrying: false },
      direction: Math.random() * Math.PI * 2,
    }))
  );
  foods.push(
    ...new Array(4).fill(0).map(() => ({
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
  ctx.scale(scale(), scale());

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
  ctx.fillStyle = `rgba(0, 0, 0, ${helpOpacity})`;
  help.forEach((line, i) => ctx.fillText(line, 2, 12 + i * 6));
  if (helpOpacity > 0) helpOpacity -= (1 - helpOpacity + 1) / 500;

  ctx.restore();

  setTimeout(() => Render(ctx), 10);
};

const near = (a: Vec, b: Vec, radius: number) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) < radius;

/** Moves an object and bounces it off the canvas bounds */
const move = (vec: Vec3, radius: number, pace: number) => {
  vec.x += Math.cos(vec.direction) * speed * pace;
  vec.y += Math.sin(vec.direction) * speed * pace;

  if (vec.x < radius) {
    vec.x = radius;
    vec.direction = Math.PI - vec.direction;
  } else if (vec.x + radius > w()) {
    vec.x = w() - radius;
    vec.direction = Math.PI - vec.direction;
  } else if (vec.y < radius) {
    vec.y = radius;
    vec.direction = -vec.direction;
  } else if (vec.y + radius > h()) {
    vec.y = h() - radius;
    vec.direction = -vec.direction;
  }
};

const Update = () => {
  const updates: [number, number, number, number, boolean][] = [];

  foods.forEach(food => move(food, food.radius, 0.1));

  ants.forEach(ant => {
    move(ant, 1, ant.carrying ? 0.75 : 1);

    if (near(ant, home, home.radius) && ant.carrying) {
      ant.carrying = false;
      ant.home = 0;
      ant.direction += Math.PI;
      ++collected;
    }

    if (!ant.carrying) {
      foods.forEach(food => {
        if (!near(ant, food, food.radius)) return;
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
      });
    }

    ++ant.food;
    ++ant.home;
  });

  for (let i = 0; i < ants.length; ++i) {
    const a = ants[i]!;
    for (let j = i + 1; j < ants.length; ++j) {
      const b = ants[j]!;
      if (!near(a, b, screamRadius)) continue;
      const fa = a.food + screamRadius;
      const ha = a.home + screamRadius;
      const fb = b.food + screamRadius;
      const hb = b.home + screamRadius;
      const updateFoodB = !b.carrying && fa < b.food;
      const updateHomeB = b.carrying && ha < b.home;
      const updateFoodA = !a.carrying && fb < a.food;
      const updateHomeA = a.carrying && hb < a.home;
      if (updateFoodB) {
        b.food = fa;
      } else if (updateHomeB) {
        b.home = ha;
      }
      if (updateFoodA) {
        a.food = fb;
      } else if (updateHomeA) {
        a.home = hb;
      }
      if (updateFoodB || updateHomeB) {
        const newDir =
          Math.atan2(a.y - b.y, a.x - b.x) + Math.random() * 0.5 - 0.25;
        b.direction = newDir;
        if (showUpdates) {
          updates.push([a.x, a.y, b.x, b.y, updateFoodB]);
        }
      } else if (updateFoodA || updateHomeA) {
        const newDir =
          Math.atan2(b.y - a.y, b.x - a.x) + Math.random() * 0.5 - 0.25;
        a.direction = newDir;
        if (showUpdates) {
          updates.push([a.x, a.y, b.x, b.y, updateFoodA]);
        }
      }
    }
  }

  return updates;
};

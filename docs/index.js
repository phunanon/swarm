"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var help = ['Click/tap to move home', 'Hold to toggle speech'];
var speed = 1;
var screamRadius = 12;
var ants = [];
var foods = [];
var home = { x: 0, y: 0, radius: 4 };
var collected = 0;
var showUpdates = true;
var helpOpacity = 1;
var tapAt = null;
var scale = function () {
    return Math.min(document.body.offsetWidth, document.body.offsetHeight) / 100;
};
var w = function () { return document.body.offsetWidth / scale(); };
var h = function () { return document.body.offsetHeight / scale(); };
window.addEventListener('DOMContentLoaded', function () {
    var _a;
    var ctx = (_a = document.querySelector('canvas')) === null || _a === void 0 ? void 0 : _a.getContext('2d');
    if (!ctx)
        return;
    document.body.addEventListener('pointerdown', function (e) { return (tapAt = new Date()); });
    document.body.addEventListener('pointerup', function (e) {
        if (tapAt && new Date().getTime() - tapAt.getTime() < 500) {
            home.x = e.offsetX / scale();
            home.y = e.offsetY / scale();
        }
        else {
            showUpdates = !showUpdates;
        }
        tapAt = null;
    });
    ants.push.apply(ants, new Array(256).fill(0).map(function () { return (__assign(__assign({ x: Math.random() * w(), y: Math.random() * h() }, { home: 0, food: 0, carrying: false }), { direction: Math.random() * Math.PI * 2 })); }));
    foods.push.apply(foods, new Array(4).fill(0).map(function () { return ({
        x: Math.random() * w(),
        y: Math.random() * h(),
        radius: 4,
        direction: Math.random() * Math.PI * 2,
    }); }));
    home.x = 32;
    home.y = h() / 2;
    Render(ctx);
});
var Render = function (ctx) {
    var width = document.body.offsetWidth;
    var height = document.body.offsetHeight;
    ctx.canvas.style.width = "".concat((ctx.canvas.width = width));
    ctx.canvas.style.height = "".concat((ctx.canvas.height = height));
    ctx.fillStyle = 'rgba(128, 128, 128, 1)';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.scale(scale(), scale());
    var updates = Update();
    updates.forEach(function (_a) {
        var x1 = _a[0], y1 = _a[1], x2 = _a[2], y2 = _a[3], food = _a[4];
        ctx.strokeStyle = "rgba(0, ".concat(food ? 0 : 255, ", ").concat(food ? 255 : 0, ", 0.1)");
        ctx.beginPath();
        ctx.moveTo(x1 + 0.5, y1 + 0.5);
        ctx.lineTo(x2 + 0.5, y2 + 0.5);
        ctx.stroke();
    });
    ants.forEach(function (ant) {
        ctx.fillStyle = ant.carrying ? 'white' : 'black';
        ctx.fillRect(ant.x, ant.y, 1, 1);
    });
    foods.forEach(function (food) {
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
    ctx.fillText("".concat(collected), 2, 6);
    if (helpOpacity > 0) {
        ctx.fillStyle = "rgba(0, 0, 0, ".concat(helpOpacity, ")");
        help.forEach(function (line, i) { return ctx.fillText(line, 2, 12 + i * 6); });
        if (helpOpacity > 0)
            helpOpacity -= (1 - helpOpacity + 1) / 500;
    }
    ctx.restore();
    requestAnimationFrame(function () { return Render(ctx); });
};
var near = function (a, b, radius) {
    return Math.sqrt(Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2)) < radius;
};
/** Moves an object and bounces it off the canvas bounds */
var move = function (vec, radius, pace) {
    vec.x += Math.cos(vec.direction) * speed * pace;
    vec.y += Math.sin(vec.direction) * speed * pace;
    if (vec.x < radius) {
        vec.x = radius;
        vec.direction = Math.PI - vec.direction;
    }
    else if (vec.x + radius > w()) {
        vec.x = w() - radius;
        vec.direction = Math.PI - vec.direction;
    }
    else if (vec.y < radius) {
        vec.y = radius;
        vec.direction = -vec.direction;
    }
    else if (vec.y + radius > h()) {
        vec.y = h() - radius;
        vec.direction = -vec.direction;
    }
};
var Update = function () {
    var updates = [];
    foods.forEach(function (food) { return move(food, food.radius, 0.1); });
    ants.forEach(function (ant) {
        move(ant, 1, ant.carrying ? 0.75 : 1);
        if (near(ant, home, home.radius) && ant.carrying) {
            ant.carrying = false;
            ant.home = 0;
            ant.direction += Math.PI;
            ++collected;
        }
        if (!ant.carrying) {
            foods.forEach(function (food) {
                if (!near(ant, food, food.radius))
                    return;
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
    for (var i = 0; i < ants.length; ++i) {
        var a = ants[i];
        for (var j = i + 1; j < ants.length; ++j) {
            var b = ants[j];
            if (!near(a, b, screamRadius))
                continue;
            var fa = a.food + screamRadius;
            var ha = a.home + screamRadius;
            var fb = b.food + screamRadius;
            var hb = b.home + screamRadius;
            var updateFoodB = !b.carrying && fa < b.food;
            var updateHomeB = b.carrying && ha < b.home;
            var updateFoodA = !a.carrying && fb < a.food;
            var updateHomeA = a.carrying && hb < a.home;
            if (updateFoodB) {
                b.food = fa;
            }
            else if (updateHomeB) {
                b.home = ha;
            }
            if (updateFoodA) {
                a.food = fb;
            }
            else if (updateHomeA) {
                a.home = hb;
            }
            if (updateFoodB || updateHomeB) {
                var newDir = Math.atan2(a.y - b.y, a.x - b.x) + Math.random() * 0.5 - 0.25;
                b.direction = newDir;
                if (showUpdates) {
                    updates.push([a.x, a.y, b.x, b.y, updateFoodB]);
                }
            }
            else if (updateFoodA || updateHomeA) {
                var newDir = Math.atan2(b.y - a.y, b.x - a.x) + Math.random() * 0.5 - 0.25;
                a.direction = newDir;
                if (showUpdates) {
                    updates.push([a.x, a.y, b.x, b.y, updateFoodA]);
                }
            }
        }
    }
    return updates;
};
//# sourceMappingURL=index.js.map
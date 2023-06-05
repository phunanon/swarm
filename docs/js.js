/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ (function() {


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
var scale = 6;
var speed = 1;
var screamRadius = 16;
var ants = [];
var foods = [];
var home = { x: 0, y: 0, radius: 4 };
var collected = 0;
window.addEventListener('DOMContentLoaded', function () {
    var _a;
    var ctx = (_a = document.querySelector('canvas')) === null || _a === void 0 ? void 0 : _a.getContext('2d');
    if (!ctx)
        return;
    ctx.canvas.addEventListener('mousemove', function (e) {
        home.x = e.offsetX / scale;
        home.y = e.offsetY / scale;
    });
    var width = document.body.offsetWidth / scale;
    var height = document.body.offsetHeight / scale;
    ants.push.apply(ants, new Array(512).fill(0).map(function () { return (__assign(__assign({ x: Math.random() * width, y: Math.random() * height }, { home: 0, food: 0, wandering: true, carrying: false }), { direction: Math.random() * Math.PI * 2 })); }));
    foods.push.apply(foods, new Array(3).fill(0).map(function () { return ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 4,
    }); }));
    home.x = 32;
    home.y = height / 2;
    Render(ctx);
});
var Render = function (ctx) {
    var width = document.body.offsetWidth;
    var height = document.body.offsetHeight;
    ctx.canvas.style.width = "".concat((ctx.canvas.width = width));
    ctx.canvas.style.height = "".concat((ctx.canvas.height = height));
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.scale(scale, scale);
    ants.forEach(function (ant) {
        ctx.fillStyle = ant.carrying ? 'red' : 'black';
        ctx.fillRect(ant.x, ant.y, 1, 1);
    });
    ctx.fillStyle = 'blue';
    foods.forEach(function (food) {
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.radius, 0, 2 * Math.PI);
        ctx.fill();
    });
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(home.x, home.y, home.radius, 0, 2 * Math.PI);
    ctx.fill();
    var updates = Update();
    updates.forEach(function (_a) {
        var x1 = _a[0], y1 = _a[1], x2 = _a[2], y2 = _a[3], food = _a[4], home = _a[5];
        ctx.strokeStyle = "rgba(".concat(food && home ? 128 : 0, ", ").concat(food && !home ? 0 : 128, ", ").concat(food && !home ? 128 : 0, ", 0.05)");
        ctx.beginPath();
        ctx.moveTo(x1 + 0.5, y1 + 0.5);
        ctx.lineTo(x2 + 0.5, y2 + 0.5);
        ctx.stroke();
    });
    ctx.fillStyle = 'black';
    ctx.font = '8px monospace';
    ctx.fillText("Collected ".concat(collected), 2, 8);
    ctx.restore();
    setTimeout(function () { return Render(ctx); }, 10);
};
var near = function (a, b, radius) {
    return a.x > b.x - radius &&
        a.x < b.x + radius &&
        a.y > b.y - radius &&
        a.y < b.y + radius;
};
var Update = function () {
    var updates = [];
    ants.forEach(function (ant) {
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
            foods.forEach(function (food) {
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
    ants.forEach(function (ant) {
        ants.forEach(function (other) {
            if (ant === other)
                return;
            if (!near(ant, other, screamRadius))
                return;
            var f = ant.food + screamRadius;
            var h = ant.home + screamRadius;
            var closerFood = f < other.food;
            var closerHome = h < other.home;
            var goFood = !other.carrying && closerFood;
            var goHome = other.carrying && closerHome;
            var newDir = Math.atan2(ant.y - other.y, ant.x - other.x) +
                Math.random() * 0.5 -
                0.25;
            if (closerFood) {
                other.food = f;
            }
            else if (closerHome) {
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


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/index.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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S0FBSyxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUM7WUFDNUMsSUFBTSxNQUFNLEdBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRztnQkFDbkIsSUFBSSxDQUFDO1lBQ1AsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7YUFDaEI7aUJBQU0sSUFBSSxVQUFVLEVBQUU7Z0JBQ3JCLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2FBQ2hCO1lBQ0QsSUFBSSxVQUFVLElBQUksVUFBVSxFQUFFO2dCQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQzthQUN4RTtZQUNELElBQUksTUFBTSxJQUFJLE1BQU0sRUFBRTtnQkFDcEIsS0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2FBQ3pCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMsQ0FBQzs7Ozs7Ozs7VUUzTEY7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3N3YXJtLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3N3YXJtL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vc3dhcm0vd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3N3YXJtL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJ0eXBlIFZlYyA9IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfTtcclxudHlwZSBBbnQgPSBWZWMgJiB7XHJcbiAgZGlyZWN0aW9uOiBudW1iZXI7XHJcbiAgaG9tZTogbnVtYmVyO1xyXG4gIGZvb2Q6IG51bWJlcjtcclxuICB3YW5kZXJpbmc6IGJvb2xlYW47XHJcbiAgY2Fycnlpbmc6IGJvb2xlYW47XHJcbn07XHJcbnR5cGUgRm9vZCA9IFZlYyAmIHsgcmFkaXVzOiBudW1iZXIgfTtcclxuXHJcbmNvbnN0IHNjYWxlID0gNjtcclxuY29uc3Qgc3BlZWQgPSAxO1xyXG5jb25zdCBzY3JlYW1SYWRpdXMgPSAxNjtcclxuY29uc3QgYW50czogQW50W10gPSBbXTtcclxuY29uc3QgZm9vZHM6IEZvb2RbXSA9IFtdO1xyXG5jb25zdCBob21lID0geyB4OiAwLCB5OiAwLCByYWRpdXM6IDQgfTtcclxubGV0IGNvbGxlY3RlZCA9IDA7XHJcblxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcclxuICBjb25zdCBjdHggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKT8uZ2V0Q29udGV4dCgnMmQnKTtcclxuICBpZiAoIWN0eCkgcmV0dXJuO1xyXG4gIGN0eC5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZSA9PiB7XHJcbiAgICBob21lLnggPSBlLm9mZnNldFggLyBzY2FsZTtcclxuICAgIGhvbWUueSA9IGUub2Zmc2V0WSAvIHNjYWxlO1xyXG4gIH0pO1xyXG5cclxuICBjb25zdCB3aWR0aCA9IGRvY3VtZW50LmJvZHkub2Zmc2V0V2lkdGggLyBzY2FsZTtcclxuICBjb25zdCBoZWlnaHQgPSBkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodCAvIHNjYWxlO1xyXG5cclxuICBhbnRzLnB1c2goXHJcbiAgICAuLi5uZXcgQXJyYXkoNTEyKS5maWxsKDApLm1hcCgoKSA9PiAoe1xyXG4gICAgICAuLi57IHg6IE1hdGgucmFuZG9tKCkgKiB3aWR0aCwgeTogTWF0aC5yYW5kb20oKSAqIGhlaWdodCB9LFxyXG4gICAgICAuLi57IGhvbWU6IDAsIGZvb2Q6IDAsIHdhbmRlcmluZzogdHJ1ZSwgY2Fycnlpbmc6IGZhbHNlIH0sXHJcbiAgICAgIGRpcmVjdGlvbjogTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyLFxyXG4gICAgfSkpXHJcbiAgKTtcclxuICBmb29kcy5wdXNoKFxyXG4gICAgLi4ubmV3IEFycmF5KDMpLmZpbGwoMCkubWFwKCgpID0+ICh7XHJcbiAgICAgIHg6IE1hdGgucmFuZG9tKCkgKiB3aWR0aCxcclxuICAgICAgeTogTWF0aC5yYW5kb20oKSAqIGhlaWdodCxcclxuICAgICAgcmFkaXVzOiA0LFxyXG4gICAgfSkpXHJcbiAgKTtcclxuXHJcbiAgaG9tZS54ID0gMzI7XHJcbiAgaG9tZS55ID0gaGVpZ2h0IC8gMjtcclxuXHJcbiAgUmVuZGVyKGN0eCk7XHJcbn0pO1xyXG5cclxuY29uc3QgUmVuZGVyID0gKGN0eDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSA9PiB7XHJcbiAgY29uc3Qgd2lkdGggPSBkb2N1bWVudC5ib2R5Lm9mZnNldFdpZHRoO1xyXG4gIGNvbnN0IGhlaWdodCA9IGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0O1xyXG4gIGN0eC5jYW52YXMuc3R5bGUud2lkdGggPSBgJHsoY3R4LmNhbnZhcy53aWR0aCA9IHdpZHRoKX1gO1xyXG4gIGN0eC5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7KGN0eC5jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0KX1gO1xyXG4gIGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KSc7XHJcbiAgY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xyXG5cclxuICBjdHguc2F2ZSgpO1xyXG4gIGN0eC5zY2FsZShzY2FsZSwgc2NhbGUpO1xyXG5cclxuICBhbnRzLmZvckVhY2goYW50ID0+IHtcclxuICAgIGN0eC5maWxsU3R5bGUgPSBhbnQuY2FycnlpbmcgPyAncmVkJyA6ICdibGFjayc7XHJcbiAgICBjdHguZmlsbFJlY3QoYW50LngsIGFudC55LCAxLCAxKTtcclxuICB9KTtcclxuICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnO1xyXG4gIGZvb2RzLmZvckVhY2goZm9vZCA9PiB7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKGZvb2QueCwgZm9vZC55LCBmb29kLnJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgY3R4LmZpbGwoKTtcclxuICB9KTtcclxuXHJcbiAgY3R4LmZpbGxTdHlsZSA9ICdncmVlbic7XHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5hcmMoaG9tZS54LCBob21lLnksIGhvbWUucmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XHJcbiAgY3R4LmZpbGwoKTtcclxuXHJcbiAgY29uc3QgdXBkYXRlcyA9IFVwZGF0ZSgpO1xyXG4gIHVwZGF0ZXMuZm9yRWFjaCgoW3gxLCB5MSwgeDIsIHkyLCBmb29kLCBob21lXSkgPT4ge1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gYHJnYmEoJHtmb29kICYmIGhvbWUgPyAxMjggOiAwfSwgJHtcclxuICAgICAgZm9vZCAmJiAhaG9tZSA/IDAgOiAxMjhcclxuICAgIH0sICR7Zm9vZCAmJiAhaG9tZSA/IDEyOCA6IDB9LCAwLjA1KWA7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHgubW92ZVRvKHgxICsgMC41LCB5MSArIDAuNSk7XHJcbiAgICBjdHgubGluZVRvKHgyICsgMC41LCB5MiArIDAuNSk7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgfSk7XHJcblxyXG4gIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xyXG4gIGN0eC5mb250ID0gJzhweCBtb25vc3BhY2UnO1xyXG4gIGN0eC5maWxsVGV4dChgQ29sbGVjdGVkICR7Y29sbGVjdGVkfWAsIDIsIDgpO1xyXG5cclxuICBjdHgucmVzdG9yZSgpO1xyXG5cclxuICBzZXRUaW1lb3V0KCgpID0+IFJlbmRlcihjdHgpLCAxMCk7XHJcbn07XHJcblxyXG5jb25zdCBuZWFyID0gKGE6IFZlYywgYjogVmVjLCByYWRpdXM6IG51bWJlcikgPT5cclxuICBhLnggPiBiLnggLSByYWRpdXMgJiZcclxuICBhLnggPCBiLnggKyByYWRpdXMgJiZcclxuICBhLnkgPiBiLnkgLSByYWRpdXMgJiZcclxuICBhLnkgPCBiLnkgKyByYWRpdXM7XHJcblxyXG5jb25zdCBVcGRhdGUgPSAoKSA9PiB7XHJcbiAgY29uc3QgdXBkYXRlczogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciwgYm9vbGVhbiwgYm9vbGVhbl1bXSA9IFtdO1xyXG5cclxuICBhbnRzLmZvckVhY2goYW50ID0+IHtcclxuICAgIGFudC54ICs9IE1hdGguY29zKGFudC5kaXJlY3Rpb24pICogc3BlZWQ7XHJcbiAgICBhbnQueSArPSBNYXRoLnNpbihhbnQuZGlyZWN0aW9uKSAqIHNwZWVkO1xyXG5cclxuICAgIGlmIChhbnQueCA8IDApIHtcclxuICAgICAgYW50LmRpcmVjdGlvbiA9IE1hdGguUEkgLSBhbnQuZGlyZWN0aW9uO1xyXG4gICAgICBhbnQud2FuZGVyaW5nID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGlmIChhbnQueCA+IGRvY3VtZW50LmJvZHkub2Zmc2V0V2lkdGggLyBzY2FsZSkge1xyXG4gICAgICBhbnQuZGlyZWN0aW9uID0gTWF0aC5QSSAtIGFudC5kaXJlY3Rpb247XHJcbiAgICAgIGFudC53YW5kZXJpbmcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKGFudC55IDwgMCkge1xyXG4gICAgICBhbnQuZGlyZWN0aW9uID0gLWFudC5kaXJlY3Rpb247XHJcbiAgICAgIGFudC53YW5kZXJpbmcgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKGFudC55ID4gZG9jdW1lbnQuYm9keS5vZmZzZXRIZWlnaHQgLyBzY2FsZSkge1xyXG4gICAgICBhbnQuZGlyZWN0aW9uID0gLWFudC5kaXJlY3Rpb247XHJcbiAgICAgIGFudC53YW5kZXJpbmcgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChuZWFyKGFudCwgaG9tZSwgaG9tZS5yYWRpdXMpICYmIGFudC5jYXJyeWluZykge1xyXG4gICAgICBhbnQuY2FycnlpbmcgPSBmYWxzZTtcclxuICAgICAgYW50LmhvbWUgPSAwO1xyXG4gICAgICBhbnQuZGlyZWN0aW9uICs9IE1hdGguUEk7XHJcbiAgICAgICsrY29sbGVjdGVkO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghYW50LmNhcnJ5aW5nKSB7XHJcbiAgICAgIGZvb2RzLmZvckVhY2goZm9vZCA9PiB7XHJcbiAgICAgICAgaWYgKG5lYXIoYW50LCBmb29kLCBmb29kLnJhZGl1cykpIHtcclxuICAgICAgICAgIGFudC5jYXJyeWluZyA9IHRydWU7XHJcbiAgICAgICAgICBhbnQuZm9vZCA9IDA7XHJcbiAgICAgICAgICBhbnQuZGlyZWN0aW9uICs9IE1hdGguUEk7XHJcbiAgICAgICAgICBmb29kLnJhZGl1cyAtPSAwLjAwMTtcclxuICAgICAgICAgIGlmIChmb29kLnJhZGl1cyA8IDEpIHtcclxuICAgICAgICAgICAgZm9vZC54ID0gKE1hdGgucmFuZG9tKCkgKiBkb2N1bWVudC5ib2R5Lm9mZnNldFdpZHRoKSAvIHNjYWxlO1xyXG4gICAgICAgICAgICBmb29kLnkgPSAoTWF0aC5yYW5kb20oKSAqIGRvY3VtZW50LmJvZHkub2Zmc2V0SGVpZ2h0KSAvIHNjYWxlO1xyXG4gICAgICAgICAgICBmb29kLnJhZGl1cyA9IDQ7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYW50LndhbmRlcmluZykge1xyXG4gICAgICBhbnQuZGlyZWN0aW9uICs9IE1hdGgucmFuZG9tKCkgKiAwLjEgLSAwLjA1O1xyXG4gICAgfVxyXG4gICAgKythbnQuZm9vZDtcclxuICAgICsrYW50LmhvbWU7XHJcbiAgfSk7XHJcblxyXG4gIGFudHMuZm9yRWFjaChhbnQgPT4ge1xyXG4gICAgYW50cy5mb3JFYWNoKG90aGVyID0+IHtcclxuICAgICAgaWYgKGFudCA9PT0gb3RoZXIpIHJldHVybjtcclxuICAgICAgaWYgKCFuZWFyKGFudCwgb3RoZXIsIHNjcmVhbVJhZGl1cykpIHJldHVybjtcclxuICAgICAgY29uc3QgZiA9IGFudC5mb29kICsgc2NyZWFtUmFkaXVzO1xyXG4gICAgICBjb25zdCBoID0gYW50LmhvbWUgKyBzY3JlYW1SYWRpdXM7XHJcbiAgICAgIGNvbnN0IGNsb3NlckZvb2QgPSBmIDwgb3RoZXIuZm9vZDtcclxuICAgICAgY29uc3QgY2xvc2VySG9tZSA9IGggPCBvdGhlci5ob21lO1xyXG4gICAgICBjb25zdCBnb0Zvb2QgPSAhb3RoZXIuY2FycnlpbmcgJiYgY2xvc2VyRm9vZDtcclxuICAgICAgY29uc3QgZ29Ib21lID0gb3RoZXIuY2FycnlpbmcgJiYgY2xvc2VySG9tZTtcclxuICAgICAgY29uc3QgbmV3RGlyID1cclxuICAgICAgICBNYXRoLmF0YW4yKGFudC55IC0gb3RoZXIueSwgYW50LnggLSBvdGhlci54KSArXHJcbiAgICAgICAgTWF0aC5yYW5kb20oKSAqIDAuNSAtXHJcbiAgICAgICAgMC4yNTtcclxuICAgICAgaWYgKGNsb3NlckZvb2QpIHtcclxuICAgICAgICBvdGhlci5mb29kID0gZjtcclxuICAgICAgfSBlbHNlIGlmIChjbG9zZXJIb21lKSB7XHJcbiAgICAgICAgb3RoZXIuaG9tZSA9IGg7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGNsb3NlckZvb2QgfHwgY2xvc2VySG9tZSkge1xyXG4gICAgICAgIHVwZGF0ZXMucHVzaChbYW50LngsIGFudC55LCBvdGhlci54LCBvdGhlci55LCBjbG9zZXJGb29kLCBjbG9zZXJIb21lXSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGdvRm9vZCB8fCBnb0hvbWUpIHtcclxuICAgICAgICBvdGhlci5kaXJlY3Rpb24gPSBuZXdEaXI7XHJcbiAgICAgICAgb3RoZXIud2FuZGVyaW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4gdXBkYXRlcztcclxufTtcclxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSB7fTtcbl9fd2VicGFja19tb2R1bGVzX19bXCIuL3NyYy9pbmRleC50c1wiXSgpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
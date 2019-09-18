"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var coefficientV = 2.5;

function Particle(conf) {
  var seed1, seed2;
  seed1 = Math.random();
  seed2 = Math.random();
  var obj = conf;
  obj['color'] = conf.color;
  obj['x'] = conf.x;
  obj['y'] = conf.y;
  obj['dx'] = conf.dx;
  obj['dy'] = conf.dy; //obj['vx'] = 6+seed1 * coefficientV;
  //obj['vy'] = 6+seed2 * coefficientV;

  obj['seed'] = Math.abs(seed2 - seed1) * coefficientV;
  obj["vx"] = Math.abs(obj["dx"] - obj["x"]) / (32 * obj["seed"]);
  obj["vy"] = Math.abs(obj["dy"] - obj["y"]) / (24 * obj["seed"]);
  return obj;
}

function resetParticle(particle, conf) {
  particle["dx"] = conf["x"];
  particle["dy"] = conf["y"];
  particle["vx"] = Math.abs(particle["dx"] - particle["x"]) / (32 * particle["seed"]);
  particle["vy"] = Math.abs(particle["dy"] - particle["y"]) / (24 * particle["seed"]);
}

function shuffle(arr) {
  //shuffle
  var tmp;

  for (var i = 1; i < arr.length; i++) {
    var random = Math.floor(Math.random() * (i + 1));
    tmp = arr[i];
    arr[i] = arr[random];
    arr[random] = tmp;
  }
}

var CanvasImgSwitch =
/*#__PURE__*/
function () {
  function CanvasImgSwitch(conf) {
    _classCallCheck(this, CanvasImgSwitch);

    if (!conf) conf = {};
    this.conf = {
      id: conf.id || 'imgContainer'
    };
    this.imgArr = conf.imgArr;
    this.canvas = document.querySelector("#" + this.conf.id);
    this.context = this.canvas.getContext("2d");
    this.imgData = [];
    this.underCanvas = {};
    this.particleArr = [];
    this.animateParticleArr = [];
    this.rightPlaceParticleArr = [];
  }

  _createClass(CanvasImgSwitch, [{
    key: "paintImg",
    value: function paintImg(src) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (_this.underCanvas[src]) {
          _this.conf.width = _this.underCanvas[src].width;
          _this.conf.height = _this.underCanvas[src].height;
          _this.imgData = _this.underCanvas[src].getContext("2d").getImageData(0, 0, _this.conf.width, _this.conf.height);
          resolve();
        } else {
          var underCanvas = document.createElement("canvas");
          underCanvas.setAttribute("style", "opacity:0;position:absolute;z-index:-1000;");
          var at = new Date();
          var context = underCanvas.getContext("2d");
          var img = new Image();
          img.src = src;

          img.onload = function () {
            var width = img.width;
            var height = img.height;

            while (width + height > 2400) {
              width = width / 2;
              height = height / 2;
            }

            underCanvas.width = _this.conf.width = width;
            underCanvas.height = _this.conf.height = height;
            context.drawImage(img, 0, 0, width, height);
            console.log('image draw');
            console.log(new Date().getTime() - at.getTime());
            _this.imgData = context.getImageData(0, 0, _this.conf.width, _this.conf.height);
            _this.underCanvas[src] = underCanvas;
            resolve('success');
          };
        }
      });
    }
  }, {
    key: "constructImageDataArr",
    value: function constructImageDataArr() {
      var i,
          j,
          x,
          y,
          _this = this,
          imgData = _this.imgData;

      _this.imgDataArr = [];
      var xg = Math.floor(imgData.width / 4),
          yg = Math.floor(imgData.height / 4);

      for (x = 0; x < imgData.width; x += 1) {
        for (y = 0; y < imgData.height; y += 1) {
          j = (y * imgData.width + x) * 4;
          if (imgData.data[j + 3] < 64) continue;
          var point = {
            x: x,
            y: y,
            color: 'rgba(255,255,255,' + imgData.data[j + 3] / 255 + ')'
          };

          _this.imgDataArr.push(point);
        }
      }

      console.log(_this.imgDataArr.length);
      shuffle(_this.imgDataArr);
      /*
      while (_this.imgDataArr.length > 24000) {
          _this.imgDataArr.splice(Math.floor(Math.random() * _this.imgDataArr.length), 10);
      }*/

      var limit = 24000;

      _this.imgDataArr.splice(limit, _this.imgDataArr.length - limit + 1);

      imgData = null;
    }
  }, {
    key: "grayScale",
    value: function grayScale(imgData) {
      var loc,
          _this = this,
          grayValue;

      var data = imgData.data;
      var newImgData = [];

      for (loc = 0; loc < data.length; loc += 4) {
        grayValue = 0.299 * data[loc] + 0.587 * data[loc + 1] + 0.114 * data[loc + 2];
        newImgData.push(grayValue);
        newImgData.push(grayValue);
        newImgData.push(grayValue);
        newImgData.push(data[loc + 3]);
      }

      return newImgData;
    }
  }, {
    key: "getEdges",
    value: function getEdges() {
      var loc,
          x,
          y,
          _this = this,
          imgData = _this.imgData,
          i,
          val;

      var width = imgData.width,
          height = imgData.height;
      var data = imgData.data; //let data=_this.grayScale(imgData);

      var lineLength = 4 * width;
      var edgePoints = [];
      var m = [-1, -1, -1, -1, 8, -1, -1, -1, -1]; //let m=[0,-1,0,-1,4,-1,0,-1,0];

      for (x = 1; x < width - 1; x += 1) {
        for (y = 1; y < height - 1; y += 1) {
          loc = (y * width + x) * 4;
          if (data[loc + 3] < 64) continue;
          var rgb = [],
              flag = 1;

          for (i = 0; i < 3; i++) {
            val = data[loc - lineLength - 4 + i] * m[0] + data[loc - lineLength + i] * m[1] + data[loc - lineLength + 4 + i] * m[2];
            val += data[loc - 4 + i] * m[3] + data[loc + i] * m[4] + data[loc + 4 + i] * m[5];
            val += data[loc + lineLength - 4 + i] * m[6] + data[loc + lineLength + i] * m[7] + data[loc + lineLength + 4 + i] * m[8];
            val = 255 - 0.3 * val;

            if (val >= 255) {
              flag = 0;
              break;
            }

            rgb.push(val);
          }

          if (!flag) continue;
          var point = {
            x: x,
            y: y,
            color: 'rgba(255,255,255,' + imgData.data[loc + 3] / 255 + ')'
          };
          edgePoints.push(point);
        }
      }

      shuffle(edgePoints);
      _this.imgDataArr = edgePoints;
      var limit = 40000;

      _this.imgDataArr.splice(limit, _this.imgDataArr.length - limit + 1);
    }
  }, {
    key: "refreshCanvas",
    value: function refreshCanvas(_this) {
      console.log(1);

      _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);

      _this.context.putImageData(_this.imgBuff, 0, 0);

      _this.rightPlaceParticleArr = [];
      var i = _this.animateParticleArr.length - 1;
      var limit = Math.max(-1, this.animateParticleArr.length - 8000);

      for (; i > limit; i--) {
        var p = _this.animateParticleArr[i];

        if (p.dx !== p.x) {
          if (Math.abs(p.dx - p.x) < p.vx) {
            p.x = p.dx;
          } else if (p.dx < p.x) {
            p.x -= p.vx;
          } else {
            p.x += p.vx;
          }
        }

        if (p.dy !== p.y) {
          if (Math.abs(p.dy - p.y) < p.vy) {
            p.y = p.dy;
          } else if (p.dy < p.y) {
            p.y -= p.vy;
          } else {
            p.y += p.vy;
          }
        }

        if (p.dx === p.x && p.dy === p.y) {
          _this.animateParticleArr.splice(i, 1);

          _this.particleDraw(p);
        }
      }

      _this.imgBuff = _this.context.getImageData(0, 0, _this.canvas.width, _this.canvas.height);
      i = _this.animateParticleArr.length - 1; //limit=Math.min(-1,this.animateParticleArr.length-9000);

      for (; i > -1; i--) {
        _this.particleDraw(_this.animateParticleArr[i]);
      }

      if (!_this.animateParticleArr.length) {
        cancelAnimationFrame(_this.requestId);
      } else {
        _this.requestId = requestAnimationFrame(function () {
          _this.refreshCanvas(_this);
        });
      }
    }
  }, {
    key: "drawImage",
    value: function drawImage(src) {
      var _this2 = this;

      var _this = this;

      cancelAnimationFrame(_this.requestId);
      this.paintImg(src).then(function () {
        _this2.canvas.width = _this2.conf.width;
        _this2.canvas.height = _this2.conf.height;
        _this2.animateParticleArr = [];

        _this.context.clearRect(0, 0, _this.conf.width, _this.conf.height);

        _this2.context.fillStyle = '#fff';

        _this2.getEdges();

        var i = 0;

        if (_this2.particleArr.length > _this2.imgDataArr.length) {
          for (i = _this2.imgDataArr.length; i < _this2.particleArr.length; i++) {
            _this2.particleArr[i] = null;
          }

          _this2.particleArr.splice(_this2.imgDataArr.length, _this2.particleArr.length - _this2.imgDataArr.length + 1);
        }

        for (i = 0; i < _this2.particleArr.length; i++) {
          resetParticle(_this2.particleArr[i], _this2.imgDataArr[i]);

          _this2.animateParticleArr.push(_this2.particleArr[i]);
        }

        if (!_this2.particleArr.length) {
          for (; i < _this2.imgDataArr.length; i++) {
            var p = Particle(_this2.imgDataArr[i]);
            i % 2 ? _this2.particleArr.push(p) : _this2.particleArr.unshift(p);

            _this2.particleDraw(p);
          }
        } else {
          var bx = _this2.particleArr[0].dx;
          var by = _this2.particleArr[0].dy;
          var pSize = _this2.particleArr.length;

          for (; i < _this2.imgDataArr.length; i++) {
            var _p = Particle({
              color: _this2.imgDataArr[i].color,
              dx: _this2.imgDataArr[i].x,
              dy: _this2.imgDataArr[i].y,
              x: _this2.particleArr[i % pSize].dx,
              y: _this2.particleArr[i % pSize].dy
            });

            _this2.particleArr.push(_p);

            _this2.animateParticleArr.push(_p);
          }

          shuffle(_this2.animateParticleArr);

          _this.context.clearRect(0, 0, _this.conf.width, _this.conf.height);

          _this2.imgBuff = _this2.context.getImageData(0, 0, _this2.canvas.width, _this2.canvas.height);
          console.log(_this.particleArr.length);
          cancelAnimationFrame(_this.requestId);

          _this.refreshCanvas(_this);
        }
      });
    }
  }, {
    key: "particleDraw",
    value: function particleDraw(particle) {
      var context = this.context; //优化

      /*
      context.arc(particle.x, particle.y, 1, 0, 2 * Math.PI);
      context.fillStyle = particle.color;
      context.fill();*/
      //context.fillStyle = particle.color;

      context.fillRect(0.5 + particle.x << 0, 0.5 + particle.y << 0, 1, 1);
    } //for test

  }, {
    key: "intervalSwitch",
    value: function intervalSwitch(time, turns) {
      var i = 0;

      var _this = this;

      var intervalTime = time || _this.conf["intervalTime"] || 6000;

      _this.drawImage(_this.imgArr[i % _this.imgArr.length]);

      i++;
      var id = setInterval(function () {
        console.log(i);
        console.log(_this.imgArr[i % _this.imgArr.length]);

        _this.drawImage(_this.imgArr[i % _this.imgArr.length]);

        i++;

        if (turns) {
          if (i > turns) {
            clearInterval(id);
          }
        }
      }, intervalTime);
    }
  }, {
    key: "init",
    value: function init() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var promiseArr = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = _this3.imgArr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var src = _step.value;
            promiseArr.push(_this3.paintImg(src));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        Promise.all(promiseArr).then(function () {
          resolve();
        });
      });
    }
  }, {
    key: "playIndex",
    value: function playIndex(index) {
      this.drawImage(this.imgArr[index % this.imgArr.length]);
    }
  }]);

  return CanvasImgSwitch;
}();

exports["default"] = CanvasImgSwitch;
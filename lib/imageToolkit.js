"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ImageToolkit =
/*#__PURE__*/
function () {
  function ImageToolkit(conf) {
    _classCallCheck(this, ImageToolkit);

    if (!conf) conf = {};
    this.conf = {
      width: conf.width || 1200,
      height: conf.height || 720
    };
    this.imgArr = conf.imgArr;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");
    this.imgData = [];
    this.underCanvas = {};
  }

  _createClass(ImageToolkit, [{
    key: "loadImg",
    value: function loadImg(src) {
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

      imgData = null;
    }
  }]);

  return ImageToolkit;
}();

exports["default"] = ImageToolkit;
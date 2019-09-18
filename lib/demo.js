"use strict";

var _imageToolkit = _interopRequireDefault(require("./imageToolkit.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var imgArr = ["img/deer.png", "img/fox.png", "img/koala.jpg"];
var imageToolkit = new _imageToolkit["default"]({
  imgArr: imgArr
});
var currentIndex = 0;
var count = 4;
$(document).ready(function () {});
"use strict";

var _canvasImgSwitch = _interopRequireDefault(require("./canvasImgSwitch.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var imgArr = ["img/deer.png", "img/fox.png", "img/bear.png", "img/giraffe.png", "img/crow.png", "img/sneakybird.png"];
var canvasImgSwitch = new _canvasImgSwitch["default"]({
  id: "imgContainer",
  imgArr: imgArr
});
var currentIndex = 0;
var count = 6;
canvasImgSwitch.init().then(function () {
  //canvasImgSwitch.intervalSwitch(6000,6);
  canvasImgSwitch.playIndex(0);
});
$(document).ready(function () {
  var playLock = 0;
  var bgs = $(".bg");

  function playNext() {
    if (playLock) {
      return;
    }

    playLock = 1;
    currentIndex++;
    canvasImgSwitch.playIndex(currentIndex % count);

    if (window.innerWidth < 1024 && currentIndex === 2) {
      $("#imgContainer").css({
        "transform": "scale(0.7,0.5)"
      });
    } else {
      $("#imgContainer")[0].removeAttribute("style");
    }

    var past = $(".present").removeClass("present").addClass("past"); //$(".content").eq(currentIndex).removeClass("future").addClass("present");

    bgs.eq(currentIndex % bgs.length).removeClass("future").addClass("present");
    setTimeout(function () {
      past.removeClass("past").addClass("future");
      playLock = 0;
    }, 1200);
  }

  $("html,body").swipe({
    //Generic swipe handler for all directions
    swipe: function swipe(event, direction, distance, duration, fingerCount, fingerData) {
      if (direction === "left" || direction === "up") {
        playNext();
      }
    }
  });
  $(".float-btn").click(playNext);
});
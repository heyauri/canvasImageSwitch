
import CanvasImgSwitch from "./canvasImgSwitch.js"

let imgArr=["img/deer.png","img/fox.png","img/bear.png","img/giraffe.png","img/crow.png","img/sneakybird.png"];
let canvasImgSwitch=new CanvasImgSwitch({
    id:"imgContainer",
    retina:false,
    imgArr:imgArr
});

let currentIndex=0;
let count=6;

canvasImgSwitch.init().then(()=>{
    //canvasImgSwitch.intervalSwitch(6000,6);
    canvasImgSwitch.playIndex(0);
});



$(document).ready(function(){
    let playLock=0;
    let bgs=$(".bg");
    function playNext(){
        if(playLock){
            return;
        }
        playLock=1;
        currentIndex++;
        canvasImgSwitch.playIndex(currentIndex%count);
        if(window.innerWidth<1024 && currentIndex===2){
            $("#imgContainer").css({
                "transform":"scale(0.7,0.5)"
            });
        }else{
            $("#imgContainer")[0].removeAttribute("style");
        }
        let past=$(".present").removeClass("present").addClass("past");
        //$(".content").eq(currentIndex).removeClass("future").addClass("present");
        bgs.eq(currentIndex % bgs.length).removeClass("future").addClass("present");
        setTimeout(()=>{
            past.removeClass("past").addClass("future");
            playLock=0;
        },1200);
    }

    $("html,body").swipe({
        //Generic swipe handler for all directions
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
            if(direction==="left"||direction==="up"){
                playNext();
            }
        }
    });

    $(".float-btn").click(playNext);
});



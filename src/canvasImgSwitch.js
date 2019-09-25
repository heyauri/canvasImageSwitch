const coefficientV = 2;

function Particle(conf) {
    let seed1, seed2;
    seed1 = Math.random();
    seed2 = Math.random();
    let obj = conf;
    obj['color'] = conf.color;
    obj['x'] = conf.x;
    obj['y'] = conf.y;
    obj['dx'] = conf.dx;
    obj['dy'] = conf.dy;
    //obj['vx'] = 6+seed1 * coefficientV;
    //obj['vy'] = 6+seed2 * coefficientV;
    obj['seed'] = Math.abs(seed2 - seed1) * coefficientV;
    obj["vx"] = Math.abs(obj["dx"] - obj["x"]) / (28 * obj["seed"]);
    obj["vy"] = Math.abs(obj["dy"] - obj["y"]) / (24 * obj["seed"]);

    return obj;
}

function resetParticle(particle, conf) {
    particle["dx"] = conf["x"];
    particle["dy"] = conf["y"];
    particle["vx"] = Math.abs(particle["dx"] - particle["x"]) / (28 * particle["seed"]);
    particle["vy"] = Math.abs(particle["dy"] - particle["y"]) / (24 * particle["seed"]);
}

function shuffle(arr){
    //shuffle
    let tmp;
    for (let i = 1; i < arr.length; i++) {
        const random = Math.floor(Math.random() * (i + 1));
        tmp=arr[i];
        arr[i]=arr[random];
        arr[random]=tmp;
    }
}


export default class CanvasImgSwitch {
    constructor(conf) {
        if (!conf) conf = {};
        this.conf = {
            id: conf.id || 'imgContainer',
            retina: conf.retina || false
        };
        this.imgArr = conf.imgArr;
        this.canvas = document.querySelector("#" + this.conf.id);
        this.context = this.canvas.getContext("2d");
        this.imgData = [];
        this.underCanvas = {};
        this.particleArr = [];
        this.animateParticleArr = [];
    }

    paintImg(src) {
        let _this = this;
        return new Promise((resolve, reject) => {
            if(_this.underCanvas[src]){
                _this.conf.width = _this.underCanvas[src].width;
                _this.conf.height = _this.underCanvas[src].height;
                _this.imgData = _this.underCanvas[src].getContext("2d").getImageData(0, 0, _this.conf.width, _this.conf.height);
                resolve();
            }else{
                let underCanvas = document.createElement("canvas");
                underCanvas.setAttribute("style", "opacity:0;position:absolute;z-index:-1000;");
                let at = new Date();
                let context = underCanvas.getContext("2d");
                let img = new Image();
                img.src = src;
                img.onload = function () {
                    let width = img.width;
                    let height = img.height;
                    if(_this.conf.retina){
                        width*=2;
                        height*=2;
                    }
                    underCanvas.width = _this.conf.width = width;
                    underCanvas.height = _this.conf.height = height;
                    context.drawImage(img, 0, 0, width, height);
                    console.log('image draw');
                    console.log(new Date().getTime() - at.getTime());
                    _this.imgData = context.getImageData(0, 0, _this.conf.width, _this.conf.height);
                    _this.underCanvas[src]=underCanvas;
                    resolve('success');
                };
            }

        });
    }

    constructImageDataArr() {
        let i, j, x, y, _this = this, imgData = _this.imgData;
        _this.imgDataArr = [];
        for (x = 0; x < imgData.width; x += 1) {
            for (y = 0; y < imgData.height; y += 1) {
                j = (y * imgData.width + x) * 4;
                if (imgData.data[j + 3] < 64) continue;
                let point = {
                    x: x,
                    y: y,
                    color: 'rgba(255,255,255,' + (imgData.data[j + 3] / 255) + ')'
                };
                _this.imgDataArr.push(point);

            }
        }
        console.log(_this.imgDataArr.length);
        shuffle(_this.imgDataArr);
        let limit=24000;
        _this.imgDataArr.splice(limit,_this.imgDataArr.length-limit+1);
        imgData = null;
    }
    grayScale(imgData) {
        let loc, _this = this,grayValue;
        let data=imgData.data;
        let newImgData=[];
        for (loc = 0; loc <data.length; loc += 4) {
            grayValue=0.299 * data[loc] + 0.587 * data[loc+1]+ 0.114 * data[loc+2];
            newImgData.push(grayValue);
            newImgData.push(grayValue);
            newImgData.push(grayValue);
            newImgData.push(data[loc+3]);
        }
        return newImgData
    }
    getEdges() {
        let loc, x, y, _this = this, imgData = _this.imgData,i,val;
        let width=imgData.width,height=imgData.height;
        let data=imgData.data;
        //let data=_this.grayScale(imgData);
        let lineLength=4*width;
        let edgePoints = [];
        let m=[-1,-1,-1,-1,8,-1,-1,-1,-1];
        //let m=[0,-1,0,-1,4,-1,0,-1,0];
        for (x = 1; x < width-1; x += 1) {
            for (y = 1; y < height-1; y += 1) {
                loc = (y * width + x) * 4;
                if (data[loc+ 3] < 64) continue;
                let rgb=[],flag=1;
                for(i=0;i<3;i++){
                    val=data[loc-lineLength-4+i]*m[0]+data[loc-lineLength+i]*m[1]+data[loc-lineLength+4+i]*m[2];
                    val+=data[loc-4+i]*m[3]+data[loc+i]*m[4]+data[loc+4+i]*m[5];
                    val+=data[loc+lineLength-4+i]*m[6]+data[loc+lineLength+i]*m[7]+data[loc+lineLength+4+i]*m[8];
                    val=255-0.3*val;
                    if(val>=255){
                        flag=0;
                        break;
                    }
                    rgb.push(val);
                }
                if(!flag) continue;

                let point = {
                    x: x,
                    y: y,
                    color: 'rgba(255,255,255,' + (imgData.data[loc + 3] / 255) + ')'
                };
                edgePoints.push(point);
            }
        }
        shuffle(edgePoints);
        _this.imgDataArr=edgePoints;
        let limit=30000;
        _this.imgDataArr.splice(limit,_this.imgDataArr.length-limit+1);
    }


    refreshCanvas(_this) {
        console.log(1);
        _this.context.clearRect(0, 0, _this.canvas.width, _this.canvas.height);
        _this.context.putImageData(_this.imgBuff, 0, 0);
        _this.rightPlaceParticleArr = [];
        let i = _this.animateParticleArr.length - 1;
        let limit = Math.max(-1, this.animateParticleArr.length - 8000);
        for (; i > limit; i--) {
            let p = _this.animateParticleArr[i];
            if (p.dx !== p.x) {
                if (Math.abs(p.dx - p.x) < p.vx) {
                    p.x = p.dx;
                }
                else if (p.dx < p.x) {
                    p.x -= p.vx;
                } else {
                    p.x += p.vx;
                }
            }
            if (p.dy !== p.y) {
                if (Math.abs(p.dy - p.y) < p.vy) {
                    p.y = p.dy;
                }
                else if (p.dy < p.y) {
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
        i = _this.animateParticleArr.length - 1;
        //limit=Math.min(-1,this.animateParticleArr.length-9000);
        for (; i > -1; i--) {
            _this.particleDraw(_this.animateParticleArr[i]);
        }
        if (!_this.animateParticleArr.length) {
            cancelAnimationFrame(_this.requestId);
        } else {
            _this.requestId = requestAnimationFrame(() => {
                _this.refreshCanvas(_this)
            });
        }
    }

    drawImage(src) {
        let _this = this;
        cancelAnimationFrame(_this.requestId);
        this.paintImg(src).then(() => {
            this.canvas.width = this.conf.width;
            this.canvas.height = this.conf.height;
            if(_this.conf.retina){
                _this.canvas.setAttribute("style","transform:scale(0.5,0.5)");
            }
            this.animateParticleArr = [];
            _this.context.clearRect(0, 0, _this.conf.width, _this.conf.height);
            this.context.fillStyle = '#fff';
            this.getEdges();
            let i = 0;
            if (this.particleArr.length > this.imgDataArr.length) {
                for (i = this.imgDataArr.length; i < this.particleArr.length; i++) {
                    this.particleArr[i] = null;
                }
                this.particleArr.splice(this.imgDataArr.length, this.particleArr.length - this.imgDataArr.length + 1);
            }
            for (i = 0; i < this.particleArr.length; i++) {
                resetParticle(this.particleArr[i], this.imgDataArr[i]);
                this.animateParticleArr.push(this.particleArr[i]);
            }
            if (!this.particleArr.length) {
                for (; i < this.imgDataArr.length; i++) {
                    let p = Particle(this.imgDataArr[i]);
                    i % 2 ? this.particleArr.push(p) : this.particleArr.unshift(p);
                    this.particleDraw(p);
                }
            } else {
                let bx=this.particleArr[0].dx;
                let by=this.particleArr[0].dy;
                let pSize=this.particleArr.length;
                for (; i < this.imgDataArr.length; i++) {
                    let p = Particle({
                        color: this.imgDataArr[i].color,
                        dx: this.imgDataArr[i].x,
                        dy: this.imgDataArr[i].y,
                        x: this.particleArr[i%pSize].dx,
                        y: this.particleArr[i%pSize].dy,
                    });
                    this.particleArr.push(p);
                    this.animateParticleArr.push(p);
                }
                shuffle(this.animateParticleArr);
                _this.context.clearRect(0, 0, _this.conf.width, _this.conf.height);
                this.imgBuff = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                console.log(_this.particleArr.length);
                cancelAnimationFrame(_this.requestId);
                _this.refreshCanvas(_this);
            }
        });
    }

    particleDraw(particle) {
        let context = this.context;
        //优化
        /*
        context.arc(particle.x, particle.y, 1, 0, 2 * Math.PI);
        context.fillStyle = particle.color;
        context.fill();*/
        //context.fillStyle = particle.color;
        context.fillRect((0.5 + particle.x) << 0, (0.5 + particle.y) << 0, 1, 1);
    }

    //for test
    intervalSwitch(time,turns) {
        let i = 0;
        let _this = this;
        let intervalTime=time||_this.conf["intervalTime"]||6000;
        _this.drawImage(_this.imgArr[i % _this.imgArr.length]);
        i++;
        let id = setInterval(function () {
            console.log(i);
            console.log(_this.imgArr[i % _this.imgArr.length]);
            _this.drawImage(_this.imgArr[i % _this.imgArr.length]);
            i++;
            if(turns){
                if (i > turns) {
                    clearInterval(id);
                }
            }
        }, intervalTime);
    }

    init() {
        return new Promise((resolve,reject)=>{
            let promiseArr=[];
            for (let src of this.imgArr){
                promiseArr.push(this.paintImg(src));
            }
            Promise.all(promiseArr).then(()=>{
                resolve();
            })
        });
     }

    playIndex(index) {
        this.drawImage(this.imgArr[index % this.imgArr.length]);
    }
}
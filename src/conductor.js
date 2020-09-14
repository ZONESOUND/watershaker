import {Mode, RecordMode} from './mode';
import {importAll, minmax, scale} from './ussage';
import * as Tone from 'tone';
console.log(Tone);
/***
 * 
 *  init=null,
    end=null,
    motion=null,
    onload
 */

const list = ['bass', 'piano', 'sax', 'drum'];

var pathList = [
    importAll(require.context('./sounds/jazz/bass', false, /\.(m4a|mp3)$/)),
    importAll(require.context('./sounds/jazz/piano', false, /\.(m4a|mp3)$/)),
    importAll(require.context('./sounds/jazz/sax', false, /\.(m4a|mp3)$/)),
    importAll(require.context('./sounds/jazz/drum', false, /\.(m4a|mp3)$/))
];

export class Conductor extends Mode {
    constructor(config) { 
        super(config);
        if (config) {
            if (config.onload) this.onloadCb = config.onload;
        }
        if (!this.config.motion) this.config.motion = this.changeRate;
        this.init();
        this.loaded = 0;
        this.avg = new Avg(50);
    }

    init() {
        this.players = [];
        console.log(pathList);
        pathList.forEach(path => {
            this.players.push(new Player(path, this.onload.bind(this)));
        });
    }

    onload() {
        this.loaded++;
        if (this.loaded == 4) {
            if (this.onloadCb) this.onloadCb();
            alert('all loaded!');
        }
    }

    changeRate(v) {
        console.log('change'); 
        let fv = 0;
        let low = 15, mid = 80, high = 200;
        let tlow = 0.4, tmid = 0.8, thigh = 1.1, tfi = 1.5;
        if (v < low) { // slow
            fv = scale(v, 0, low, tlow, tmid);
        } else if (v < mid) { // normal
            fv = scale(v, low, mid, tmid, thigh);
        } else { //fast
            fv = scale(v, mid, high, thigh, tfi);
        }
        fv = parseFloat(minmax(fv, tlow, tfi).toFixed(1));
        document.getElementById('biginstr').innerHTML = fv + '</br>' + minmax(fv, tlow, tfi) + '<br>' + toString(this.dm.orientVel);
        this.players.forEach(p=>{
            p.changeRate(fv);
        })
    }

    inMotion() {
        let v = this.calcV(this.dm.orientVel);
        let av = this.avg.get(v);
        //document.getElementById('biginstr').innerHTML = toString(this.dm.orientVel);
        this.changeRate(av);
    }

    calcV(v) {
        return Math.pow(v.pitch * v.pitch + v.roll * v.roll + v.yaw * v.yaw, 1/3);
    }

    startEnable() {
        this.players.forEach(p=>{
            p.play();
        })
    }

}


class Player {
    constructor(soundPath, onLoadCb = null) {
        this.soundPath = soundPath;
        this.players = [];
        this.current = 0;
        this.loaded = 0;
        this.onloadCb = onLoadCb;
        this.playbackRate = 1;
        this.initPlayer();
    }

    initPlayer() {
        this.soundPath.forEach(e => {
            let p = new Tone.Player(e.default, this.onload.bind(this)).toDestination()
            p.loop = true;
            //p.fadeIn
            this.players.push(p);
        });
    }

    onload() {
        this.loaded ++;
        if (this.loaded == this.soundPath.length) {
            if (this.onloadCb) this.onloadCb();
        }
    }

    play(ind = this.current) {
        if (this.players[ind].loaded) {
            this.players[ind].playbackRate = this.playbackRate;
            this.players[ind].start();
            this.current = ind;
        }
        
    }

    change() {
        let r = Math.floor(Math.random()*this.players.length);
        this.players[this.current].stop();      
        this.play(r);
    }

    changeRate(v) {
        this.playbackRate = v;
        this.players[this.current].playbackRate = v;
    }
}

class Avg {
    constructor(size = 10) {
        this.size = size;
        this.buffer = [];
        this.ind = 0;
    }

    get(now = null) {
        if (now != null) {
            if (this.buffer.length < this.size) {
                this.buffer.push(now);
            } else 
                this.buffer[this.ind] = now;
            this.ind = (this.ind + 1) % this.size;
        }
        return this.calcAvg();
    }

    calcAvg() {
        let sum = 0;
        for (let i=0; i<this.buffer.length; i++) {
            sum += this.buffer[i];
        }
        //return sum + "<br>" + this.buffer.length + "<br>" + sum/this.buffer.length;
        return sum / this.buffer.length;
    }
}

function toString(jsonData) {
    let html = "";
    for (let k in jsonData) {
        if (!k) continue;
        html += `${k}: ${jsonData[k]>0?"+":""}${jsonData[k].toFixed(3)} </br>`
    }
    return html;
}
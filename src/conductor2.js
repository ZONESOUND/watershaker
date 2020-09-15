import {Mode} from './mode';
import {importAll, minmax, scale, json2Str, Avg} from './ussage';
import {GrainPlayer, Transport, Gain} from 'tone';
/***
 * 
 *  init=null,
    end=null,
    motion=null,
    onload
 */

const list = ['bass', 'piano', 'sax', 'drum'];

var pathList = [
    importAll(require.context('./sounds/jazz/piano', false, /\.(m4a|mp3)$/)),
    importAll(require.context('./sounds/jazz/sax', false, /\.(m4a|mp3)$/)),
    importAll(require.context('./sounds/jazz/bass', false, /\.(m4a|mp3)$/)),
    importAll(require.context('./sounds/jazz/drum', false, /\.(m4a|mp3)$/))
];

export class Conductor extends Mode {
    constructor(config) { 
        super(config);
        if (!this.config.motion) this.config.motion = this.changeRate;
        this.loadNum = 0;
        this.avg = new Avg(20);
    }

    inInit() {
        this.players = [];
        console.log(pathList);
        let i=0;
        pathList.forEach(path => {
            i++;
            console.log(path, i<=2);
            this.players.push(new JazzPlayer(path, this.onload.bind(this)));
        });

        Transport.scheduleRepeat((time) => {
            this.players.forEach(p=>{
                p.change();
            })
        }, "1n");
        
    }

    onload() {
        console.log('on load!', this.loaded);
        this.loadNum++;
        if (this.loadNum == pathList.length) {
            this.loaded = true;
            if (this.config.onload) this.config.onload();
        }
    }

    changeRate(v) {
        let fv = 0;
        let low = 50, mid = 90, high = 300;
        let tlow = 0.3, tmid = 0.8, thigh = 1.1, tfi = 2;
        if (v < low) { // slow
            fv = scale(v, 0, low, tlow, tmid);
        } else if (v < mid) { // normal
            fv = scale(v, low, mid, tmid, thigh);
        } else { //fast
            fv = scale(v, mid, high, thigh, tfi);
        }
        fv = parseFloat(minmax(fv, tlow, tfi).toFixed(1));
        this.logHTML('biginstr', v + '</br>' + fv + '<br>' + json2Str(this.dm.orientVel));
        Transport.bpm.value = 120*fv;
        this.players.forEach(p=>{
            p.changeRate(fv);
        })
    }

    inMotion() {
        let v = this.calcNorm(this.dm.orientVel);
        let av = this.avg.get(v);
        this.changeRate(av);
    }

    inEnd() {
        this.players.forEach(p=>{
            p.stop();
        })
        Transport.stop();
    }

    startEnable() {
        this.players.forEach(p=>{
            p.play();
        })
        Transport.start();
    }
}

class JazzPlayer {
    constructor(soundPath, onLoadCb = null) {
        this.soundPath = soundPath;
        this.players = [];
        this.gains = [];
        this.current = 0;
        this.loaded = 0;
        this.onloadCb = onLoadCb;
        this.playbackRate = 1;
        this.initPlayer();
        this.fade = "4n";
    }

    initPlayer() {
        this.soundPath.forEach(e => {
            let p = new GrainPlayer({
                url: e.default,
                loop: true,
                grainSize: 0.1,
                overlap: 0.05,
                onload: this.onload.bind(this)
            });
            let gain = new Gain(0).toDestination();
            p.connect(gain);
            this.players.push(p);
            this.gains.push(gain);
        });
    }

    onload() {
        console.log('load!', this.loaded);
        this.loaded++;
        if (this.loaded == this.soundPath.length) {
            if (this.onloadCb) this.onloadCb();
        }
    }

    play(ind = this.current) {
        if (this.players[ind].loaded) {
            this.players[ind].playbackRate = this.playbackRate;
            this.players[ind].detune = -12*Math.log2(this.playbackRate);
            this.gains[ind].gain.rampTo(1, this.fade);
            this.players[ind].start();
            this.current = ind;
        }
    }

    stop(ind = this.current) {
        this.gains[ind].gain.rampTo(0, this.fade);
        this.players[ind].stop(this.fade);
    }

    change() {
        if (Math.random() > 0.1) return;
        let r = Math.floor(Math.random()*this.players.length);
        console.log(r);
        this.stop();
        this.play(r);
    }

    changeRate(v) {
        this.playbackRate = v;
        this.players[this.current].playbackRate = v;
        this.players[this.current].detune = -12*Math.log2(v);
    }
}

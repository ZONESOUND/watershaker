import {RecordMode} from './mode';
import {Avg, json2Str, minmax} from './ussage';

export class Shaker extends RecordMode {
    
    constructor(config) {
        super(config);
        if(!this.config.recordTime) this.config.recordTime = 400;
        this.enablePlay = true;
        this.avg = new Avg(10);
        this.enableMs = this.config.recordTime/4;
    }

    inMotion() {
        if (!this.playing) return;
        //console.log('in!', this.dm);
        let a = minmax(this.dm.orientAcc.yaw, -100000, 100000);
        let aa = this.avg.get(a);
        this.playWhenAcc(a, aa);
    }

    playWhenAcc(a, aa) {
        this.logHTML('biginstr', a.toFixed(0) + '<br>' + aa.toFixed(0) + '<br>' + json2Str(this.dm.orientAcc));

        if (a > 0 && a > aa * 20 && a > 3000) {
            this.playImmediately();
        }
    }
     
    playImmediately() {
        if (!this.enablePlay) return;
        this.recorder.play();
        this.enablePlay = false;
        setTimeout((()=>{
            this.enablePlay = true;
        }).bind(this), this.enableMs);
    }
    
}
import {RecordMode} from './mode.js';
import {Avg, json2Str, minmax} from '../ussage/ussage.js';
import {PingPongDelay} from 'tone';
export class Shaker extends RecordMode {
    
    constructor(config) {
        super(config);
        if(!this.config.recordTime) this.config.recordTime = 2500;
        this.enablePlay = true;
        this.avg = new Avg(10);
        this.enableMs = this.config.recordTime/3;
    }
    
    afterStop() {
        let buffer = this.recorder.getBuffer();
        this.trimBuffer(buffer.buffer);
        this.buffertype = buffer.type;
        this.bufferPlayer.applyPingPong();
        this.playing = true;
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
        //if ((a > 0 && aa < 0) || (a < 0 && aa > 0)) return;
        // if ( Math.abs(a) > Math.abs(aa) * 50 && Math.abs(a) > 3500) {
        //     //this.playImmediately();
        // } else 
        if (a > 6000 && aa < 0 || a < -10000 && aa > 0 || Math.abs(a) > Math.abs(aa) * 1000) {
            this.playImmediately();
        }
    }
     
    playImmediately() {
        if (!this.enablePlay) return;
        this.enablePlay = false;
        this.bufferPlayer.playBuffer({buffer: this.buffer, type:this.buffertype});
        //this.bufferPlayer.playBuffer(this.buffer);
        setTimeout((()=>{
            this.enablePlay = true;
        }).bind(this), this.enableMs);
    }
    
}
import {RecordMode} from './mode.js';
import {json2Str, minmax} from '../ussage/ussage.js';

export class Gyro extends RecordMode {
    
    constructor(config) {
        super(config);
        if(!this.config.recordTime) this.config.recordTime = 10000;
        this.enablePlay = true;
        this.move = new Move(
            {min: 0.1, max: 2},
            {min: 0.1, max: 2},
            {x: 0.01, y: 0.01}
        );
        
        //this.avg = new Avg(10);
    }

    afterStop() {
        console.log('after stop!');
        this.bufferPlayer.playBuffer(this.recorder.getBuffer(), true, {in:2, out:1});
    }

    inEnd() {
        this.bufferPlayer.stop();
    }

    inMotion() {
        if (!this.playing) return;
        let xy = this.move.move(this.dm.orient.roll, this.dm.orient.pitch);
        this.logHTML('biginstr', `${xy.x}<br>${xy.y}<br>${json2Str(this.dm.orient)}`);
        console.log('playgain'+xy.x);
        this.bufferPlayer.setPlayGain(xy.x);
        this.bufferPlayer.setPlayRate(xy.y);
        //console.log('in!', this.dm);
        // let a = minmax(this.dm.orientAcc.yaw, -100000, 100000);
        // let aa = this.avg.get(a);
        // this.playWhenAcc(a, aa);
    }

    
}

class Move {
    constructor(limx, limy, mult) {
        this.x = (limx.min+limx.max)/2;
        this.y = (limy.min+limy.max)/2;
        this.limx = limx;
        this.limy = limy;
        this.mult = mult;
    }

    move(x, y) {
        this.x += Math.sin(this.radians(x))*this.mult.x;
        this.x = minmax(this.x, this.limx.min, this.limx.max);

        this.y += Math.sin(this.radians(y))*this.mult.y;
        this.y = minmax(this.y, this.limy.min, this.limy.max);
        return {x: this.x, y: this.y};
    }

    radians(degrees){
        var pi = Math.PI;
        return degrees * (pi/180);
    }   

}
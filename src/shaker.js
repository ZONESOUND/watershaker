import {Mode, RecordMode} from './mode';

export class Shaker extends RecordMode {
    
    constructor(config) {
        super(config);
        this.config.recordTime = 400;
        this.enablePlay = true;
    }

    // initFunc() {
    //     //super.init()
    //     console.log('shaker init');
    //     dispatchDevice({motion: this.playWhenAcc}, this);
    // }

    // playWhenAcc(event, self) {

    //     // if (event.acceleration.z > 5 || event.acceleration.x>5 || event.acceleration.y>5) {
    //     //     self.playImmediately();
    //     // }
    //     let a = event.acceleration.z*event.acceleration.z + 
    //     event.acceleration.x+event.acceleration.x +
    //     event.acceleration.y+event.acceleration.z;

    //     if (a > 45) {
    //         self.playImmediately();
    //     }
    // }
    playWhenAcc(dm) {

        // if (event.acceleration.z > 5 || event.acceleration.x>5 || event.acceleration.y>5) {
        //     self.playImmediately();
        // }
        let a = dm.orientAcc.z*dm.orientAcc.z + 
        dm.orientAcc.x+dm.orientAcc.x +
        dm.orientAcc.y+dm.orientAcc.z;

        if (a > 45) {
            self.playImmediately();
        }
    }
     
    playImmediately() {
        this.recorder.play();
        this.enablePlay = false;
        setTimeout(()=>{
            this.enablePlay = true;
        }, this.enableMs);
    }
    
}
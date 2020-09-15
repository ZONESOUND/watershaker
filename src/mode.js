export class Mode {    
    constructor(config={}) {
        this.fillConfig(config);
        this.enable = false;
        this.debug = true;
        this.init();
        this.loaded = false;
    }

    fillConfig(config) {
        this.config = {
            init:null,
            end:null,
            motion:null,
            onload:null
        }
        this.config = {...this.config, ...config}
    }

    init() {
        this.inInit();
        //if (this.config.init) this.initFunc();
    }

    motion() {
        if (!this.enable) return;
        this.inMotion();
        //if (this.config.motion) this.config.motion(e);
    }

    end() {
        this.enable = false;
        this.inEnd();
    }

    setEnable(enable) {
        this.enable = enable;
        if (enable) this.startEnable();
        else this.end();
    }

    setDM(dm) {
        this.dm = dm;
        this.dm.listenerFunc = this.motion.bind(this);
    }

    log(txt, stop=false) {
        if (this.debug) {
            alert(txt);
            this.debug = !stop;
        }
    }

    logHTML(id, txt) {
        if (!this.debug) return;
        document.getElementById(id).innerHTML = txt;

    }

    //TODO: put in dm
    calcNorm(o) {
        return Math.pow(o.pitch * o.pitch + o.roll * o.roll + o.yaw * o.yaw, 1/3);
    }

    calcAvg(o) {
        return (o.pitch + o.roll + o.yaw)/3;
    }

    inEnd(){}
    inInit(){}
    inMotion(){}
    startEnable(){}
}

export class RecordMode extends Mode {
    constructor(recorder, recordTime, config = {}) {
        super(config);
        this.recorder = recorder;
        this.recordTime = recordTime;
    }
    getRecordLen() {
        return this.recordTime;
    }
}
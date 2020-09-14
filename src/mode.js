export class Mode {    
    constructor(config={}) {
        this.fillConfig(config);
        this.enable = false;
        this.debug = true;
    }

    fillConfig(config) {
        this.config = {
            init:null,
            end:null,
            motion:null 
        }
        this.config = {...this.config, ...config}
    }

    init() {
        this.enable = true;
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
        //dispatchDevice({orientation: ()=>{return;}, motion: ()=>{return;}});
        //if (this.motion.end) this.endFunc();
    }

    setEnable(enable) {
        this.enable = enable;
        if (enable) this.startEnable();
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
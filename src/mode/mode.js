import {recStart, recEnd, recRestart} from '../ussage/recusage.js';
import {BufferPlayer} from '../recorder.js';
export class Mode {    
    constructor(config={}) {
        this.fillConfig(config);
        this.enable = false;
        this.debug = false;
        this.init();
        this.loaded = false;
    }

    fillConfig(config) {
        this.config = {
            init:null,
            end:null,
            motion:null,
            onload:null,
            instr: '',
            recordInstr: '',
        }
        this.config = {...this.config, ...config}
    }

    getInstr() {
        return this.config.instr;
    }

    getRecordInstr() {
        return this.config.recordInstr;
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
        if (enable) {
            this.startEnable();
        }
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
    enableSound(){}
}

export class RecordMode extends Mode {
    constructor(config = {}) {
        super(config);
        this.recording = false;
        this.loaded = true;
        this.recorder = null;
        this.playing = false;
    }
    setProgressBar(pb) {
        this.progressBar = pb;
    }
    setRecorder(recorder) {
        //console.log('set recorder', recorder);
        this.recorder = recorder;
        this.bufferPlayer = new BufferPlayer(this.recorder.getContext());
    }
    getRecordLen() {
        return this.config.recordTime;
    }
    restart() {
        recRestart();
        this.playing = false;
        this.bufferPlayer.stop();
    }
    record() {
        this.recording = true;
        recStart();
        console.log('record', this.recorder);
        
        this.progressBar.animate(0, {duration: 0}, (()=>{
            this.progressBar.animate(1.0, {duration: this.config.recordTime}, this.stopRecord.bind(this));
        }).bind(this));
        this.recorder.record(true);
    }
    stopRecord() {
        if (this.recording) {
            recEnd();
            this.recording = false;
            this.progressBar.stop();
            this.recorder.stop();
            //setTimeout(()=>{this.playRecord()}, 1000);
            if (this.afterStop) this.afterStop();
            this.playing = true;
        }
    }
    playRecord() {
        this.recorder.play();
    }

    inEnd() {
        this.stopRecord();
    }

    trimBuffer(buffer, threshold=0.01) {
        let i=0;
        for(i=0; i<buffer.length; i++) {
            if (Math.abs(buffer[i]) > threshold) break;
        }
        if (buffer.length - i < 1000) this.buffer = buffer;
        else this.buffer = buffer.slice(i);
    }
}
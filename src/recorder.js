import { omitFromObject } from "tone/build/esm/core/util/Defaults";

export default class Recorder {
    #recording = false;
    recordedBuffer = [];

    constructor(source=null) {
        this.setupSource(source);
    }

    setupSource(source) {
        this.context = source.context;
        this.source = source;
    }

    init() {
        this.initProcessor();
        this.connectAll();
    }

    connectAll() {
        this.processor.connect(this.context.destination);
        this.source.connect(this.processor);
        //this.source.connect(this.context.destination);
        //this.source.start();
    }

    initProcessor() {
        this.processor = this.context.createScriptProcessor(1024,1,1);

        this.processor.onaudioprocess = (e) => {
            //console.log(e, this.#recording);
            if (!this.#recording) return;
            //console.log(e.inputBuffer.getChannelData(0), this.#recording);
            e.inputBuffer.getChannelData(0).forEach(e => {
                this.recordedBuffer.push(e);
            })
        };
    }

    record(clear=true) {
        if (clear) this.clear();
        this.#recording = true;
    }

    stop(callback = null) {
        this.#recording = false;
        if (callback) callback();
    }

    clear() {
        this.recordedBuffer = [];
    }

    getBuffer() {
        return this.recordedBuffer;
    }

    isRecording() {
        return this.#recording;
    }

    // play(loop=false, fade={in:0, out:0}) {

    //     let playSource = this.context.createBufferSource();
    //     let newBuffer = this.context.createBuffer(1, this.recordedBuffer.length, this.context.sampleRate);
    //     newBuffer.getChannelData(0).set(this.recordedBuffer);
    //     this.gainNode = this.context.createGain();
    //     //exponentialRampToValueAtTime
    //     this.gainNode.gain.value = 0;
    //     this.gainNode.gain.exponentialRampToValueAtTime(1, this.context.currentTime+fade.in);

    //     setTimeout((()=>{
    //         this.gainNode.gain.exponentialRampToValueAtTime(0, this.context.currentTime+fade.out)}).bind(this)
    //         ,(newBuffer.duration-fade.out)*1000);
    //     playSource.buffer = newBuffer;
    //     playSource.loop = loop;
    //     playSource.connect(this.gainNode);
    //     this.gainNode.connect(this.context.destination);
    //     playSource.start();
    //     playSource.onended = function() {
    //         playSource.disconnect(this.gainNode);
    //     }
    //     this.playSource = playSource;
    //     console.log('gain!', this.gainNode);
    // }

    // setPlayGain(v) {
    //     //console.log(this.gainNode);
    //     this.gainNode.gain.value = v;
    // }

    // setPlayRate(v) {
    //     this.playSource.playbackRate.value = v;
    // }

    // stopPlay() {
    //     this.playSource.disconnect(this.gainNode);
    // }

    getContext() {
        return this.context;
    }
}

export class BufferPlayer {
    constructor(context, buffer=null) {
        this.context = context;
        this.buffer = buffer;
        this.gainNode = this.context.createGain();
        this.destination = this.context.destination;
        this.applyComposer();
        this.gainNode.connect(this.destination);

    }

    playBuffer(buffer, loop=false, fade={in:0, out:0}) {
        this.buffer = buffer;
        this.play(loop, fade);
    }

    play(loop=false, fade={in:0, out:0}) {
        this.loop = loop;
        let playSource = this.context.createBufferSource();
        let newBuffer = this.context.createBuffer(1, this.buffer.length, this.context.sampleRate);
        newBuffer.getChannelData(0).set(this.buffer);
        this.gainNode.gain.setValueAtTime(1, this.context.currentTime);
        playSource.loop = loop;
        playSource.buffer = newBuffer;
        playSource.connect(this.gainNode);
        playSource.start();
        playSource.onended = (function() {
            this.toStop();
            console.log('onend!');
        }).bind(this);
        this.playSource = playSource;
    }

    applyPingPong(delay=0.15, feedback=0.25) {
        console.log('applyPingPong!');
        let delayNode = this.context.createDelay();
        delayNode.delayTime.setValueAtTime(delay, this.context.currentTime);
        //this.gainNode.disconnect(this.connectTo);
        this.gainNode.connect(delayNode);
        delayNode.connect(this.destination);
        let fbGain = this.context.createGain();
        fbGain.gain.setValueAtTime(feedback, this.context.currentTime);
        delayNode.connect(fbGain);
        fbGain.connect(delayNode);
        this.delayNode = delayNode;
        this.fbGain = fbGain;
    }

    applyComposer() {
        let compressor = this.context.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-50, this.context.currentTime);
        compressor.knee.setValueAtTime(40, this.context.currentTime);
        compressor.ratio.setValueAtTime(12, this.context.currentTime);
        compressor.attack.setValueAtTime(0, this.context.currentTime);
        compressor.release.setValueAtTime(0.25, this.context.currentTime);
        this.destination = compressor;
        compressor.connect(this.context.destination);
    }

    setPinPongDelay(v) {
        this.delayNode.delayTime.setValueAtTime(v, this.context.currentTime+0.1);
    }

    setPinPongFeedback(v) {
        this.fbGain.gain.setValueAtTime(v, this.context.currentTime+0.1);
    }

    setPlayGain(v) {
        this.gainNode.gain.setValueAtTime(v, this.context.currentTime);

    }

    setPlayRate(v) {
        this.playSource.playbackRate.value = v;
    }

    stop() {
        this.loop = false;
        this.toStop();
    }

    toStop() {
        this.playSource.disconnect(this.gainNode);
    }
}
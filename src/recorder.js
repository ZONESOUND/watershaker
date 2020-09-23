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
        console.log('recorder constructor');
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

    play(loop=false, fade={in:0, out:0}) {

        let playSource = this.context.createBufferSource();
        let newBuffer = this.context.createBuffer(1, this.recordedBuffer.length, this.context.sampleRate);
        newBuffer.getChannelData(0).set(this.recordedBuffer);
        this.gainNode = this.context.createGain();
        //exponentialRampToValueAtTime
        this.gainNode.gain.value = 0;
        this.gainNode.gain.exponentialRampToValueAtTime(1, this.context.currentTime+fade.in);
        console.log('buffer duration'+newBuffer.duration);
        setTimeout((()=>{
            this.gainNode.gain.exponentialRampToValueAtTime(0, this.context.currentTime+fade.out)}).bind(this)
            ,(newBuffer.duration-fade.out)*1000);
        playSource.buffer = newBuffer;
        playSource.loop = loop;
        playSource.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        playSource.start();
        playSource.onended = function() {
            playSource.disconnect(this.gainNode);
        }
        this.playSource = playSource;
        console.log('gain!', this.gainNode);
    }

    setPlayGain(v) {
        //console.log(this.gainNode);
        this.gainNode.gain.value = v;
    }

    setPlayRate(v) {
        this.playSource.playbackRate.value = v;
    }

    stopPlay() {
        this.playSource.disconnect(this.gainNode);
    }

    getContext() {
        return this.context;
    }
}

export class BufferPlayer {
    constructor(context, buffer=null) {
        this.context = context;
        this.buffer = buffer;
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
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
        console.log('ramp in '+ this.context.currentTime+', '+fade.in);
        // this.getValue();
        // this.gainNode.gain.linearRampToValueAtTime(1.0, this.context.currentTime+fade.in);
        // setTimeout(this.getValue.bind(this), 300);
        // setTimeout(this.getValue.bind(this), 600);
        // setTimeout(this.getValue.bind(this), 900);
        // setTimeout(this.getValue.bind(this), fade.in*1000);
        // setTimeout((()=>{
        //     this.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime+newBuffer.duration)}).bind(this)
        //     ,(newBuffer.duration-fade.out)*1000);
        playSource.loop = loop;
        playSource.buffer = newBuffer;
        playSource.connect(this.gainNode);
        playSource.start();
        playSource.onended = (function() {
            this.toStop();
            console.log('onend!');
            // if (this.loop) {
            //     this.play(this.loop, fade);
            // }
        }).bind(this);
        this.playSource = playSource;
    }
    getValue() {
        console.log(this.gainNode.gain.value);
    }

    setPlayGain(v) {
        console.log(v, this.gainNode.gain.value);
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
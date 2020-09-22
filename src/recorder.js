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

    play(manipulateFunc=(buffer)=>{return buffer}) {
        let playbuffer;
        if (manipulateFunc) playbuffer = manipulateFunc(this.recordedBuffer);
        let playSource = this.context.createBufferSource();
        console.log(playbuffer);
        let newBuffer = this.context.createBuffer(1, playbuffer.length, this.context.sampleRate);
        
        newBuffer.getChannelData(0).set(playbuffer);
        playSource.buffer = newBuffer;
        playSource.connect(this.context.destination);
        playSource.start();
        playSource.onended = function() {
            playSource.disconnect(this.context.destination);
        }
    }

    getContext() {
        return this.context;
    }
}


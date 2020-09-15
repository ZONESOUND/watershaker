import {RateTransposer, Stretch, SimpleFilter} from './library/soundtouch.bundle';
import testsound from './sounds/test.m4a';
import $ from 'jquery';

class TimeStretch {
    constructor(soundurl, isTimestretch, context, callback=null) {
        this.soundurl = soundurl;
        this.isTimestretch = isTimestretch;
        this.context = context;
        this.buffer = [];
        this.callback = callback;

        if (isTimestretch) this.initTimeStretch();
        else this.initNoStretch();
        this.loadSample(this.soundurl);
    }

    initNoStretch() {
        this.source = context.createBufferSource(); // creates a sound source
        this.source.connect(this.context.destination);       // connect the source to the context's destination (the speakers)
    }

    initTimeStretch() {
        this.t = new RateTransposer(true);
        this.s = new Stretch(true);
        this.s.tempo = 1;

        this.source = {
            extract: function (target, numFrames, position) {
                var l = this.buffer.getChannelData(0);
                var r = this.buffer.getChannelData(1);
                for (var i = 0; i < numFrames; i++) {
                    target[i * 2] = l[i + position];
                    target[i * 2 + 1] = r[i + position];
                }
                return Math.min(numFrames, l.length - position);
            }.bind(this)
        };

        
        this.f = new SimpleFilter(this.source, this.s);
    }

    loadSample(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            console.log('ready', this.context);
            this.context.decodeAudioData(request.response, function(data) {
                this.buffer = data;
            }.bind(this));
        }.bind(this);
        request.send();
    }

    changeSpeed(speed) {
        this.speed = speed;
        if (this.isTimestretch) this.s.tempo = this.speed;
        else this.source.playbackRate.value = this.speed;
    }

    play() {
        if (this.isTimestretch){
            console.log('node', this.node, this.context.destination);
            this.node.connect(this.context.destination);
        } 
        else {
            //console.log(this.buffer);
            //this.source = context.createBufferSource(); // creates a sound source
            this.source.buffer = this.buffer;
            //this.source.connect(this.context.destination);  
            this.source.playbackRate.value = this.speed;
            this.source.start(0);
        }
    }
    
    pause() {
        if (this.isTimestretch)
            this.node.disconnect();
        else this.source.stop();
    }

    setNode(node) {
        this.node = node;
    }
}

const context = new (window.AudioContext||window.webkitAudioContext)();
var testS = new TimeStretch(testsound, true, context);
var BUFFER_SIZE = 1024;
var samples = new Float32Array(BUFFER_SIZE * 2);
var node = context.createScriptProcessor(BUFFER_SIZE, 2, 2);
node.onaudioprocess = function (e) {
    console.log('on~');
    var l = e.outputBuffer.getChannelData(0);
    var r = e.outputBuffer.getChannelData(1);
    var framesExtracted = testS.f.extract(samples, BUFFER_SIZE);
    if (framesExtracted == 0) {
        testS.pause();
    }
    for (var i = 0; i < framesExtracted; i++) {
        l[i] = samples[i * 2];
        r[i] = samples[i * 2 + 1];
    }
}
//node.connect(context.destination);
//node.disconnect(context.destination);
testS.setNode(node);
testS.changeSpeed(0.2);

$('#try').click(function() {
    console.log('y');
    //node.disconnect(context.destination);
    node.connect(context.destination);
    //testS.play();
})


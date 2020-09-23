import Recorder from './recorder';

var recorder;
const AudioContext = window.AudioContext|| window.webkitAudioContext ||      window.mozAudioContext || window.msAudioContext;
const context = new AudioContext();
var mediaStream, source;
var micPermission = false;
var testMic = false;

let olderBrowser = function() {
    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
  
    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
    
        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
    
        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
        }
    }
    
}

let grantMicPermission = async () => {
    olderBrowser();
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true});
        initRecord();
        console.log('ya');
    } catch(err) {
        //handle hint page here
        alert(err);
        console.error(err);
        return false;
    }
    return true;
}

let checkMicPermission = async () => {
    if (!micPermission) {
        micPermission = await grantMicPermission();
    } else {
        console.log('no!');
    }
}

let initRecord = function() {
    console.log(mediaStream);
    source = context.createMediaStreamSource(mediaStream);
    recorder = new Recorder(source);
    recorder.init();
    console.log('init record almost');
    testRecorder();
};

let testRecorder = ()=> {
    recorder.record(true);
    setTimeout(()=>{
        recorder.stop();
        let buffer = recorder.getBuffer();
        console.log(buffer);
        console.log(mediaStream);
        if (buffer.length != 0) {
            testMic = true
        } else {
            //TODO:handle...
            alert('[MICROPHONE] something went wrong');
        }
    }, 50);
}

export {checkMicPermission, recorder, micPermission};
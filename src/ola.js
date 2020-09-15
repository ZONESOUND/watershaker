import { OLATS, OLATSPlayer } from "ola-ts"
import testsound from './sounds/test.m4a';
import $ from 'jquery';

const context = new (window.AudioContext||window.webkitAudioContext)();
var BUFFER_SIZE = 4096;
var FRAME_SIZE  = 4096;
var node = context.createScriptProcessor(BUFFER_SIZE, 2);
var olaL = new OLATS(FRAME_SIZE);
var olaR = new OLATS(FRAME_SIZE);
var buffer;
var position = 0;
var alpha = 1;
var overlap = 1.05;
var beta = 1;
var outBufferL = [];
var outBufferR = [];
var player;
let loadSample = function(url, id) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
        context.decodeAudioData(request.response, function(decodedData) {
            buffer = decodedData;
            console.log("decoded", buffer);
            var source = context.createBufferSource(); // creates a sound source
            source.buffer = buffer; 
            player = new OLATSPlayer(context, source, 4096, 4096);
            var gain = context.createGain();
            //player.connect(gain);
            //gain.connect(context.destination);
            //buffer.connect(context.destination);
            player.connect(context.destination);
            player.speed = 2;
            console.log(player);
            
        });
    };
    request.send();
};
loadSample(testsound);

$('#try').click(function() {
    console.log('click!');
    //node.connect(context.destination);
    player.play();
    //play(buffer);
})

function play(buffer) {
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.playbackRate.value = 0.5;
    source.start(0);                           // play the source now
                                               // note: on older systems, may have to use deprecated noteOn(time);
}
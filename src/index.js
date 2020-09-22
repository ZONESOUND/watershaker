//import "@babel/polyfill";

import $ from 'jquery';
import './style.css';
import viewStep from '@zonesoundcreative/view-step';
import './rec.js';
import {recRestart, recStart} from './recusage.js';
import {progressbar} from './rec.js';
import {show, hide} from './cssusage';
import arrow from './image.png';
import {importAll} from './ussage';
import {Conductor} from './conductor2';
import {Shaker} from './shaker';
import {Balance} from './balance';
import {dm} from './device';
import * as Tone from 'tone';

import {checkMicPermission, recorder} from './mic.js';

var loading = false;
const images = importAll(require.context('./icons', false, /\.(png|jpe?g|svg)$/));
var viewstep = new viewStep('.step', 1, 2, {
    2: checkLoad,
    3: selectMode
});
var mode = -1;
export var nowMode = null;
var modeList = [
    new Shaker({
        recordTime: 1000,
        recordInstr: 'Create and capture a short sound',
        instr: 'SHAKE THE SOUND',
    }), 
    new Shaker({
        recordTime: 30000,
        recordInstr: 'Find and record a continuous sound',
        instr: 'MODULATE THE SOUND WITH MOTIONS',
    }), 
    new Conductor({
        instr: 'WAVE THE DEVICE TO DIRECT THE MUSIC',
        onload:()=>{
            if (loading) checkLoad();
            //alert('conductor loaded');
        }
    }), 
    new Balance({
        instr: 'KEEP BALANCE',
        onload:()=>{
            if (loading) checkLoad();
            //alert('balance loaded');
        }
    })];
//TODO: 首頁的按鈕名稱在這裡換。
const names = ['shaker', 'gyro', 'conductor', 'balance'];
initPage();
function initPage() {
    $('#previmg').attr("src", arrow);
    for (let i in images) {
        console.log(images[i].default);
        $('#selector').append(createBtn(`mode-${i}`, images[i].default, names[i]));
        // button onclick
        $('#mode-'+i).on('click', function() {
            if (mode == -1) Tone.start();
            mode = i;
            nowMode = modeList[i];
            // change to await
            dm.requestPermission().then(()=>{
                if (dm.granted) {
                    viewstep.showNext();
                } else {
                    //handle
                    alert('no');
                    viewstep.showNext();
                }
            });
            
        });

    }
    Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => {img.onload = img.onerror = resolve; }))).then(() => {
        $('#selector div').removeClass('hidden');
    });
}
function createBtn(id, src, txt) {
    return `<div id=${id} class="square hidden">
        <div class="squarecontent">
            <img src="${src}"/>
            <div>${txt}</div>
        </div>
    </div>`;
}

$("#prev").on('click', function() {
    viewstep.showPrev();
    viewstep.showPrev();
    nowMode.setEnable(false);
    mode = -1;
    nowMode = null;
});

function selectMode () {
    console.log('select mode:', mode);
    $("#biginstr").text(nowMode.getInstr());
    $("#recinstr").text(nowMode.getRecordInstr());
    nowMode.setDM(dm); //only one time?
    nowMode.setEnable(true);
    if (mode < 2) {
        checkMicPermission().then(()=>{

        })
        show('.recorduse');
        recRestart();
        console.log(progressbar, recorder);
        nowMode.setProgressBar(progressbar); //one time?
        nowMode.setRecorder(recorder); //one time?
    } else {
        hide('.recorduse');
    }
}

function checkLoad() {
    //alert(`${mode} ${modeList[mode].loaded}`);
    loading = true;
    if (modeList[mode].loaded) 
        viewstep.showNext();
}
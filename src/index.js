//import "@babel/polyfill";

import $ from 'jquery';
import './style.css';
import viewStep from '@zonesoundcreative/view-step';
import './rec.js';
import {recRestart, showInstrOnly} from './ussage/recusage.js';
import {progressbar} from './rec.js';
import {show, hide} from './ussage/cssusage';
import arrow from './img/arrow.png';
import {importAll} from './ussage/ussage';
import {Conductor} from './mode/conductor2';
import {Shaker} from './mode/shaker';
import {Balance} from './mode/balance';
import {Gyro} from './mode/gyro';
import {dm} from './device';
import * as Tone from 'tone';
import {checkMicPermission, recorder, micPermission} from './mic.js';

var loading = false;
const images = importAll(require.context('./img/png', false, /\.(png|jpe?g|svg)$/));

const names = ['shaker', 'gyro', 'conductor', 'balance'];
var viewstep = new viewStep('.step', 1, 2, {
    2: checkLoad,
    3: selectMode
});
var mode = -1;
export var nowMode = null;
var modeList;
initPage();
function initPage() {
    $('#previmg').attr("src", arrow);
    for (let i in images) {
        console.log(images[i].default);
        $('#selector').append(createBtn(`mode-${i}`, images[i].default, names[i]));
        // button onclick
        $('#mode-'+i).on('click', async function() {
            if (mode == -1) {
                Tone.context.resume();
            }
            mode = i;
            nowMode = modeList[i];
            // change to await
            dm.requestPermission().then(()=>{
                if (dm.granted) {
                    viewstep.showNext(true, true, 2);
                } else {
                    //handle
                    alert('Enable Device Orientation For Best Experience');
                }
            });
            
        });

    }
    Promise.all(Array.from(document.images).filter(img => !img.complete).map(img => new Promise(resolve => {img.onload = img.onerror = resolve; }))).then(() => {
        $('#selector div').removeClass('hidden');
        initModeList();
    });
}

function initModeList() {
    modeList = [
        new Shaker({
            recordTime: 600,
            recordInstr: 'Create and capture a short sound',
            instr: 'SHAKE THE SOUND',
        }), 
        new Gyro({
            recordTime: 10000,
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
        show('.recorduse');
        recRestart();
        console.log(progressbar, recorder);
        nowMode.setProgressBar(progressbar); //one time?
        if (nowMode.recorder == null) nowMode.setRecorder(recorder); //one time?
    } else {
        hide('.recorduse');
        showInstrOnly();
    }
}

function checkLoad() {
    //alert(`${mode} ${modeList[mode].loaded}`);
    loading = true;
    if (modeList[mode].loaded){ 
        if (mode < 2) {
            checkMicPermission().then(()=>{
                if (micPermission) {
                    viewstep.showNext(true, true, 3);
                } else {
                }
            })
        } else {
            viewstep.showNext(true, true, 3);
        }   
    }
}
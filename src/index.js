//import "@babel/polyfill";

import $ from 'jquery';
import './style.css';
import viewStep from '@zonesoundcreative/view-step';
import './rec.js';
import {recRestart, recStart} from './recusage.js';
import {progressStop, setRecLength, setRecInstr} from './rec.js';
import {show, hide} from './cssusage';
import arrow from './image.png';
import {importAll} from './ussage';
import {Conductor} from './conductor';
import {Shaker} from './shaker';
import {Balance} from './balance';
import {dm} from './device';

const images = importAll(require.context('./icons', false, /\.(png|jpe?g|svg)$/));
var viewstep = new viewStep('.step', 1, 2, {
    2: selectMode
});
var mode = -1;
var modeList = [new Shaker(), new Shaker(), 
    new Conductor({onload:()=>{
        alert('conductor loaded');
    }}), new Balance({onload:()=>{
        alert('balance loaded');
    }})];
//TODO: 首頁的按鈕名稱在這裡換。
const names = ['shaker', 'gyro', 'conductor', 'balance'];
initPage();
function initPage() {
    $('#previmg').attr("src", arrow);
    for (let i in images) {
        console.log(images[i].default);
        $('#selector').append(createBtn(`mode-${i}`, images[i].default, names[i]));
        // button onclick
        $('#mode-'+i).click(function() {
            mode = i;
            // change to await
            if (!dm.granted) dm.requestPermission();
            viewstep.showNext();
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

$("#prev").click(function() {
    viewstep.showPrev();
    //TODO: check if is recording...
    progressStop();
    modeList[mode].setEnable(false);
    mode = -1;
});

function setupDM() {

}

/*** 
 * TODO: 
 * setRecLength 寫錄音的時間（ms）
 * setRecInstr 寫未錄音時看到的文字
 * $("#biginstr").text 寫玩的指令
*/
function selectMode () {
    console.log('select mode:', mode);
    modeList[mode].setEnable(true);
    modeList[mode].setDM(dm);
    switch (mode) {
        case '0': //shaker
            show('.recorduse');
            setRecLength(1000);
            setRecInstr("Create and capture a short sound");
            $("#biginstr").text("SHAKE THE SOUND");
            recRestart();
            break;
        case '1': //gyro
            show('.recorduse');
            setRecLength(30000);
            setRecInstr("Find and record a continuous sound");
            $("#biginstr").text("MODULATE THE SOUND WITH MOTIONS");
            recRestart();
            break;
        case '2': //jazz
            hide('.recorduse');
            $("#biginstr").text("WAVE THE DEVICE TO DIRECT THE MUSIC");
            break;
        case '3': //silence
            hide('.recorduse');
            $("#biginstr").text("KEEP BALANCE");
            break;
        default:
            break;
    }
}
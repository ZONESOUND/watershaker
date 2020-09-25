import {importAll} from './ussage/ussage';
import {Conductor} from './mode/conductor2';
import {Shaker} from './mode/shaker';
import {Balance} from './mode/balance';
import {Gyro} from './mode/gyro';
import {onload} from './index';

export const images = importAll(require.context('./img/png', false, /\.(png|jpe?g|svg)$/));
export const names = ['Shaker', 'Gyro', 'Conductor', 'Balance'];
export const videos = ["mPWEKlhxBeI", "X7WG4lZXrDs", "W0EupWkmxGI", "NEG4Fvjj6e4"];
export const hint = " We recommend use Safari (iOS), Chrome (Android).";

export function initModeList() {
    let shaker = new Shaker({
        recordTime: 600,
        recordInstr: 'Create and capture a short sound',
        instr: 'SHAKE THE SOUND',
    });
    let gyro = new Gyro({
        recordTime: 10000,
        recordInstr: 'Find and record a continuous sound',
        instr: 'MODULATE THE SOUND WITH MOTIONS',
    });
    let bal = new Balance({
        instr: 'KEEP BALANCE',
        onload:onload
    });
    let cond = new Conductor({
        instr: 'WAVE THE DEVICE TO DIRECT THE MUSIC',
        onload:onload
    });
    return [shaker, gyro, cond, bal];
}

export function createBtn(id, src, txt) {
    return `<div id=${id} class="square hidden">
        <div class="squarecontent">
            <img src="${src}"/>
            <div>${txt}</div>
        </div>
    </div>`;
}
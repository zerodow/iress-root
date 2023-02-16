import { dataStorage } from './storage';
import Enum from './enum';
import * as Controller from './memory/controller'
const En = require('./modules/language/language_json/en.json');
const Vi = require('./modules/language/language_json/vi.json');
const Cn = require('./modules/language/language_json/cn.json');

const LANG = Enum.LANG;
const dicEn = {};
const dicVi = {};
const dicCn = {};

for (const key in En) {
    dicEn[En[key]] = key;
}
for (const key in Vi) {
    dicVi[Vi[key]] = key;
}
for (const key in Cn) {
    dicCn[Cn[key]] = key;
}

export function getInvertTranslate(val) {
    const key = dicEn[val];
    if (!key) return val;
    switch (Controller.getLang()) {
        case LANG.EN:
            return En[key];
        case LANG.VI:
            return Vi[key];
        case LANG.CN:
            return Cn[key];
        default:
            return val;
    }
};

export function getValueEnTranslate(key) {
    return En[key];
};

export function getListInvertTranslate(listVal = []) {
    return listVal.map(val => getInvertTranslate(val));
};

// truyen vao value lay key
export function getKeyTranslate(val) {
    switch (Controller.getLang()) {
        case 'en':
            return dicEn[val] || val;
        case 'cn':
            return dicCn[val] || val;
        case 'vi':
            return dicVi[val] || val;
        default:
            return val;
    }
};

export function getListKeyTranslate(listVal) {
    return listVal.map(val => getKeyTranslate(val));
};

export function getValByKey(key = '') {
    switch (Controller.getLang()) {
        case LANG.EN:
            return En[key];
        case LANG.VI:
            return Vi[key];
        case LANG.CN:
            return Cn[key];
        default:
            return '';
    }
};

export function translateCustomLang(val, option = {}) {
    const fromLang = option.fromLang || Controller.getLang();
    const toLang = option.toLang || LANG.EN;

    if (fromLang === toLang) return val;

    let key = '';
    switch (fromLang) {
        case LANG.EN:
            key = dicEn[val];
            break;
        case LANG.VI:
            key = dicVi[val];
            break;
        case LANG.CN:
            key = dicCn[val];
            break;
        default:
            break;
    }

    switch (toLang) {
        case LANG.EN:
            return En[key] || '';
        case LANG.VI:
            return Vi[key] || '';
        case LANG.CN:
            return Cn[key] || '';
        default:
            return val;
    }
};

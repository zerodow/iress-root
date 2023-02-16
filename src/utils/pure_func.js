import Clone from 'clone'
import ReactElementToJSXString from 'react-element-to-jsx-string'
import uuid from 'react-native-uuid'
import { Platform } from 'react-native';

export const clone = Clone
export const getRandomString = () => uuid.v4()
export const isIOS = () => Platform.OS === 'ios'
export const isAndroid = () => Platform.OS === 'android'

export const json = {
    parse: str => {
        try {
            return JSON.parse(str)
        } catch (err) {
            return null
        }
    },
    stringify: obj => {
        try {
            return JSON.stringify(obj)
        } catch (err) {
            return null
        }
    }
};

export function clearAllPropObj(obj = {}) {
    Object.keys(obj).map(key => {
        delete obj[key]
    })
}

export function assignKeepRef(oriObj, newObj) {
    clearAllPropObj(oriObj)
    Object.keys(newObj).map(key => {
        oriObj[key] = newObj[key]
    })
}

export function compareObject(obj1, obj2) {
    const type1 = Object.prototype.toString.call(obj1);
    const type2 = Object.prototype.toString.call(obj2);
    if (type1 !== type2) return false;
    if (type1 === '[object String]' ||
        type1 === '[object Number]' ||
        type1 === '[object Boolean]' ||
        type1 === '[object Null]' ||
        type1 === '[object Undefined]') {
        return obj1 === obj2;
    }
    if (type1 === '[object Object]') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) return false;
        for (const key in obj1) {
            if (!obj2.hasOwnProperty(key)) return false;
            const val1 = obj1[key];
            const val2 = obj2[key];
            if (!compareObject(val1, val2)) return false;
        }
    }
    if (type1 === '[object Array]') {
        if (obj1.length !== obj2.length) return false;
        for (let i = 0; i < obj1.length; i++) {
            const val1 = obj1[i];
            const val2 = obj2[i];
            if (!compareObject(val1, val2)) return false;
        }
    }
    return true;
}

export function removeWhiteSpace(str = '') {
    try {
        return str.replace(/\s/g, '')
    } catch (error) {
        return null
    }
}

export function compareJSX(obj1, obj2) {
    try {
        if (!obj1 || !obj2) return obj1 === obj2

        const str1 = ReactElementToJSXString(obj1)
        const str2 = ReactElementToJSXString(obj2)

        return typeof str1 === 'string' && typeof str2 === 'string'
            ? removeWhiteSpace(str1) === removeWhiteSpace(str2)
            : false
    } catch (error) {
        return false
    }
}

export function catchFunc() {
    const a = undefined
    return a.name
}

export function emptyFunc() {
    return true
}

export function trueFunc() {
    return true
}

export function falseFunc() {
    return false
}

export function promiseResolve() {
    return Promise.resolve(1)
}

export function promiseResolveFn(func) {
    return () => {
        return new Promise(resolve => {
            resolve()
            setTimeout(() => {
                func()
            }, 0)
        })
    }
}

export function promiseReject() {
    return Promise.reject(new Error('error'))
}

export function merge(aaa, bbb, forceChange) {
    const var1 = clone(aaa);
    const var2 = clone(bbb);

    const type1 = Object.prototype.toString.call(var1);
    const type2 = Object.prototype.toString.call(var2);

    if (type1 !== type2) return var2;

    if (type1 === '[object String]' ||
        type1 === '[object Number]' ||
        type1 === '[object Boolean]' ||
        type1 === '[object Null]' ||
        type1 === '[object Undefined]') {
        return var2;
    }

    if (type1 === '[object Object]') {
        const keys2 = Object.keys(var2);
        const newObj = { ...var1 };

        for (const key of keys2) {
            if (var1.hasOwnProperty(key)) {
                newObj[key] = merge(var1[key], var2[key], forceChange);
            } else {
                newObj[key] = var2[key];
            }
        }
        return newObj;
    }

    if (type1 === '[object Array]' && !forceChange) {
        const listMerge = [];
        const len1 = var1.length;
        const len2 = var2.length;

        for (let i = 0; i < len2; i++) {
            if (var1[i]) {
                listMerge.push(merge(var1[i], var2[i]));
            } else {
                listMerge.push(var2[i]);
            }
        }

        if (len1 - len2 > 0) {
            listMerge.push(...var1.slice(len2, len1));
        }

        return listMerge;
    }

    return var2
}

export function getFuncImplement(func = () => { }, param = []) {
    return () => func(...param)
}

export function getValueObject(obj = {}) {
    return Object.keys(obj).map(key => obj[key])
}

export function arrayHasItem(array) {
    return array && Array.isArray(array) && array.length > 0;
}

export function showNotification(FCM, { sound, vibrate, title = '', body = '' }) {
    const notifyDefault = {
        vibrate: vibrate ? 500 : 0,
        title,
        body,
        show_in_foreground: true,
        priority: 'high',
        badge: 0
    }
    if (sound) notifyDefault.sound = 'default'
    FCM.presentLocalNotification(notifyDefault);
}

export const getBooleanable = (value, def = true) => {
    return value != null ? value : def;
}

export function getStringSymbol(listSymbol, pathLength = 1000) {
    const listString = [];
    let currentLength = 0;
    const listChild = [];
    for (let i = 0; i < listSymbol.length; i++) {
        const symbol = encodeURIComponent(listSymbol[i]);
        if (i === listSymbol.length - 1) {
            listChild.push(symbol);
            listString.push(listChild.join(','));
            break;
        }
        if (currentLength + symbol.length + 1 < pathLength) {
            currentLength = currentLength + symbol.length + 1;
            listChild.push(symbol);
        } else {
            listString.push(listChild.join(','));
            currentLength = symbol.length + 1;
            listChild.length = 0;
            listChild.push(symbol);
        }
    }

    return listString;
}

export function toString(item) {
    const type = Object.prototype.toString.call(item)
    switch (type) {
        case '[object Object]':
        case '[object Array]':
            return json.stringify(item)
        default:
            return item + ''
    }
}

export function getCurrentLocalTime() {
    const date = new Date()
    return {
        date,
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        millisecond: date.getMilliseconds()
    }
}

export function getAuDateGTD(timestamp) {
    const date = new Date(timestamp);
    const auTime = {
        date: date.getDate(),
        hour: date.getHours()
    }
    if (auTime.hour >= 8) return date.setDate(auTime.date + 1)
    else return date;
}

export function getValidPath(listItem = [], maxLength = 99999999999) {
    const listPath = ['']
    let index = 0
    listItem.map(item => {
        const currentStr = listPath[index]
        const newItem = encodeURIComponent(item)
        if (currentStr.length + newItem.length + 1 > maxLength) {
            index++
            listPath[index] = newItem
        } else {
            listPath[index] = currentStr === ''
                ? `${newItem}`
                : `${currentStr},${newItem}`
        }
    })
    return listPath
}

export function validateDatePeriod(datePeriod) {
	if (datePeriod) {
		let re = /^[1-9]+[0-9]*[DWMY]$/g;
		return datePeriod.match(re) !== null;
	} else {
		return false;
	}
}

export function validateDatePeriodOnChangeText(datePeriod) {
	let re = /^([1-9]+[0-9]*)+[DWMY]?$/g;
	return datePeriod.match(re) !== null;
}

export function removeAllZeroBeforeNumber(input) {
	while (true) {
		if (input[0] === '0') {
			input = input.slice(1, input.length);
		} else break;
	}
	return input;
}

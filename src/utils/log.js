import DeviceInfo from 'react-native-device-info';
import Config from '../config';
import * as Model from '../memory/model';
import Enum from '../enum';
import * as PureFunc from '../utils/pure_func';
import RNFetchBlob from 'rn-fetch-blob';
import uuid from 'react-native-uuid';
import CryptoJS from 'crypto-js';
import { dataStorage } from '~/storage'

const LOG_LEVEL = Enum.LOG_LEVEL;
const JSON = PureFunc.json;

function postLog({ msg, level, limitLength = true }) {
	try {
		const deviceId = dataStorage.deviceId;
		const user = Model.getUserInfo();
		const session = Model.getSession();
		const objSend = {
			env: Config.environment,
			session,
			seqId: Model.increaseAndGetSequenceId(),
			time: new Date().toString(),
			userid: user.uid || user.user_id,
			email: user.email,
			deviceId,
			content: msg
		};
		const textSend = JSON.stringify(objSend)
			.replace(/\\+"/g, "'")
			.replace(/"/g, "'");
		if (limitLength && textSend.length >= 1000) {
			textSend.slice(0, 1000);
		}

		const firstKey = uuid.v4();
		const dataSend = CryptoJS.AES.encrypt(textSend, firstKey).toString();
		const body = {
			id: firstKey,
			type: level,
			data: dataSend
		};

		const request = new XMLHttpRequest();
		request.open('POST', Config.logChanel);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify(body));
	} catch (error) {
		console.log('sendToRocketChat func logAndReport exception: ', error);
	}
}

function createText(arg) {
	const logs = arg.map(item => PureFunc.toString(item));
	return logs.join(' ');
}

function log(arg) {
	const text = createText(arg);
	console.log(text);
	return text;
}

function warn(arg) {
	const text = createText(arg);
	console.warn(text);
	return text;
}

function error(arg) {
	const text = createText(arg);
	console.warn(text);
	return text;
}

export const logTest = {
	log: (...arg) => {
		const msg = log(arg);
		postLog({ msg, level: LOG_LEVEL.INFO });
	},
	logFull: (...arg) => {
		const msg = log(arg);
		postLog({ msg, level: LOG_LEVEL.INFO, limitLength: false });
	},
	warn: (...arg) => {
		const msg = warn(arg);
		postLog({ msg, level: LOG_LEVEL.WARN });
	},
	warnFull: (...arg) => {
		const msg = warn(arg);
		postLog({ msg, level: LOG_LEVEL.WARN, limitLength: false });
	},
	error: (...arg) => {
		const msg = error(arg);
		postLog({ msg, level: LOG_LEVEL.ERROR });
	},
	errorFull: (...arg) => {
		const msg = error(arg);
		postLog({ msg, level: LOG_LEVEL.ERROR, limitLength: false });
	},
	catch: (funcName, ...arg) => {
		const text = `Exception: ${funcName}, error: ${createText(arg)}`;
		logTest.error(text);
	},
	time: label => {
		console.time(label);
	},
	timeEnd: label => {
		console.timeEnd(label);
	},
	info: (...arg) => console.info(...arg)
};

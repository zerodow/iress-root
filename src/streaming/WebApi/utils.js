import _, { forEachRight } from 'lodash';
import uuid from 'react-native-uuid';
import DeviceInfo from 'react-native-device-info';

import { setDataCache, getCacheData } from '~/api';
import config from '~/config';
import * as Controller from '~/memory/controller';
import { dataStorage } from '~/storage';
import { checkAndAddToDic } from '~/lib/base/functionUtil';

export default class WebApi {
	constructor(defaultRunJS) {
		this.defaultRunJS = defaultRunJS;
	}

	setRunFunc(defaultRunJS) {
		this.defaultRunJS = defaultRunJS;
		forEachRight(this.dicCallFunc, ({ channel, paramsAsString }) => {
			this.defaultRunJS(`${channel}(${paramsAsString})`);
		});
	}

	dicChannel = {};
	dicCallFunc = [];

	runJSInBg(channel, paramsAsString) {
		if (this.defaultRunJS) {
			this.defaultRunJS(`${channel}(${paramsAsString})`);
		} else {
			this.dicCallFunc.push({ channel, paramsAsString });
		}
	}

	baseRun(channel, params, resolve, reject, isLong) {
		let paramsAsString = '';
		if (_.isArray(params)) {
			_.forEach(params, (p) => {
				paramsAsString += JSON.stringify(p);
				paramsAsString += ',';
			});
		} else {
			paramsAsString = JSON.stringify(params);
		}
		this.runJSInBg(channel, paramsAsString);
		if (resolve || reject) {
			const obj = { resolve, reject, isLong };
			const newID = uuid.v4();

			if (this.dicChannel[channel]) {
				this.dicChannel[channel][newID] = obj;
			} else {
				this.dicChannel[channel] = {};
				this.dicChannel[channel][newID] = obj;
			}
		}
	}
	runJS(channel, params) {
		return new Promise((resolve, reject) => {
			this.baseRun(channel, params, resolve, reject);
		});
	}
	runJSLong(channel, params, resolve, reject) {
		this.baseRun(channel, params, resolve, reject, true);
	}

	onMessage(channelProps, paramsProps) {
		const listChannel = this.dicChannel[channelProps];
		if (channelProps === 'base.logDevice') {
			const deviceId = dataStorage.deviceId;
			const user = Controller.getUserInfo();
			dataStorage.logId = dataStorage.logId + 1;
			const newParams = {
				deviceId,
				user,
				logId: dataStorage.logId,
				environment: config.environment,
				emailLogin: dataStorage.emailLogin,
				logChanel: config.logChanel
			};

			this.runJS('cw.onMesasge', [channelProps, newParams]);
		} else if (channelProps === 'base.getCacheData') {
			if (!paramsProps) return;
			const { url, byPassCache } = paramsProps;
			const cacheDataCb = (result, listUrl) => {
				const newParams = {
					result,
					listUrl,
					typeFunc: 'handleCache'
				};

				this.runJS('cw.onMesasge', [channelProps, newParams]);
			};
			const requestDataCb = (oldData, newUrl) => {
				const newParams = {
					oldData,
					newUrl,
					typeFunc: 'handleRequest'
				};
				this.runJS('cw.onMesasge', [channelProps, newParams]);
			};
			getCacheData(url, cacheDataCb, requestDataCb, byPassCache);
		} else if (channelProps === 'base.setDataCache') {
			if (!paramsProps) return;
			const { url, dataBody, oldData } = paramsProps;
			setDataCache(url, dataBody, oldData);
		} else if (channelProps === 'base.checkAndAddToDic') {
			if (!paramsProps) return;
			checkAndAddToDic(paramsProps);
		} else if (channelProps === 'cw.log') {
		} else {
			_.forEach(listChannel, (elementSub, id) => {
				elementSub.resolve(paramsProps);
				if (!elementSub.isLong) {
					delete this.dicChannel[channelProps][id];
				}
			});
		}
	}

	unSubChannel(c) {
		delete this.dicChannel[c];
	}

	unSubAll() {
		this.dicChannel = {};
	}
}

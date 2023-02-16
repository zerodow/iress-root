import * as Util from './util';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from './streaming/channel';
import * as Controller from './memory/controller';
import Enum from './enum';
import EventSource from '@lib/simple-eventsource';
import { logDevice } from '~/lib/base/functionUtil';
import { doInactiveWithSseConnect } from '~/manage/manageActiveScreen';
import { forEach, includes, keys } from 'lodash';
const DEFAULT_VAL = Enum.DEFAULT_VAL;

export default class Nchan {
	constructor({
		url,
		fnGetOption,
		onData,
		reconnectTime,
		onConnect,
		onChangeNetwork,
		timePushBlob,
		timeout,
		onError
	}) {
		this.init = this.init.bind(this);
		this.close = this.close.bind(this);
		this.onOpen = this.onOpen.bind(this);
		this.onError = this.onError.bind(this);
		this.onMessage = this.onMessage.bind(this);
		this.reconnect = this.reconnect.bind(this);
		this.checkNetwork = this.checkNetwork.bind(this);
		this.eventPushBlob = this.eventPushBlob.bind(this);

		this.listMsg = [];
		this.countOpen = 0;
		this.opened = false;
		this.closed = false;
		this.countLog = 1;
		this.countLogClose = 1;
		this.idForm = Util.getRandomKey();
		this.hasNetwork = Controller.getConnectionStatus();
		this.intervalNetwork = null;
		this.url = url;
		this.countReConnect = 0;
		this.onConnect = onConnect;
		this.timeoutObj = null;
		this.timeoutTime = 10 * 1000;
		this.funcOnErrorParent = onError;
		this.fnGetOption = fnGetOption;
		this.timePushBlob = timePushBlob;
		this.reconnectTime = reconnectTime || 1000;
		this.onChangeNetwork = onChangeNetwork;
		this.onDataCb = onData || DEFAULT_VAL.FUNC;

		this.eventPushBlob();
		this.init();
	}

	checkNetwork(isConnected) {
		if (this.hasNetwork === isConnected) return;
		this.hasNetwork = isConnected;
		this.onChangeNetwork && this.onChangeNetwork(isConnected);
	}

	init() {
		if (
			global.storageNchanAbort[this.url] ||
			includes(this.url, 'null') ||
			includes(this.url, 'undefined')
		)
			return;

		this.evs = new EventSource(this.url, this.fnGetOption());
		this.evs.addEventListener('message', this.onMessage);
		this.evs.addEventListener('error', this.onError);
		this.evs.addEventListener('open', this.onOpen);
		Emitter.addListener(
			Channel.getChannelConnectionChange(),
			this.idForm,
			this.checkNetwork
		);
		if (!this.timeoutTime) return;
		this.timeoutObj && clearTimeout(this.timeoutObj);
		this.timeoutObj = setTimeout(() => {
			logDevice(
				'info',
				`Nchan TIMEOUT: ${this.url}`,
				keys(global.storageNchanAbort)
			);
			forEach(global.storageNchanAbort, (closed) => {
				closed && closed();
			});
			this.onError('timeout from FE');
		}, this.timeoutTime);
	}

	close(isReconnect) {
		this.timeoutNetwork && clearTimeout(this.timeoutNetwork);
		if (!isReconnect) {
			this.countReConnect = 0;
		}
		this.listMsg.length = 0;
		this.evs && this.evs.close && this.evs.close();
		this.evs = null;
		Emitter.deleteByIdEvent(this.idForm);
		this.logClose();
		this.closed = true;
	}

	onMessage(data) {
		this.intervalNetwork && clearTimeout(this.timeoutNetwork);
		this.timeoutNetwork = null;
		this.timePushBlob ? this.listMsg.push(data) : this.onDataCb(data);
	}

	logOpen = this.logOpen.bind(this);
	logOpen() {
		if (!this.opened) {
			// reset count log khi chuyen trang thai open tu false -> true (neu this.opened === true thi chi ghi toi da 3 lan)
			this.countLog = 1;
		}
		if (this.countLog > 3) return false;
		logDevice(
			'info',
			`Nchan connect successful: ${this.url} - ${this.countLog} times`
		);
		this.countLog++;
	}

	logClose = this.logClose.bind(this);
	logClose() {
		if (!this.closed) {
			this.countLogClose = 1;
		}
		if (this.countLogClose > 3) return false;
		logDevice(
			'info',
			`Nchan close successful: ${this.url} - ${this.countLogClose} times`
		);
		this.countLogClose++;
	}

	onOpen() {
		// doInactiveWithSseConnect(this.url)
		this.logOpen();
		this.opened = true;
		this.timeoutNetwork && clearTimeout(this.timeoutNetwork);
		this.timeoutNetwork = null;
		this.timeoutObj && clearTimeout(this.timeoutObj);
		this.countOpen++;
		this.countOpen === 1 && this.onConnect && this.onConnect();
		this.countReConnect = 0;
	}
	clearAllTimoutOrInterval() {
		this.timeoutNetwork && clearTimeout(this.timeoutNetwork);
		this.timeoutObj && clearTimeout(this.timeoutObj);
		this.timeoutNetwork = null;
		this.timeoutObj = null;
	}

	onError(error, isReconnect = true) {
		if (!isReconnect) {
			// Clear settimeout check timout
			this.clearAllTimoutOrInterval();
			logDevice('info', `Nchan Error ${this.url}, error: ${error}`);
			return this.close();
		}
		if (this.errorCount) return;
		this.errorCount = this.errorCount || 0 + 1;
		this.opened = false;
		this.funcOnErrorParent && this.funcOnErrorParent(error);
		logDevice('info', `Nchan Error ${this.url}, error: ${error}`);
		if (this.reconnectTime) {
			if (this.timeoutNetwork) {
				clearTimeout(this.timeoutNetwork);
			}
			this.timeoutNetwork = setTimeout(() => {
				if (!this.hasNetwork) return;
				if (!this.opened) this.reconnect(isReconnect);
			}, 2 * this.reconnectTime + 2 * this.reconnectTime * this.countReConnect);
		} else {
			this.close();
		}
		// if (this.reconnectTime && Controller.getAccessToken() && isReconnect) {
		//     if (this.intervalNetwork) return;
		//     this.intervalNetwork = setInterval(() => {
		//         if (!this.hasNetwork) return;
		//         if (!this.opened) this.reconnect();
		//     }, this.reconnectTime);
		// } else {
		//     this.close();
		// }
	}

	eventPushBlob() {
		if (!this.timePushBlob) return;
		setInterval(() => {
			if (this.listMsg.length === 0) return;
			const blodData = [...this.listMsg];
			this.listMsg.length = 0;
			this.onDataCb(blodData);
		}, this.timePushBlob);
	}

	reconnect(isReconnect) {
		this.countReConnect++;
		this.close(isReconnect);
		this.init();
	}
}

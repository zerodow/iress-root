import Enum from '~/enum';
import EventSource from './simple-eventsource';

const DEFAULT_VAL = Enum.DEFAULT_VAL;

class Nchan {
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
		this.idForm = uuid.v4();
		this.hasNetwork = base.dic.isConnect;

		this.url = url;
		this.onConnect = onConnect;
		this.timeoutObj = null;
		this.timeoutTime = timeout;
		this.funcOnErrorParent = onError;
		this.fnGetOption = fnGetOption;
		this.timePushBlob = timePushBlob;
		this.reconnectTime = reconnectTime;
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
		this.evs = new EventSource(this.url, this.fnGetOption());
		this.evs.addEventListener('message', this.onMessage);
		this.evs.addEventListener('error', this.onError);
		this.evs.addEventListener('open', this.onOpen);

		if (!this.timeoutTime) return;
		this.timeoutObj = setTimeout(() => {
			console.warn(
				`Nchan connect timeout: ${this.timeoutTime}ms at ${this.url}`
			);
			this.onError('timeout');
		}, this.timeoutTime);
	}

	close() {
		this.listMsg.length = 0;
		this.evs && this.evs.close && this.evs.close();
		this.evs = null;
	}

	onMessage(data) {
		this.timePushBlob ? this.listMsg.push(data) : this.onDataCb(data);
	}

	onOpen() {
		this.opened = true;
		this.timeoutObj && clearTimeout(this.timeoutObj);
		this.countOpen++;
		this.countOpen === 1 && this.onConnect && this.onConnect();
	}

	onError(error) {
		this.opened = false;
		this.funcOnErrorParent && this.funcOnErrorParent(error);

		if (this.reconnectTime) {
			const intervalNetwork = setInterval(() => {
				if (!this.hasNetwork) return;

				clearInterval(intervalNetwork);
				if (!this.opened) this.reconnect();
			}, this.reconnectTime);
		} else {
			this.close();
		}
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

	reconnect() {
		this.close();
		this.init();
	}
}

class Api {
	onError(error) {
		this.opened = false;
		cw.emit('apt.subAllMarket.onError', error);

		if (this.reconnectTime) {
			const intervalNetwork = setInterval(() => {
				if (!this.hasNetwork) return;

				clearInterval(intervalNetwork);
				if (!this.opened) this.reconnect();
			}, this.reconnectTime);
		} else {
			this.close();
		}
	}

	onChangeNetwork(isConnected) {
		cw.emit('apt.subAllMarket.onChangeNetwork', isConnected);
	}

	subAllMarket(params) {
		_.forEach(params, (url, exchange) => {
			const onConnect = () => {
				this.nchanConnected[exchange] = newChan;
				cw.emit('apt.subAllMarket.onConnect');
			};

			const fnGetOption = () => ({
				headers: {
					Authorization: `Bearer ${base.dic.accessToken}`
				}
			});

			const onData = data => {
				cw.emit('api.subAllMarket', data);
			};

			const newChan = new Nchan({
				url,
				fnGetOption,
				onData,
				timeout: 20000,
				reconnectTime: 1000,
				onConnect,
				onError: this.onError,
				onChangeNetwork: this.onChangeNetwork
			});
			return newChan;
		});
	}

	unSubAll() {
		_.forEach(this.nchanConnected, (value, key) => {
			this.unSubWithKey(key);
		});
	}
	unSubWithKey(key) {
		if (this.nchanConnected[key]) {
			this.nchanConnected[key].close();
			this.nchanConnected[key] = null;
		}
	}
}

api = new Api();

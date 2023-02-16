export default class Nchan {
	constructor(props) {
		// timeout , reconnectTime => timeout check connect
		// onConnect, onData , onError => handle
		// timePushBlob => delay push data
		// url, options => info
		this.id = Date.now();
		this.props = props;
		this.init();
		this.dataCache = [];
	}

	init() {
		const { url, options } = this.props;
		try {
			this.evs = new EventSource(url, options);
		} catch (error) {
			cw.log('error', error.message);
		}
		this.createTimeoutRequest();

		this.evs.addEventListener('open', this.onOpen);
		this.evs.addEventListener('message', this.onData);
		this.evs.addEventListener('error', this.onError);
	}

	createTimeoutRequest() {
		const { timeout = 10000 } = this.props;
		if (timeout) {
			this.timeoutTimer = setTimeout(() => {
				this.onError('timeout');
			}, timeout);
		}
	}

	onOpen = this.onOpen.bind(this);
	onOpen() {
		const { timePushBlob, onConnect, onData } = this.props;
		onConnect && onConnect(this.id);

		this.timeoutTimer && clearTimeout(this.timeoutTimer); // without timout check
		this.timeoutTimer = null;

		this.reconnectTimer && clearTimeout(this.reconnectTimer);
		this.reconnectTimer = null;

		if (timePushBlob && !this.blodTimer) {
			this.blodTimer = setInterval(() => {
				!!this.dataCache[0] && onData && onData(this.dataCache);
				this.dataCache = [];
			}, timePushBlob);
		}
	}

	onData = this.onData.bind(this);
	onData(res) {
		const { data, type } = res || {};

		// without ping
		if (type === 'ping' || data.includes('ping')) {
			return;
		}

		let objData = null;
		try {
			objData = JSON.parse(data);
		} catch (error) {
			objData = data;
		}

		const { onData, timePushBlob } = this.props;
		if (objData) {
			if (!timePushBlob) {
				onData && onData(objData);
			} else {
				this.dataCache.push(objData);
			}
		}
	}

	onError = this.onError.bind(this);
	onError(err) {
		const { onError, onReconnect, reconnectTime = 1000 } = this.props;
		try {
			onError && onError(err.message);
		} catch (error) {
			onError && onError(err);
		}
		this.close();

		if (reconnectTime) {
			this.reconnectTimer && clearTimeout(this.reconnectTimer);
			this.reconnectTimer = setTimeout(() => {
				onReconnect && onReconnect(this.id);
				this.init();
			}, reconnectTime);
		}
	}

	close = this.close.bind(this);
	close() {
		const { onClose } = this.props;
		this.evs && this.evs.close && this.evs.close();
		this.evs = null;

		onClose && onClose(this.id);
	}
}

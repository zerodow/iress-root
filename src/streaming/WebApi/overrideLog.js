class LogForWeb {
	constructor(props) {
		this.dicChannel = {};
	}

	log() {
		try {
			this.emit('cw.log', arguments);
		} catch (error) {
			const str = 'error when log with Input: ' + arguments[0];
			window.ReactNativeWebView.postMessage(str);
		}
	}

	emit(channel, params, cb) {
		try {
			const newID = uuid.v4();
			if (cb) {
				if (this.dicChannel[channel]) {
					this.dicChannel[channel][newID] = { resolveFunc: cb };
				} else {
					this.dicChannel[channel] = {};
					this.dicChannel[channel][newID] = { resolveFunc: cb };
				}
			}

			const obj = {
				channel: channel,
				params: params
			};
			window.ReactNativeWebView.postMessage(JSON.stringify(obj));
		} catch (error) {
			cw.log('error when emit params with Input: ', channel, params);
		}
	}

	onMesasge(c, p) {
		try {
			const listChannel = this.dicChannel[c];
			_.forEach(listChannel, (elementSub, id) => {
				const objParams = p && JSON.parse(JSON.stringify(p));
				elementSub.resolveFunc(objParams);
				delete this.dicChannel[c][id];
			});
		} catch (error) {
			cw.log('error when onMesasge with Input', c, p);
		}
	}

	error() {}
}

cw = new LogForWeb();

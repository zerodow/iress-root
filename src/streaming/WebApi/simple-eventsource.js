const TIMEOUT = 29000;

export default class EventSource {
	constructor(url, option = {}) {
		this.init = this.init.bind(this);
		this.close = this.close.bind(this);
		this.onError = this.onError.bind(this);
		this.processMsg = this.processMsg.bind(this);
		this.controlTimeout = this.controlTimeout.bind(this);
		this.addEventListener = this.addEventListener.bind(this);

		this.url = url;
		this.xhr = null;
		this.resetingReq = false;
		this.option = option;
		this.intervalCheckAction = null;
		this.dicEvent = {
			message: () => {},
			open: () => {},
			error: () => {}
		};

		this.init(xhr => {
			this.xhr = xhr;
			this.controlTimeout();
			this.dicEvent.open();
		});
	}

	addEventListener(event, func) {
		this.dicEvent[event] = func;
	}

	close() {
		this.xhr && this.xhr.abort && this.xhr.abort();
		this.xhr = null;
		this.intervalCheckAction && clearInterval(this.intervalCheckAction);
	}

	onError(error) {
		this.dicEvent.error(error);
	}

	controlTimeout() {
		this.resetingReq = false;
		this.intervalCheckAction && clearInterval(this.intervalCheckAction);
		this.lastActionTime = new Date().getTime();
		this.intervalCheckAction = setInterval(() => {
			const distance = new Date().getTime() - this.lastActionTime;
			console.log('url check: ', this.xhr._url);
			if (distance < TIMEOUT || this.resetingReq) return;
			this.resetingReq = true;
			this.init(xhr => {
				this.close();
				this.xhr = xhr;
				this.controlTimeout();
			});
		}, 3000);
	}

	resetResponseXhr(xhr, txt = '') {
		xhr._response = txt;
	}

	processMsg(xhr) {
		this.lastActionTime = new Date().getTime();

		let responseText = xhr.responseText || '';
		responseText = responseText.trim();
		// responseText = responseText.replace(new RegExp('id:\\s.*\\n', 'g'), '');
		responseText = responseText.replace(/id:\\s.*\\n/g, '');
		const parts = responseText.split('\\n');
		const lastIndex = parts.length - 1;

		for (let i = 0; i <= lastIndex; i++) {
			const line = parts[i];
			if (line.length === 0) continue;
			if (/^data:\\s/.test(line)) {
				try {
					const obj = JSON.parse(line.replace(/^data:\\s*/, ''));
					if (obj.time && obj.type === 'ping') continue;
					this.dicEvent.message(obj);
					continue;
				} catch (error) {
					if (i === lastIndex) {
						return this.resetResponseXhr(xhr, line);
					}
				}
			}
			if (i !== lastIndex) continue;
			return line === ': hi' ||
				/^id:\\s/.test(line) ||
				/^retry:\\s/.test(line)
				? this.resetResponseXhr(xhr)
				: this.resetResponseXhr(xhr, line);
		}
		return this.resetResponseXhr(xhr);
	}

	init(onOpen) {
		const xhr = new XMLHttpRequest();
		let firstTime = true;

		xhr.open('GET', this.url, true);
		xhr.onreadystatechange = () => {
			switch (xhr.readyState) {
				case 2:
					if (!firstTime) return;
					firstTime = false;
					onOpen && onOpen(xhr);
					break;
				case 3:
					this.processMsg(xhr);
					break;
				case 4:
					if (xhr.status !== 200) return;
					this.onError(xhr.responseText);
					break;
				default:
					break;
			}
		};

		xhr.addEventListener('error', this.onError);
		this.option.headers &&
			xhr.setRequestHeader(
				'Authorization',
				this.option.headers.Authorization
			);
		xhr.setRequestHeader('Accept', 'text/event-stream');
		xhr.setRequestHeader('Cache-Control', 'no-cache');
		// xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();
	}
}

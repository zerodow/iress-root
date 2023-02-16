import ENUM from '~/enum';
import {
	handleShowPopupForceBack,
	handleErrorSystem
} from '~/component/error_system/Controllers/HandleResponseErrorSystem.js';
import { omit } from 'lodash';
const { SSE_ERROR } = ENUM;
const TIMEOUT = 29000;

global.storageNchanAbort = {};
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

		this.init((xhr) => {
			this.xhr = xhr;
			this.controlTimeout();
			this.dicEvent.open();
		});
	}

	addEventListener(event, func) {
		this.dicEvent[event] = func;
	}

	close() {
		global.storageNchanAbort = omit(global.storageNchanAbort, [this.url]);
		this.xhr && this.xhr.abort && this.xhr.abort();
		this.xhr = null;
		this.intervalCheckAction && clearInterval(this.intervalCheckAction);
	}

	onError(error, isReconnect = true) {
		this.dicEvent.error(error, isReconnect);
	}

	controlTimeout() {
		this.resetingReq = false;
		this.intervalCheckAction && clearInterval(this.intervalCheckAction);
		this.lastActionTime = new Date().getTime();
		this.intervalCheckAction = setInterval(() => {
			const distance = new Date().getTime() - this.lastActionTime;
			if (distance < TIMEOUT || this.resetingReq) return;
			this.resetingReq = true;
			this.init((xhr, clearTimerCheckTimeout = false) => {
				this.close();
				this.xhr = xhr;
				clearTimerCheckTimeout &&
					this.intervalCheckAction &&
					clearInterval(this.intervalCheckAction);
				!clearTimerCheckTimeout && this.controlTimeout();
			});
		}, 3000);
	}

	resetResponseXhr(xhr, txt = '') {
		xhr._response = txt;
	}

	processMsg(xhr) {
		this.lastActionTime = new Date().getTime();

		let isReconnect = true;
		let responseText = xhr.responseText || '';
		responseText = responseText.trim();
		responseText = responseText.replace(/id:\s.*\n/g, '');
		const parts = responseText.split('\n');
		const lastIndex = parts.length - 1;

		for (let i = 0; i <= lastIndex; i++) {
			const line = parts[i];
			if (line.length === 0) continue;
			if (/^data:\s/.test(line)) {
				try {
					const obj = JSON.parse(line.replace(/^data:\s*/, ''));
					const { time, type, error } = obj;
					// nếu msg là data: {error: "Inactive"} thì không clear responseText do readyStateChange 3 rồi đến 4
					if (
						error &&
						(error === SSE_ERROR.INACTIVE ||
							error === SSE_ERROR.INVALID_EXCHANGE)
					) {
						isReconnect = false;
					}
					if (time && type === 'ping') continue;
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
				/^id:\s/.test(line) ||
				/^retry:\s/.test(line)
				? this.resetResponseXhr(xhr)
				: this.resetResponseXhr(xhr, line);
		}
		if (isReconnect) {
			return this.resetResponseXhr(xhr);
		}
	}

	init(onOpen) {
		const xhr = new XMLHttpRequest();
		let firstTime = true;
		global.storageNchanAbort[this.url] = () => xhr.abort();

		xhr.open('GET', this.url, true);
		xhr.onreadystatechange = () => {
			switch (xhr.readyState) {
				case 2:
					if (!firstTime) return;
					firstTime = false;
					const clearTimerCheckTimeout = true;
					onOpen && onOpen(xhr, clearTimerCheckTimeout); // Khi mở được kết nối thì clear timer check timeout
					break;
				case 3:
					this.processMsg(xhr);
					break;
				case 4:
					if (xhr.status !== 200) return;
					console.log('NCHAN CASE 4 ERROR', xhr.responseText);
					let isReconnect = true;
					if (/^data:\s/.test(xhr.responseText)) {
						try {
							const obj = JSON.parse(
								xhr.responseText.replace(/^data:\s*/, '')
							);
							const { error } = obj;
							if (error) {
								switch (error) {
									// case SSE_ERROR.INACTIVE:
									// 	isReconnect = false;
									// 	handleErrorSystem({
									// 		code: 8999,
									// 		message: SSE_ERROR.INACTIVE
									// 	});
									// 	break;
									case SSE_ERROR.INVALID_EXCHANGE:
										isReconnect = false;
										break;
									default:
										break;
								}
							}
						} catch (error) {
							console.info(
								'NCHAN CASE 4 CHECK ERROR EXCEPTION',
								error
							);
							isReconnect = false;
						}
					}
					this.onError(xhr.responseText, isReconnect);
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
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.send();
	}
}

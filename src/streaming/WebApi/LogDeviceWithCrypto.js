const ChanelLog = 'https://iress-dev-api.equix.app/v1/log/data';

class LogDevice {
	constructor() {
		this.logId = 0;
		this.request = new XMLHttpRequest();
	}
	LogDevice({ type = 'info', message = '' }) {
		try {
			const firstKey = uuid.v4();
			var encrypted = CryptoJS.AES.encrypt(message, firstKey).toString();
			cw.log({
				encrypted,
				firstKey,
				message
			});
			const body = {
				id: firstKey,
				type,
				data: encrypted
			};
			this.request.open('POST', ChanelLog);
			this.request.setRequestHeader('Content-Type', 'application/json');
			this.request.onreadystatechange = () => {
				if (
					this.request.readyState === 4 &&
					this.request.status === 200
				) {
					// cw.emit('ld.LogDevice', {
					// 	firstKey,
					// 	message,
					// 	encrypted
					// });
					cw.emit('ld.LogDevice', 'SUCCESS');
				}
			};
			this.request.send(JSON.stringify(body));
		} catch (e) {
			cw.emit('ld.LogDevice', 'FAIL');
		}
	}
}
ld = new LogDevice();

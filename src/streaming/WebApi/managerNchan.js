import Nchan from './nchanWeb';

class managerNchan {
	constructor(props) {
		this.subcriber = {};
	}

	createSub = this.createSub.bind(this);
	createSub({ key, url, options, ...props }) {
		this.subcriber[key] = new Nchan({
			...props,
			url,
			options,
			onReconnect: (p) => {
				cw.emit('onReconnect.' + key, p);
			},
			onConnect: (p) => {
				cw.emit('onConnect.' + key, p);
			},
			onData: (p) => {
				cw.emit('onData.' + key, p);
			},
			onError: (p) => {
				cw.emit('onError.' + key, p);
			},
			onClose: (p) => {
				cw.emit('onClose.' + key, p);
			}
		});
	}

	unsub = this.unsub.bind(this);
	unsub({ key }) {
		if (this.subcriber[key]) {
			this.subcriber[key].close();
		}
	}
}

nchan = new managerNchan();

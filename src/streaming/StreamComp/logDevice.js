import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';
import uuid from 'react-native-uuid';
import CryptoJS from 'crypto-js';

import BaseConnecter from './baseConnect';
import * as Controller from '~/memory/controller';
import { func, dataStorage } from '~/storage';
// import * as Controller from '~/memory/controller';
import { backUpLogDevice } from '~/lib/base/functionUtil';
import * as Util from '~/util';
import * as Api from '~/api';
import streamActions from './reducer';
import Enum from '~/enum';
import scriptLoader from '~/streaming/WebApi/logAndTimer.bundle.js';
import WebApi from '../WebApi/utils';
import VietNamQueue from '@lib/vietnam-queue';

const CODE = `
<html>
    <head>	
        <script>
            ${decodeURI(scriptLoader)}
		    true;
		</script>
	</body>
</html>
`;

export default class CheckNetwork extends BaseConnecter {
	preLoad = [];
	type = null;
	message = null;
	LogQueue = new VietNamQueue();
	componentWillUnmount() {
		super.componentWillUnmount();
		dataStorage.logDevice = null;
	}
	setRef = this.setRef.bind(this);
	setRef(sef) {
		if (!sef) return;
		this._web = sef;
	}
	logDevice = this.logDevice.bind(this);
	logDevice(type = 'info', message = 'not have message log', channel) {
		try {
			this.type = type;
			this.message = message;
			// console.info('logDevice', message)
			// const sciptCode = `ld.LogDevice("${type}","${message}")`
			// this._web.injectJavaScript(sciptCode)
			this.LogQueue.push(
				() =>
					new Promise((resolve) => {
						const firstKey = uuid.v4();
						const dataSend = CryptoJS.AES.encrypt(
							message,
							firstKey
						).toString();
						const sciptCode = `ld.LogDevice("${type}","${dataSend}","${firstKey}","${channel}")`;
						this._web.injectJavaScript(sciptCode);
						this.resolve = resolve;
					})
			);
		} catch (error) {
			// console.info(error)
			backUpLogDevice(type, message);
		}
	}
	onLoadEnd = this.onLoadEnd.bind(this);
	onLoadEnd() {
		dataStorage.logDevice = this.logDevice;
	}

	handleMessage = this.handleMessage.bind(this);
	handleMessage(e) {
		const message = e.nativeEvent.data;
		this.resolve && this.resolve();

		if (message === 'FAIL') {
			this.resolve && this.resolve();
			backUpLogDevice(this.type, this.message);
		} else if (message === 'SUCCESS') {
			this.resolve && this.resolve();
		}
	}

	runJS = this.runJS.bind(this);
	runJS(code) {
		const runJSInBackground = () =>
			this._web && this._web.injectJavaScript(code);

		if (this.loadEnd) runJSInBackground();
		else {
			this.preLoad.push(runJSInBackground);
		}
	}

	render() {
		return (
			<View style={{ height: 0 }}>
				<WebView
					useWebKit
					originWhitelist={['*']}
					ref={this.setRef}
					source={{ html: CODE }}
					onLoadEnd={this.onLoadEnd}
					onMessage={this.handleMessage}
					onError={() => console.info('error')}
				/>
			</View>
		);
	}
}

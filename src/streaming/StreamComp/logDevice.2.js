import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import _ from 'lodash';

import BaseConnecter from './baseConnect';
import { dataStorage } from '~/storage';
import { backUpLogDevice } from '~/lib/base/functionUtil';
import scriptLoader from '~/streaming/WebApi/logWithCrypto.bundle.js';
import VietNamQueue from '@lib/vietnam-queue';

import WebApi from '../WebApi/utils';

const CODE = `
<html>
    <head>	
		<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"></script>
		<script
		src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.2/uuid.min.js"
		integrity="sha512-UNM1njAgOFUa74Z0bADwAq8gbTcqZC8Ej4xPSzpnh0l6KMevwvkBvbldF9uR++qKeJ+MOZHRjV1HZjoRvjDfNQ=="
		crossorigin="anonymous"
		></script>
		
        <script>
         	${decodeURI(scriptLoader)}
		    true;
		</script>
	</body>
</html>
`;

export default class CheckNetwork extends BaseConnecter {
	preLoad = [];
	LogQueue = new VietNamQueue();

	componentDidMount() {
		this.web = new WebApi(this.runJS);
	}

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
	logDevice(type = 'info', message = 'not have message log') {
		try {
			this.LogQueue.push(async () => {
				if (!this.web) return {};
				const result = await this.web.runJS('ld.LogDevice', {
					type,
					message
				});
				return result;
			});
		} catch (error) {
			// console.info(error)
			backUpLogDevice(type, message);
		}
	}

	onLoadEnd = this.onLoadEnd.bind(this);
	onLoadEnd() {
		dataStorage.logDevice = this.logDevice;
		this.loadEnd = true;
		if (this.preLoad) {
			_.forEach(this.preLoad, (funcLoad) => {
				funcLoad();
			});
			this.preLoad = [];
		}
	}

	handleMessage = this.handleMessage.bind(this);
	handleMessage(e) {
		const message = e.nativeEvent.data;
		try {
			const { channel, params } = JSON.parse(message);
			this.web && this.web.onMessage(channel, params);
		} catch (error) {
			console.info('error when json parse', message);
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

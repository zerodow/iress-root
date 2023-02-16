import React from 'react';
import { View, AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import BaseConnecter from './baseConnect';
import CheckUpdate from '~/component/check_update/check_update';
// import * as Controller from '~/memory/controller';
import * as Util from '~/util';
import * as Api from '~/api';
import streamActions from './reducer';
import Enum from '~/enum';
import scriptLoader from '~/streaming/WebApi/logAndTimer.bundle.js';
import WebApi from '../WebApi/utils';
import * as ManageAppstate from '~/manage/manageAppState';

import * as Channel from '~/streaming/channel';
import * as Emitter from '@lib/vietnam-emitter';

import { changeConnection } from '~/app.actions';
import * as Controller from '~/memory/controller';

import { dataStorage, func } from '~/storage';
const CODE = `
<html>
	<head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.0/axios.min.js" integrity="sha512-DZqqY3PiOvTP9HkjIWgjO6ouCbq+dxqWoJZ/Q+zPYNHmlnI2dQnbJ5bxAHpAMw+LXRm4D72EIRXzvcHQtE8/VQ==" crossorigin="anonymous"></script>
		<script src="https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/node-uuid/1.4.8/uuid.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.min.js" integrity="sha512-Zl1k/bs5R0zzwAw+kxzMh4HjpC2Y2fy8Qu8xoUUA4mXTYtgq6oWtLUUMSRiaJZ/hH0hwE7locgWLozvskZrnvw==" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/uuid/8.3.1/uuid.min.js" integrity="sha512-4JH7nC4nSqPixxbhZCLETJ+DUfHa+Ggk90LETm25fi/SitneSvtxkcWAUujvYrgKgvrvwv4NDAsFgdwCS79Dcw==" crossorigin="anonymous"></script>
	</head>
	<body>
        <script>
            ${decodeURI(scriptLoader)}
		    true;
		</script>
	</body>
</html>
`;
export default class CheckNetwork extends BaseConnecter {
	preLoad = [];
	componentDidMount() {
		this.web = new WebApi(this.runJS);
		this.update = new CheckUpdate();
		dataStorage.clearCheckNetworkInterval &&
			dataStorage.clearCheckNetworkInterval();
		AppState.addEventListener('change', this._handleAppStateChange);
	}
	setRef = this.setRef.bind(this);
	setRef(sef) {
		this._web = sef;
	}
	componentWillUnmount() {
		super.componentWillUnmount();
		AppState.removeEventListener('change', this._handleAppStateChange);
	}
	_handleAppStateChange = this._handleAppStateChange.bind(this);
	_handleAppStateChange(nextAppState) {
		if (nextAppState === 'active') {
			this.handleActiveTimeInterval();
		} else if (
			nextAppState === 'background' ||
			nextAppState === 'inactive'
		) {
			this.handleDisabledTimeInterval();
		}
	}
	onLoadEnd = this.onLoadEnd.bind(this);
	onLoadEnd() {
		const url = `${Controller.getBaseUrl(false)}/${Controller.getVersion(
			'version'
		)}/info`;
		this._web.injectJavaScript(`timer.checkNetworkConnection("${url}")`);
	}
	handleDisabledTimeInterval() {
		this._web.injectJavaScript(`timer.disabledInterval()`);
	}
	handleActiveTimeInterval() {
		this._web.injectJavaScript(`timer.activeInterval()`);
	}
	handleOnChangeConnected(isConnected) {
		Emitter.emit(Channel.getChannelConnectionChange(), isConnected);
		Controller.dispatch(changeConnection(isConnected));
	}
	handleMessage = this.handleMessage.bind(this);
	handleMessage(e) {
		const { data } = e.nativeEvent;
		if (data === 'true') {
			console.info('DCM isConnected', true);
			this.handleOnChangeConnected(true);
		} else if (data === 'false') {
			console.info('DCM isConnected', false);
			this.handleOnChangeConnected(false);
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

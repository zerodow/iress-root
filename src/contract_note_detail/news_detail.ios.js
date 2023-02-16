import React, { Component } from 'react';
import {
	View,
	Text,
	Picker,
	Item,
	Dimensions,
	TouchableOpacity,
	StyleSheet,
	PixelRatio
} from 'react-native';
import { WebView } from 'react-native-webview';
import firebase from '../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import styles from './style/news_detail';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import moment from 'moment';
import { iconsMap, iconsLoaded } from '../utils/AppIcons';
import I18n from '../modules/language/';
import { dataStorage, func } from '../storage';
import ProgressBar from '../modules/_global/ProgressBar';
import {
	logAndReport,
	log,
	logDevice,
	isIphoneXorAbove
} from '../lib/base/functionUtil';
import Share, { ShareSheet, Button } from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RetryConnect from '../component/retry_connect/retry_connect';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import performanceEnum from '../constants/performance';
import Perf from '../lib/base/performance_monitor';
import { setCurrentScreen } from '../lib/base/analytics';
import deviceModel from '../constants/device_model';
import * as Controller from '../memory/controller';
import analyticsEnum from '../constants/analytics';
const { height, width } = Dimensions.get('window');

export class ContractNoteDetail extends Component {
	constructor(props) {
		super(props);
		this.storageRef = null;
		this.deviceModel = dataStorage.deviceModel;
		this.state = {
			page: 1,
			visible: false,
			pageCount: 1,
			url: '',
			isPdf: false,
			isLoading: true,
			isConnected: this.props.isConnected
		};
		this.pdf = null;
		this.sharePdf = this.sharePdf.bind(this);
		this.handleReadContractNote = this.handleReadContractNote.bind(this);
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.perf = new Perf(performanceEnum.show_form_cnote_detail);
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					setCurrentScreen(analyticsEnum.newsDetail);
					this.perf &&
						this.perf.incrementCounter(
							performanceEnum.show_form_news_detail
						);
					break;
				case 'didAppear':
					if (Controller.getLoginStatus()) {
						const listUnread = dataStorage.list_news_unread || {};
						const check = listUnread[this.props.data.news_id];
						const newID = this.props.data.news_id;
						if (check) {
							dataStorage.list_news_unread[newID] = false;
							const code = (this.props.data.symbol + '').replace(
								/\.AU/g,
								''
							);
						}
					}
					break;
				case 'willDisappear':
					break;
				case 'didDisappear':
					break;
				default:
					break;
			}
		}
	}

	getTitle(data) {
		try {
			if (!data) return '';
			if (!data.title) return '';
			return `${data.symbol} / ${data.title}`;
		} catch (error) {
			logAndReport(
				'getTitle ContractDetail exception',
				error,
				'getTitle ContractDetail'
			);
			logDevice('info', `etTitle ContractDetail exception ${error}`);
		}
	}

	sharePdf() {
		try {
			let shareOptions = {
				title: this.getTitle(this.props.data),
				message: this.getTitle(this.props.data),
				url: `file://${this.state.url}`,
				type: 'application/pdf',
				subject: this.getTitle(this.props.data)
			};
			Share.open(shareOptions);
		} catch (error) {
			logAndReport(
				'sharePdf ContractDetail exception',
				error,
				'sharePdf ContractDetail'
			);
			logDevice('info', `sharePdf ContractDetail exception ${error}`);
		}
	}

	componentDidMount() {
		try {
			if (dataStorage.switchScreen === 'News') {
				dataStorage.switchScreen = '';
			}
			this.state.isConnected && this.handleReadContractNote();
		} catch (error) {
			logAndReport(
				'componentDidMount ContractDetail exception',
				error,
				'componentDidMount ContractDetail'
			);
			logDevice(
				'info',
				`componentDidMount ContractDetail exception ${error}`
			);
		}
	}

	handleReadContractNote() {
		if (this.props.source) {
			const dir = RNFetchBlob.fs.dirs;
			const now = new Date().getTime();
			const path = `${dir.DocumentDir}/news_storage/${now}.pdf`;
			RNFetchBlob.config({
				fileCache: true,
				path: path
			})
				.fetch('GET', this.props.source, {})
				.then(() => {
					this.setState({
						isLoading: false,
						url: path,
						isPdf: true
					});
				})
				.catch(error => {
					this.setState({
						isLoading: false,
						isPdf: true
					});
					log(error);
				});
		} else {
			this.setState({
				url: this.props.source,
				isPdf: false,
				isLoading: false
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps && nextProps.isConnected !== this.state.isConnected) {
			this.setState({ isConnected: nextProps.isConnected }, () => {
				nextProps.isConnected && this.handleReadContractNote(); // có mạng mới get newss
			});
		}
	}

	componentWillUnmount() {
		try {
			if (this.state.url) {
				RNFetchBlob.fs
					.unlink(this.state.url)
					.then(() => {
						// console.log('delete success');
					})
					.catch(error => {
						// console.log('error: ', error)
						logDevice(
							'info',
							`News detail get from ${
							this.state.url
							} exception: ${error}`
						);
					});
			}
		} catch (error) {
			logAndReport(
				'componentWillUnmount ContractDetail exception',
				error,
				'componentWillUnmount ContractDetail'
			);
			logDevice(
				'info',
				`News detail get from ${this.state.url} exception: ${error}`
			);
		}
	}

	onCancel() {
		// console.log('CANCEL')
		this.setState({ visible: false });
	}
	onOpen() {
		// console.log('OPEN')
		this.setState({ visible: true });
	}

	renderNavBar() {
		return (
			<View
				style={{
					paddingBottom: 10,
					backgroundColor: '#10a8b2',
					width: '100%',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexDirection: 'row',
					paddingTop: isIphoneXorAbove() ? 38 : 24
				}}
			>
				<TouchableOpacity
					testID="scheduleCancel"
					style={{ width: 50, alignItems: 'flex-start' }}
					onPress={() =>
						this.props.navigator.pop({
							animated: true,
							animationType: 'slide-horizontal'
						})
					}
				>
					<Ionicons
						style={{ paddingLeft: 16, paddingRight: 4 }}
						name="ios-arrow-back"
						size={30}
						color="white"
					/>
				</TouchableOpacity>
				<Text
					testID="title"
					style={[
						CommonStyle.fontLargeMedium,
						{ flex: 1, color: 'white', textAlign: 'center' }
					]}
				>
					{this.props.title}
				</Text>
				<TouchableOpacity
					testID="scheduleSave"
					style={{ width: 50, alignItems: 'flex-end' }}
					onPress={() => {
						this.sharePdf();
					}}
				>
					<Ionicons
						style={{ paddingRight: 16, paddingLeft: 4 }}
						name="ios-share-outline"
						size={24}
						color="white"
					/>
				</TouchableOpacity>
			</View>
		);
	}

	render() {
		let loading = null;
		// if (this.state.isConnected) {
		loading = (
			<View style={{ flex: 1, backgroundColor: '#FFF' }}>
				{this.renderNavBar()}
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<ProgressBar />
				</View>
			</View>
		);
		// } else {
		const retryConnect = (
			<RetryConnect onPress={() => console.log('RETRY')} />
		);
		// }
		if (!this.props.source) {
			const title = I18n.t('noAttachment', {
				locale: this.props.setting.lang
			});
			return (
				<View
					testID="ContractDetailNoAttachFile"
					style={{ flex: 1, backgroundColor: '#FFF' }}
				>
					{this.renderNavBar()}
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text style={CommonStyle.textMain}>
							{this.props.data.notice
								? `${this.props.data.notice}`
								: title}
						</Text>
					</View>
				</View>
			);
		}

		if (this.state.isLoading && this.state.isConnected) return loading;
		if (!this.state.isConnected) return retryConnect;

		return (
			<View testID="ContractDetail" style={styles.container}>
				{this.renderNavBar()}
				<WebView
					useWebKit
					originWhitelist={'*'}
					source={{ uri: this.state.url }}
					onLoadEnd={() =>
						this.setState({
							isLoading: false
						})
					}
					style={{
						width: width,
						height: height,
						backgroundColor: 'white'
					}}
					scalesPageToFit={true}
				/>
			</View>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

export default connect(
	mapStateToProps,
	{}
)(ContractNoteDetail);

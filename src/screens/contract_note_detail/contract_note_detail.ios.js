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

import firebase from '../../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import styles from './style/contract_note_detail';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import moment from 'moment';
import { iconsMap, iconsLoaded } from '../../utils/AppIcons';
import I18n from '../../modules/language/';
import { dataStorage, func } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import {
	logAndReport,
	log,
	logDevice,
	isIphoneXorAbove
} from '../../lib/base/functionUtil';
import Share, { ShareSheet, Button } from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RetryConnect from '../../component/retry_connect/retry_connect';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import deviceModel from '../../constants/device_model';
import * as Controller from '../../memory/controller';
import analyticsEnum from '../../constants/analytics';
import BottomTabBar from '~/component/tabbar'
import Header from '~/component/headerNavBar'
import CustomIcon from '~/component/Icon'

import TransitionView from '~/component/animation_component/transition_view'

const { height, width: WIDTH_DEVICE } = Dimensions.get('window');

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
			// url: 'https://www.google.com',
			isPdf: false,
			isLoading: true,
			isConnected: this.props.isConnected
		};
		this.pdf = null;
		this.sharePdf = this.sharePdf.bind(this);
		this.handleReadContractNote = this.handleReadContractNote.bind(this);
		this.renderLeftComp = this.renderLeftComp.bind(this);
		this.renderRightComp = this.renderRightComp.bind(this);
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
						const newId = this.props.data.news_id;
						if (check) {
							dataStorage.list_news_unread[newId] = false;
							const code = (this.props.data.symbol + '').replace(
								/\.AU/g,
								''
							);
						}
					}
					break;
				case 'willDisappear':
					dataStorage.backContractNoteDetail = true;
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
				nextProps.isConnected && this.handleReadContractNote(); // có mạng mới get contract note
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
			<Header
				renderLeftComp={this.renderLeftComp}
				renderRightComp={this.renderRightComp}
				navigator={this.props.navigator}
				title={this.props.title}
				style={{ width: WIDTH_DEVICE, marginLeft: 0, paddingTop: 16 }}
			>
				<View />
			</Header>
		)
	}

	renderRightComp() {
		return (
			<TouchableOpacity
				testID="scheduleSave"
				style={{ width: 50, alignItems: 'flex-end' }}
				onPress={() => {
					this.sharePdf();
				}}
			>
				<CustomIcon
					name='equix_share'
					color={CommonStyle.fontButtonV4}
					size={22}
					style={{ paddingRight: 16 }} />
			</TouchableOpacity>
		)
	}

	renderLeftComp() {
		return (
			<TouchableOpacity
				testID="scheduleCancel"
				style={{ width: 50, alignItems: 'flex-start' }}
				onPress={() => {
					if (this.viewParent) {
						this.viewParent.fadeOut(500).then(() => {
							this.props.cbBack && this.props.cbBack()
							this.props.navigator && this.props.navigator.dismissModal({
								animated: false,
								animationType: 'none'
							})
						})
					} else {
						this.props.cbBack && this.props.cbBack()
						this.props.navigator && this.props.navigator.dismissModal({
							animated: false,
							animationType: 'none'
						})
					}
				}}
			>
				<Ionicons
					style={{ paddingLeft: 16, paddingRight: 4 }}
					name="ios-arrow-back"
					size={30}
					color={CommonStyle.fontWhite}
				/>
			</TouchableOpacity>
		)
	}

	render() {
		let loading = null;
		// if (this.state.isConnected) {
		loading = (
			<View
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColor
				}}
			>
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
					style={{
						flex: 1,
						backgroundColor: CommonStyle.backgroundColor
					}}
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
			<TransitionView
				setRef={ref => this.viewParent = ref}
				testID="ContractDetail" style={[styles.container, { backgroundColor: CommonStyle.backgroundColorNews }]}>
				{this.renderNavBar()}
				<TransitionView
					setRef={ref => this.view = ref}
					animation={'fadeIn'} index={3} style={{ flex: 1, overflow: 'hidden' }}>
					< WebView
						originWhitelist={'*'}
						source={{ uri: this.state.url }}
						onLoadEnd={() =>
							this.setState({
								isLoading: false
							})
						}
						style={{
							width: WIDTH_DEVICE,
							height: 100,
							backgroundColor: CommonStyle.color.bg
						}}
						scalesPageToFit={true}
					/>
				</TransitionView>
			</TransitionView>
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

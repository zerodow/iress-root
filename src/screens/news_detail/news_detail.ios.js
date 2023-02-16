import React, { Component } from 'react';
import {
	View,
	Text,
	Picker,
	Item,
	Dimensions,
	TouchableOpacity,
	StyleSheet,
	DeviceEventEmitter,
	NativeAppEventEmitter,
	Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import firebase from '../../firebase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import DateTimePicker from 'react-native-modal-datetime-picker';
import styles from './style/news_detail';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import moment from 'moment';
// import Pdf from 'react-native-pdf';
import { iconsMap, iconsLoaded } from '../../utils/AppIcons';
import I18n from '../../modules/language/';
import { dataStorage, func } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import FallHeader from '~/component/fall_header';
import Icon from '~/component/headerNavBar/icon';
import * as newsControl from '~/screens/news_ver2/controller.js';
import {
	logAndReport,
	log,
	logDevice,
	deleteNotiNewsById,
	isIphoneXorAbove
} from '../../lib/base/functionUtil';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RetryConnect from '../../component/retry_connect/retry_connect';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import deviceModel from '../../constants/device_model';
import analyticsEnum from '../../constants/analytics';
import * as Controller from '../../memory/controller';
import Header from '../../../src/component/headerNavBar/index';
import * as Animatable from 'react-native-animatable';
import CustomIcon from '~/component/Icon';
import ENUM from '~/enum';
const { height, width } = Dimensions.get('window');

export class NewDetail extends Component {
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
			isConnected: this.props.isConnected,
			webviewBackgroundColor: 'transparent',
			loaded: false
		};
		this.pdf = null;
		this.sharePdf = this.sharePdf.bind(this);
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.emitter =
			Platform.OS === 'android'
				? DeviceEventEmitter
				: NativeAppEventEmitter;
		this.handleReadNews = this.handleReadNews.bind(this);
		this.perf = new Perf(performanceEnum.show_form_news_detail);
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
							const code = this.props.data.symbol;
							deleteNotiNewsById(this.props.data.news_id, code);
						}
					}
					break;
				case 'willDisappear':
					dataStorage.backNewsDetail = true;
					break;
				case 'didDisappear':
					break;
				default:
					break;
			}
		}
	}

	getTitle(data) {
		if (!data) return '';
		if (!data.title) return '';
		return `${data.symbol} / ${data.title}`;
	}

	sharePdf() {
		try {
			const shareOptions = {
				title: this.getTitle(this.props.data),
				message: this.getTitle(this.props.data),
				url: `file://${this.state.url}`,
				type: 'application/pdf',
				subject: this.getTitle(this.props.data)
			};
			Share.open(shareOptions);
		} catch (error) {
			logDevice('info', `sharePdf newsDetail exception ${error}`);
		}
	}

	componentDidMount() {
		if (dataStorage.switchScreen === 'News') {
			dataStorage.switchScreen = '';
		}
		this.state.isConnected && this.handleReadNews();
	}

	handleReadNews() {
		if (this.props.source) {
			const dir = RNFetchBlob.fs.dirs;
			const now = new Date().getTime();
			const path = `${dir.DocumentDir}/news_storage/${now}.pdf`;
			RNFetchBlob.config({
				fileCache: true,
				path: path
			})
				.fetch('GET', this.props.source, {})
				.then((res) => {
					this.setState({
						isLoading: false,
						url: path,
						isPdf: true
					});
				})
				.catch((error) => {
					this.setState({
						isLoading: false,
						isPdf: true
					});
					logDevice(
						'error',
						`IOS - DOWNLOAD FILE NEWS ERROR: ${error}`
					);
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
				nextProps.isConnected && this.handleReadNews(); // có mạng mới get newss
			});
		}
	}

	componentWillUnmount() {
		try {
			if (this.timeOutDismissModal) {
				clearTimeout(this.timeOutDismissModal);
			}
			if (this.state.url) {
				RNFetchBlob.fs
					.unlink(this.state.url)
					.then(() => {
						// console.log('delete success');
					})
					.catch((error) => {
						// console.log('error: ', error)
						logDevice(
							'info',
							`News detail get from ${this.state.url} exception: ${error}`
						);
					});
			}
		} catch (error) {
			logAndReport(
				'componentWillUnmount newsDetail exception',
				error,
				'componentWillUnmount newsDetail'
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

	cancelSchedule = () =>
		this.props.navigator.pop({
			animated: true,
			animationType: 'slide-horizontal'
		});

	saveSchedule = () => {
		if (this.state.url) {
			this.sharePdf();
		}
	};
	handlePressLeftIcon = () => {
		const navigatorEventID = this.props.navigatorEventIDParents;
		this.emitter &&
			this.emitter.emit(navigatorEventID, {
				id: 'hidden_news_detail'
			});
		this.refViewWrapper && this.refViewWrapper.fadeOut(500).then();
		this.timeOutDismissModal = setTimeout(() => {
			newsControl.setStatusShowNewDetail(false);
			this.props.navigator &&
				this.props.navigator.dismissModal({
					animation: false,
					animationType: 'none'
				});
		}, 500);
	};
	renderLeftComp = () => {
		return (
			<TouchableOpacityOpt
				timeDelay={ENUM.TIME_DELAY}
				style={{
					paddingTop: 6,
					paddingLeft: 16,
					width: 32,
					alignSelf: 'flex-start'
				}}
				hitSlop={{
					top: 16,
					left: 16,
					bottom: 16,
					right: 16
				}}
				onPress={this.handlePressLeftIcon}
			>
				<CustomIcon
					name="equix_arrow_back"
					color={CommonStyle.fontButtonV4}
					size={22}
				/>
			</TouchableOpacityOpt>
		);
	};
	renderRightComp = () => {
		return (
			<TouchableOpacity
				disabled={!this.state.loaded}
				testID="scheduleSave"
				style={{ width: 50, alignItems: 'flex-end' }}
				onPress={this.saveSchedule}
			>
				<CustomIcon
					name="equix_share"
					color={CommonStyle.fontButtonV4}
					size={22}
					style={{ paddingRight: 16 }}
				/>
			</TouchableOpacity>
		);
	};
	renderTitle = () => {
		return (
			<Text
				numberOfLines={2}
				style={{
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.fontSizeXL,
					color: CommonStyle.fontColor,
					width: '80%',
					paddingHorizontal: 16
				}}
			>
				{this.props.title}
			</Text>
		);
	};
	renderNavBar() {
		return (
			<Header
				renderLeftComp={this.renderLeftComp}
				title={this.props.title}
				renderContent={this.renderTitle}
				firstChildStyles={{
					borderBottomRightRadius: CommonStyle.borderBottomRightRadius
				}}
				containerStyle={{
					borderBottomRightRadius:
						CommonStyle.borderBottomRightRadius,
					overflow: 'hidden'
				}}
				firstChildStyles={{
					minHeight: 18,
					borderBottomRightRadius: CommonStyle.borderBottomRightRadius
				}}
				navigator={this.props.navigator}
				style={{ marginLeft: 0, paddingTop: 16 }}
				renderRightComp={this.renderRightComp}
			>
				<View></View>
			</Header>
		);
	}
	setRefViewWrapper = (ref) => {
		this.refViewWrapper = ref;
	};
	renderLoading = () => {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<ProgressBar />
			</View>
		);
	};
	renderData = () => {
		const { webviewBackgroundColor } = this.state;
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColorNews
				}}
			>
				{/* <Pdf
                    style={styles.pdf}
                    scale={1}
                    spacing={2}
                    source={{ uri: this.props.source }}
                    activityIndicator={
                        <View
                            style={{
                                backgroundColor:
                                    CommonStyle.backgroundColorNews,
                                flex: 1,
                                width,
                                alignItems: 'center'
                            }}
                        >
                            <ProgressBar />
                        </View>
                    }
                    onLoadComplete={(numberOfPages) => {
                        this.setState({
                            loaded: true,
                            numberOfPages
                        });
                    }}
                    onPageChanged={(currentPage) => {
                        this.setState({ currentPage });
                    }}
                /> */}
				<View
					style={{
						position: 'absolute',
						width,
						bottom: 20,
						height: 30,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<View
						style={{
							width: 80,
							backgroundColor: 'gray',
							opacity: 0.8,
							alignItems: 'center',
							borderRadius: 20
						}}
					>
						{this.state.currentPage !== undefined &&
							this.state.numberOfPages !== undefined && (
								<Text
									style={{
										color: CommonStyle.fontColor,
										paddingHorizontal: 5,
										paddingVertical: 5
									}}
								>{`${this.state.currentPage} / ${this.state.numberOfPages}`}</Text>
							)}
					</View>
				</View>
			</View>
		);
	};

	render() {
		if (!this.props.source) {
			const title = I18n.t('noAttachment');
			return (
				<Animatable.View
					ref={this.setRefViewWrapper}
					animation={'fadeInUp'}
					duration={500}
					style={{
						flex: 1,
						backgroundColor: CommonStyle.backgroundColorNews
					}}
				>
					<FallHeader
						ref={(ref) => ref && (this.headerRef = ref)}
						style={{
							backgroundColor: !this.state.loaded
								? CommonStyle.backgroundColorNews
								: 'white'
						}}
						header={this.renderNavBar()}
					>
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
					</FallHeader>
				</Animatable.View>
			);
		}
		return (
			<Animatable.View
				ref={this.setRefViewWrapper}
				animation={'fadeInUp'}
				duration={500}
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColorNews
				}}
			>
				<FallHeader
					ref={(ref) => ref && (this.headerRef = ref)}
					style={{
						backgroundColor: !this.state.loaded
							? CommonStyle.backgroundColorNews
							: 'white'
					}}
					header={this.renderNavBar()}
				>
					{this.state.isLoading && this.state.isConnected
						? this.renderLoading()
						: this.renderData()}
				</FallHeader>
			</Animatable.View>
		);
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
					testID="NewsDetailNoAttachFile"
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
			<View testID="NewsDetail" style={styles.container}>
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
						backgroundColor: CommonStyle.backgroundColor
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

export default connect(mapStateToProps, {})(NewDetail);

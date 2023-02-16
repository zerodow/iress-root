import React, { Component } from 'react';
import {
	View,
	Text,
	PixelRatio,
	TouchableOpacity,
	PermissionsAndroid,
	Dimensions,
	Alert,
	Platform,
	DeviceEventEmitter,
	NativeAppEventEmitter
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IconEntypo from 'react-native-vector-icons/Entypo';
import styles from './style/news_detail';
import I18n from '../../modules/language/';
import { dataStorage } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';

import {
	logAndReport,
	logDevice,
	deleteNotiNewsById,
	isIphoneXorAbove
} from '../../lib/base/functionUtil';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RetryConnect from '../../component/retry_connect/retry_connect';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import FallHeader from '~/component/fall_header';
import deviceModel from '../../constants/device_model';
import * as Controller from '../../memory/controller';
import * as Business from '../../business';
import { connect } from 'react-redux';
// import Pdf from 'react-native-pdf';
import Header from '~/component/headerNavBar/index';
import * as Animatable from 'react-native-animatable';
import Icon from '~/component/headerNavBar/icon';
import * as newsControl from '~/screens/news_ver2/controller.js';
import CustomIcon from '~/component/Icon';
import ENUM from '~/enum';
const { width } = Dimensions.get('window');

export class NewDetail extends Component {
	constructor(props) {
		super(props);
		this.deviceModel = dataStorage.deviceModel;
		this.sharePdf = this.sharePdf.bind(this);
		this.handleReadNews = this.handleReadNews.bind(this);
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.perf = new Perf(performanceEnum.show_form_news_detail);

		this.state = {
			url: '',
			currentPage: 1,
			numberOfPages: 1,
			isLoading: true,
			isPdf: true,
			webviewBackgroundColor: 'transparent',
			loaded: false
		};
		this.emitter =
			Platform.OS === 'android'
				? DeviceEventEmitter
				: NativeAppEventEmitter;
	}

	onAnimationEnd = this.onAnimationEnd.bind(this);
	onAnimationEnd() {
		this.requestReadPermission();
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'backPress':
					return true;
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
						if (check) {
							// eslint-disable-next-line standard/computed-property-even-spacing
							dataStorage.list_news_unread[
								this.props.data.news_id
							] = false;
							const code = (this.props.data.symbol + '').replace(
								/\.AU/g,
								''
							);
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

	getTitle(data = {}) {
		return !data.title ? '' : `${data.symbol} / ${data.title}`;
	}

	handleReadNews() {
		if (this.props.source) {
			const dir = RNFetchBlob.fs.dirs;
			const now = new Date().getTime();
			const path = `${dir.DocumentDir}/news_storage/${now}.pdf`;
			RNFetchBlob.config({
				fileCache: true,
				path
			})
				.fetch('GET', this.props.source, {})
				.then(() => {
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
						`ANDROID - DOWNLOAD FILE NEWS ERROR: ${error}`
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

	async requestReadPermission() {
		try {
			const granted = await PermissionsAndroid.requestMultiple([
				PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
			]);
			let isFullPermission = true;
			for (const key in granted) {
				const val = granted[key];
				if (val !== 'granted') {
					isFullPermission = false;
					break;
				}
			}

			if (isFullPermission) {
				if (dataStorage.switchScreen === 'News') {
					dataStorage.switchScreen = '';
				}
			} else {
				Alert.alert("You don't enable storage permissions");
			}

			this.props.isConnected && this.handleReadNews();
		} catch (err) {
			console.warn(err);
		}
	}

	sharePdf() {
		try {
			Business.requestAndroidPermission().then((isFullPermission) => {
				if (isFullPermission && this.state.url) {
					Share.open({
						title: this.getTitle(this.props.data),
						message: this.getTitle(this.props.data),
						url: `file://${this.state.url}`,
						type: 'application/pdf',
						subject: this.getTitle(this.props.data)
					}).catch((err) => {
						console.log('share pdf error', err);
					});
				} else {
					Alert.alert("You don't enable storage permissions");
				}
			});
		} catch (error) {
			logAndReport(
				'sharePdf newsDetail exception',
				error,
				'sharePdf newsDetail'
			);
			logDevice('info', `sharePdf newsDetail exception: ${error}`);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps && nextProps.isConnected !== this.props.isConnected) {
			this.setState({});
		}
	}

	componentWillUnmount() {
		try {
			if (this.timeoutDismissModal) {
				clearTimeout(this.timeoutDismissModal);
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
			logDevice(
				'info',
				`News detail get from ${this.state.url} exception: ${error}`
			);
		}
	}

	cancelSchedule = () =>
		this.props.navigator.pop({
			animated: true,
			animationType: 'slide-horizontal'
		});

	saveSchedule = () => {
		if (this.props.source) {
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
		this.timeoutDismissModal = setTimeout(() => {
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
				testID="scheduleSave"
				style={{ width: 50, alignItems: 'flex-end' }}
				onPress={this.saveSchedule}
				disabled={!this.state.loaded}
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
					paddingHorizontal: 16,
					lineHeight: CommonStyle.fontSizeXL + 8
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
					enablePaging={true}
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
				onAnimationEnd={this.onAnimationEnd}
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
				{this.renderNavBar()}
				{this.state.isLoading && this.state.isConnected
					? this.renderLoading()
					: this.renderData()}
			</Animatable.View>
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

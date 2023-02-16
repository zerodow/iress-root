import React, { Component } from 'react';
import {
	View,
	Text,
	PixelRatio,
	TouchableOpacity,
	PermissionsAndroid,
	Dimensions,
	Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './style/news_detail';
import I18n from '../modules/language/';
import { dataStorage } from '../storage';
import ProgressBar from '../modules/_global/ProgressBar';
import {
	logAndReport,
	logDevice,
	deleteNotiNewsById,
	isIphoneXorAbove
} from '../lib/base/functionUtil';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RetryConnect from '../component/retry_connect/retry_connect';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import performanceEnum from '../constants/performance';
import Perf from '../lib/base/performance_monitor';
import { setCurrentScreen } from '../lib/base/analytics';
import analyticsEnum from '../constants/analytics';
import deviceModel from '../constants/device_model';
import { connect } from 'react-redux';
// import Pdf from 'react-native-pdf';
import * as Controller from '../memory/controller';
import * as Business from '../business';
const { width } = Dimensions.get('window');

export class ContractNoteDetail extends Component {
	constructor(props) {
		super(props);
		this.deviceModel = dataStorage.deviceModel;
		this.sharePdf = this.sharePdf.bind(this);
		this.props.navigator.setOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);
		this.handleReadContractNote = this.handleReadContractNote.bind(this);
		this.perf = new Perf(performanceEnum.show_form_cnote_detail);

		this.currentPage = 1;
		this.numberOfPages = 1;

		this.state = {
			url: '',
			isLoading: true,
			isPdf: true
		};
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					setCurrentScreen(analyticsEnum.contractDetail);
					this.perf &&
						this.perf.incrementCounter(
							performanceEnum.show_form_cnote_detail
						);
					this.requestReadPermission();
					break;
				case 'didAppear':
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

	getTitle(data = {}) {
		return !data.title ? '' : `${data.symbol} / ${data.title}`;
	}

	handleReadContractNote() {
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
						url: path
					});
				})
				.catch((error) => {
					this.setState({
						isLoading: false
					});
					logDevice(
						'error',
						`ANDROID - DOWNLOAD FILE NEWS ERROR: ${error}`
					);
				});
		} else {
			this.setState({
				url: this.props.source,
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
				try {
					if (dataStorage.switchScreen === 'Contract') {
						dataStorage.switchScreen = '';
					}
				} catch (error) {
					logAndReport(
						'componentDidMount contractDetail exception',
						error,
						'componentDidMount contractDetail'
					);
					logDevice(
						'info',
						`componentDidMount contractDetail exception ${error}`
					);
				}
			} else {
				Alert.alert("You don't enable storage permissions");
			}
			this.props.isConnected && this.handleReadContractNote();
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
				'sharePdf contractDetail exception',
				error,
				'sharePdf contractDetail'
			);
			logDevice('info', `sharePdf contractDetail exception: ${error}`);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps && nextProps.isConnected !== this.props.isConnected) {
			this.setState({});
		}
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
					paddingLeft: 16,
					paddingRight: 16,
					marginTop: isIphoneXorAbove() ? 24 : 0,
					paddingTop: 10
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
					{
						<Ionicons
							name="md-arrow-back"
							size={30}
							color={CommonStyle.btnColor}
						/>
					}
				</TouchableOpacity>
				<Text
					testID="title"
					style={[
						CommonStyle.fontLargeMedium,
						{
							flex: 1,
							color: 'white',
							paddingHorizontal: 16,
							textAlign: 'center'
						}
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
						name="ios-share-outline"
						size={24}
						color={CommonStyle.btnColor}
					/>
				</TouchableOpacity>
			</View>
		);
	}

	render() {
		if (!this.props.isConnected) {
			return <RetryConnect onPress={() => console.log('RETRY')} />;
		}

		if (!this.props.source) {
			return (
				<View style={{ flex: 1, backgroundColor: '#FFF' }}>
					{this.renderNavBar()}
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text style={CommonStyle.textMain}>
							{I18n.t('noAttachment', {
								locale: this.props.setting.lang
							})}
						</Text>
					</View>
				</View>
			);
		}

		return (
			<View style={styles.container}>
				{this.renderNavBar()}
				{/* <Pdf
                    style={styles.pdf}
                    scale={1}
                    spacing={2}
                    source={{ uri: this.props.source }}
                    onLoadComplete={numberOfPages => {
                        this.numberOfPages = numberOfPages;
                        this.setState({});
                    }}
                    onPageChanged={page => {
                        this.currentPage = page;
                        this.setState({});
                    }}
                /> */}
				{this.state.isLoading ? (
					<View />
				) : (
					<View
						style={{
							position: 'absolute',
							width: width,
							bottom: 28,
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
							<Text
								style={{
									color: 'white',
									paddingHorizontal: 5,
									paddingVertical: 5
								}}
							>{`${this.currentPage} / ${this.numberOfPages}`}</Text>
						</View>
					</View>
				)}
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

export default connect(mapStateToProps, {})(ContractNoteDetail);

import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Platform,
	Alert,
	Dimensions,
	Animated
} from 'react-native';
import I18n from '../../modules/language/';
import DatePicker from '../../component/date_picker/date_picker';
import ENUM from '../../enum';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import ScreenId from '../../constants/screen_id';
import moment from 'moment';
import { iconsMap } from '../../utils/AppIcons';
import { dataStorage } from '../../storage';
import * as FuncUtil from '../../lib/base/functionUtil';
import * as Api from '../../api';
import * as Controller from '../../memory/controller';
import * as Http from '../../network/http/http';
import * as DateTime from '../../lib/base/dateTime';
import * as Business from '../../business';
import { connect } from 'react-redux';
// Component
import XComponent from '../../component/xComponent/xComponent';
import NetworkWarning from '~/component/network_warning/network_warning';
// import Pdf from 'react-native-pdf';
import ProgressBar from '../../modules/_global/ProgressBar';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import Header from '~/component/headerNavBar';
import Icons from '../../../src/component/headerNavBar/icon';
import CustomDate from '~/component/customDate';
import TransitionView from '~/component/animation_component/transition_view';
import DebonceButton from '~/component/debounce_button';
import FallHeader from '~/component/fall_header';
import CustomIcon from '~/component/Icon';

const NewTouchableOpacity = DebonceButton(TouchableOpacity);

const { width: WIDTH_DEVICE, height } = Dimensions.get('screen');
class TradeActivityReport extends XComponent {
	constructor(props) {
		super(props);

		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.init = this.init.bind(this);
		this.bindAllFunc();
		this.init();
	}

	bindAllFunc() {
		this.hideComponent = this.hideComponent.bind(this);
		this.renderDate = this.renderDate.bind(this);
		this.renderDuration = this.renderDuration.bind(this);
		this.renderPDF = this.renderPDF.bind(this);
		this.checkActiveDuration = this.checkActiveDuration.bind(this);
		this.setDuration = this.setDuration.bind(this);
		this.getReport = this.getReport.bind(this);
		this.reloadData = this.reloadData.bind(this);
		this.getReportError = this.getReportError.bind(this);
		this.setTimeRange = this.setTimeRange.bind(this);
		this.sharePdf = this.sharePdf.bind(this);
		this.applyDate = this.applyDate.bind(this);
		this.checkGetReportAfterCompareFromTo =
			this.checkGetReportAfterCompareFromTo.bind(this);
	}

	init() {
		this.animationTransLine = new Animated.Value(0);
		this.dic = {
			shareDetail: I18n.tEn(ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY),
			path: '',
			listDuration: [
				ENUM.REPORT_DURATION1.Day,
				ENUM.REPORT_DURATION1.Week,
				ENUM.REPORT_DURATION1.Month,
				ENUM.REPORT_DURATION1.Quarter1,
				ENUM.REPORT_DURATION1.Month6,
				ENUM.REPORT_DURATION1.Year
			],
			activeDuration: this.props.duration
				? this.props.duration.value
				: ENUM.REPORT_DURATION1.Day
		};
		const date = new Date().getDate();
		this.state = {
			fromDate: this.props.duration
				? this.props.duration.fromDate
				: FuncUtil.getStartDay(-1),
			toDate: this.props.duration
				? this.props.duration.toDate
				: FuncUtil.getEndDay(-1),
			duration: this.props.duration
				? this.props.duration.value
				: ENUM.REPORT_DURATION1.Day,
			source: '',
			isLoading: true,
			error: ''
		};
	}

	componentDidMount() {
		super.componentDidMount();
		this.getReport();
	}

	componentWillUnmount() {
		try {
			if (this.state.source) {
				RNFetchBlob.fs
					.unlink(this.state.source)
					.then(() => {
						console.log('delete success');
					})
					.catch((error) => {
						console.log('error: ', error);
						FuncUtil.logDevice(
							'info',
							`Unlink financial transactions report ${this.state.source} exception: ${error}`
						);
					});
			}
			this.setDurationTimeOut && clearTimeout(this.setDurationTimeOut);
			super.componentWillUnmount();
		} catch (error) {
			FuncUtil.logDevice(
				'info',
				`componentWillUnmount Unlink financial transactions report ${this.state.source} exception: ${error}`
			);
		}
	}

	sharePdf() {
		try {
			const shareOptions = {
				title: this.dic.shareDetail,
				message: this.dic.shareDetail,
				url: `file://${this.state.source}`,
				type: 'application/pdf',
				subject: this.dic.shareDetail
			};
			Business.requestAndroidPermission().then((isFullPermission) => {
				if (isFullPermission && this.state.source) {
					Share.open(shareOptions);
				} else {
					Alert.alert("You don't enable storage permissions");
				}
			});
		} catch (error) {
			FuncUtil.logDevice('info', `sharePdf report exception ${error}`);
		}
	}

	getReportError(error) {
		FuncUtil.logDevice('error', `TRADE ACTIVITY REPORT ERROR: ${error}`);
		this.setState({
			error,
			isLoading: false
		});
	}

	reloadData() {
		this.view &&
			this.view.fadeOut(350).then(() => {
				this.setState({ isLoading: true }, () => {
					this.getReport();
				});
			});
	}

	getReport() {
		try {
			const type = ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY;
			const accountID = Controller.getAccountId();
			if (!accountID) {
				return this.setState({
					isLoading: false
				});
			}
			const from = moment(this.state.fromDate).format('DD/MM/YY');
			const to = moment(this.state.toDate).format('DD/MM/YY');
			const dir = RNFetchBlob.fs.dirs;
			const now = new Date().getTime();
			const url = Api.getReportFromFileUrl(type, accountID, from, to);
			this.dic.path = `${dir.DocumentDir}/reports_storage/${now}.pdf`;
			// url = `${url}?from=${from}&to=${to}`

			Http.get({
				url,
				token: Controller.getAccessToken(),
				timeout: ENUM.TIMEOUT_CANCEL_REPORT_FROM_FILE
			})
				.then((res) => {
					try {
						FuncUtil.logDevice(
							'info',
							`TRADE ACTIVITY WRITEFILE PATH: ${this.dic.path}`
						);
						RNFetchBlob.fs
							.writeFile(this.dic.path, res, 'base64')
							.then(() => {
								FuncUtil.logDevice(
									'info',
									`TRADE ACTIVITY SUCCESS`
								);
								this.setState(
									{
										error: '',
										source: this.dic.path,
										isLoading: false
									},
									() => {
										this.props.updateWriteData &&
											this.props.updateWriteData(true);
										// this.props.enableSharePdf && this.props.enableSharePdf()
									}
								);
							})
							.catch((error) => {
								this.getReportError(error);
							});
					} catch (error) {
						this.getReportError(error);
					}
				})
				.catch((error) => {
					this.getReportError(error);
				});
		} catch (error) {
			this.getReportError(error);
		}
	}

	setTimeRange(duration) {
		const startYesterday = FuncUtil.getStartDay(-1);
		const endYesterday = FuncUtil.getEndDay(-1);
		let state = {
			fromDate: startYesterday,
			toDate: endYesterday
		};
		switch (duration) {
			case ENUM.REPORT_DURATION1.Day:
				state = {
					fromDate: startYesterday,
					toDate: endYesterday
				};
				break;
			case ENUM.REPORT_DURATION1.Week:
				state = {
					fromDate: DateTime.addDaysToTime(Date.now(), -7),
					toDate: endYesterday
				};
				break;
			case ENUM.REPORT_DURATION1.Month:
				state = {
					fromDate: DateTime.addMonthsToTime(Date.now(), -1),
					toDate: endYesterday
				};
				break;
			case ENUM.REPORT_DURATION1.Quarter1:
				state = {
					fromDate: DateTime.addMonthsToTime(Date.now(), -3),
					toDate: endYesterday
				};
				break;
			case ENUM.REPORT_DURATION1.Month6:
				state = {
					fromDate: DateTime.addMonthsToTime(Date.now(), -6),
					toDate: endYesterday
				};
				break;
			case ENUM.REPORT_DURATION1.Year:
				state = {
					fromDate: DateTime.addMonthsToTime(Date.now(), -12),
					toDate: endYesterday
				};
				break;
			default:
				break;
		}
		state.duration = duration;
		state.isLoading = true;
		this.props.updateDuration &&
			this.props.updateDuration(
				this.getDurationObj(state.fromDate, state.toDate),
				ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
			);
		this.setState(state, this.getReport);
	}

	getDurationObj(fromDate, toDate) {
		return {
			value: this.dic.activeDuration,
			fromDate: fromDate || this.state.fromDate,
			toDate: toDate || this.state.toDate
		};
	}

	setDuration(duration) {
		this.dic.activeDuration = duration;
		this.view && this.view.fadeOut(350).then(); // Khi khong co report thi ko the click vao duration
		this.setDurationTimeOut = setTimeout(() => {
			this.setTimeRange(duration);
		}, 350);
	}

	checkActiveDuration(duration) {
		return duration === this.dic.activeDuration;
	}

	checkGetReportAfterCompareFromTo(fromDate, toDate) {
		const fromDateStartDay = DateTime.getTimeStartDay(fromDate);
		const toDateStartDay = DateTime.getTimeStartDay(toDate);
		if (fromDateStartDay <= toDateStartDay) return true;
		return false;
	}

	applyDate(fromDate, toDate) {
		this.dic.activeDuration = 'custom';
		this.props.updateDuration &&
			this.props.updateDuration(
				this.getDurationObj(fromDate, toDate),
				ENUM.REPORT_FROM_FILE_TYPE.TRADE_ACTIVITY
			);
		this.view &&
			this.view.fadeOut(350).then(() => {
				this.setState({ fromDate, toDate, isLoading: true }, () => {
					if (
						this.checkGetReportAfterCompareFromTo(fromDate, toDate)
					) {
						this.getReport();
					}
				});
			});
	}

	renderDate() {
		const { fromDate, toDate } = this.state;
		return (
			<CustomDate
				maximumDate={new Date(FuncUtil.getEndDay(-1))}
				fromDate={fromDate}
				toDate={toDate}
				applyDate={this.applyDate}
			/>
		);
	}

	renderDuration() {
		return (
			<View
				style={[
					CommonStyle.chartOption,
					{ paddingLeft: 16, marginTop: 8, marginBottom: 0 }
				]}
				testID="durationRepostsFromFile"
			>
				{this.dic.listDuration.map((item, i) => {
					return (
						<View
							style={{
								height: 30,
								flex: 1,
								borderRadius: 5,
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							{this.checkActiveDuration(item) ? (
								<Animated.View
									style={{
										transform: [{ translateY: -24 }],
										width: 20,
										position: 'absolute',
										height: 4,
										borderRadius: 4,
										backgroundColor:
											CommonStyle.color.modify
									}}
								></Animated.View>
							) : null}
							<NewTouchableOpacity
								testID={`duration${i}`}
								key={item}
								onPress={() => this.setDuration(item)}
							>
								<Text
									style={[
										this.checkActiveDuration(item)
											? CommonStyle.textFilterSelected
											: CommonStyle.textFilter,
										{
											color: this.checkActiveDuration(
												item
											)
												? CommonStyle.colorProduct
												: CommonStyle.fontWhite,
											opacity: this.checkActiveDuration(
												item
											)
												? 1
												: 0.5
										}
									]}
								>
									{I18n.t(item === 'day' ? 'day' : item)}
								</Text>
							</NewTouchableOpacity>
						</View>
					);
				})}
			</View>
		);
	}

	renderPDF() {
		if (this.state.error) return this.props.renderNoData();
		if (this.state.isLoading) return this.props.renderLoading();
		if (!this.state.source) return <View />;
		return (
			<TransitionView
				style={{
					flex: 1,
					paddingLeft: Platform.OS === 'ios' ? 4 : 8,
					paddingRight: 8,
					marginTop: 8,
					marginBottom: CommonStyle.heightTabbar,
					overflow: 'hidden'
				}}
				setRef={(ref) => (this.view = ref)}
				animation={'fadeIn'}
				index={2}
			>
				{/* <Pdf
                    style={{
                        flex: 1,
                        backgroundColor: CommonStyle.backgroundColor1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}
                    scale={1}
                    fitPolicy={0}
                    spacing={8}
                    source={{ uri: `${this.state.source}` }}
                    activityIndicator={this.props.renderLoading()}
                    onLoadComplete={(numberOfPages) => {
                        console.log('numberOfPages', numberOfPages);
                    }}
                    onPageChanged={(currentPage) => {
                        console.log('currentPage', currentPage);
                    }}
                    onError={(error) => {
                        this.getReportError(error);
                        console.log(error);
                    }}
                /> */}
			</TransitionView>
		);
	}
	renderRightComp = () => {
		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'flex-end',
					backgroundColor: 'transparent'
				}}
			>
				<TouchableOpacity onPress={this.showModal}>
					<CustomIcon
						name="equix_file"
						onPress={this.showModal}
						style={{ paddingRight: 16 }}
						size={20}
						color={CommonStyle.fontWhite}
					/>
				</TouchableOpacity>
				{/* <Icons styles={{ paddingRight: 16 }} name="md-download" onPress={this.sharePdf} /> */}
				<CustomIcon
					name="equix_download"
					onPress={this.sharePdf}
					style={{ paddingHorizontal: 16 }}
					size={20}
					color={CommonStyle.fontWhite}
				/>
			</View>
		);
	};

	showModal = () => {
		this.props.showModal && this.props.showModal();
	};

	renderLeftComp = () => {
		return (
			<View style={{ left: -14 }}>
				<Icons
					styles={{ paddingRight: 6 }}
					name="ios-menu"
					onPress={this.openMenu}
					size={34}
				/>
			</View>
		);
	};

	openMenu = () => {
		this.props.onPressMenu && this.props.onPressMenu();
	};

	hideComponent(cb) {
		this.refHeader &&
			this.refHeader.fadeOut &&
			this.refHeader.fadeOut(200).then(() => cb && cb());
	}

	renderFakeIconPosition() {
		const isIphone = Platform.OS === 'ios';
		const isIphoneXorAbove = FuncUtil.isIphoneXorAbove();
		let marginTop = 0;
		if (isIphone && isIphoneXorAbove) marginTop = 46;
		if (isIphone && !isIphoneXorAbove) marginTop = 16;
		return (
			<View
				ref={(view) => view && (this.myComponent = view)}
				style={{ position: 'absolute', right: 68, top: marginTop + 32 }}
				onLayout={(e) =>
					this.props.onLayoutModal &&
					this.props.onLayoutModal(e, this.myComponent)
				}
			/>
		);
	}

	render() {
		return (
			<React.Fragment>
				{this.renderPDF()}
				{this.renderFakeIconPosition()}
			</React.Fragment>
		);
		return (
			<FallHeader
				animation="fadeIn"
				setRef={(ref) => (this.refHeader = ref)}
				style={{ backgroundColor: CommonStyle.backgroundColor1 }}
				header={
					<Header
						leftIcon={'ios-menu'}
						mainStyle={{
							flex: 1,
							lineHeight: CommonStyle.fontSizeXXL * 2,
							paddingRight: 16
						}}
						title={I18n.t('tradeActivity')}
						// mainTitleStyle={{ flex: 1 }}
						style={{ paddingTop: 16 }}
						renderRightComp={this.renderRightComp}
						rightStyles={{
							backgroundColor: 'transparent',
							flex: 0
						}}
						renderLeftComp={this.renderLeftComp}
					>
						<React.Fragment>
							{this.renderDuration()}
							<View
								style={{
									width: '100%',
									height: 66,
									paddingHorizontal: 32,
									paddingVertical: 12,
									justifyContent: 'center'
								}}
							>
								{this.renderDate()}
							</View>
						</React.Fragment>
					</Header>
				}
			>
				{this.renderPDF()}
				{this.renderFakeIconPosition()}
			</FallHeader>
		);
	}
}

function mapStateToProps(state) {
	return {
		setting: state.setting,
		tokenLogin: state.login.token,
		emailLogin: state.login.email
	};
}
function mapDispatchToProps(dispatch) {
	return {};
}
export default connect(mapStateToProps, mapDispatchToProps, null, {
	forwardRef: true
})(TradeActivityReport);

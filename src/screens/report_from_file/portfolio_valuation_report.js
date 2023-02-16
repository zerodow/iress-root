import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Platform,
	Alert,
	Dimensions
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
import * as timeUtils from '../../lib/base/dateTime';
import * as Business from '../../business';

// Component
import XComponent from '../../component/xComponent/xComponent';
// import Pdf from 'react-native-pdf'
import ProgressBar from '../../modules/_global/ProgressBar';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import Header from '~/component/headerNavBar';
import Icons from '../../../src/component/headerNavBar/icon';
import TransitionView from '~/component/animation_component/transition_view';
import DebonceButton from '~/component/debounce_button';
import FallHeader from '~/component/fall_header';
import CustomIcon from '~/component/Icon';

const { width: WIDTH_DEVICE } = Dimensions.get('window');
const NewTouchableOpacity = DebonceButton(TouchableOpacity);

export default class PortfolioValuationReport extends XComponent {
	constructor(props) {
		super(props);

		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.init = this.init.bind(this);
		this.bindAllFunc();
		this.init();
	}

	bindAllFunc() {
		this.handleDatePicked = this.handleDatePicked.bind(this);
		this.showDatePicker = this.showDatePicker.bind(this);
		this.renderDate = this.renderDate.bind(this);
		this.renderPDF = this.renderPDF.bind(this);
		this.sharePdf = this.sharePdf.bind(this);
		this.hideComponent = this.hideComponent.bind(this);
		this.getReport = this.getReport.bind(this);
		this.reloadData = this.reloadData.bind(this);
		this.getReportError = this.getReportError.bind(this);
		this.setDate = this.setDate.bind(this);
	}

	init() {
		this.dic = {
			shareDetail: I18n.tEn(
				ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION
			),
			path: ''
		};

		this.state = {
			date:
				this.props.duration || timeUtils.addDaysToTime(Date.now(), -1),
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
		FuncUtil.logDevice('error', `PORTFOLIO REPORT ERROR: ${error}`);
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
			const type = ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION;
			const accountID = Controller.getAccountId();
			if (!accountID) {
				return this.setState({
					isLoading: false
				});
			}
			const date = moment(this.state.date).format('DD/MM/YY');
			const dir = RNFetchBlob.fs.dirs;
			const now = new Date().getTime();
			const url = Api.getReportFromFileUrl(type, accountID, date, date);
			this.dic.path = `${dir.DocumentDir}/reports_storage/${now}.pdf`;
			// url = `${url}?from=${date}&to=${date}`

			Http.get({
				url,
				token: Controller.getAccessToken(),
				timeout: ENUM.TIMEOUT_CANCEL_REPORT_FROM_FILE
			})
				.then((res) => {
					try {
						FuncUtil.logDevice(
							'info',
							`PORTFOLIO WRITEFILE PATH: ${this.dic.path}`
						);
						RNFetchBlob.fs
							.writeFile(this.dic.path, res, 'base64')
							.then(() => {
								FuncUtil.logDevice('info', `PORTFOLIO SUCCESS`);
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

	setDate(date) {
		this.dic.datePickerRef && this.dic.datePickerRef.setDate(date);
	}

	handleDatePicked(date, callback) {
		callback && callback(true);
		this.props.updateDuration &&
			this.props.updateDuration(
				date,
				ENUM.REPORT_FROM_FILE_TYPE.PORTFOLIO_VALUATION
			);
		this.view &&
			this.view.fadeOut(350).then(() => {
				this.setState(
					{
						date,
						isLoading: true
					},
					this.getReport
				);
			});
	}

	showDatePicker() {
		this.dic.datePickerRef && this.dic.datePickerRef.showDatePicker();
	}

	renderDate() {
		return (
			<View style={{ flex: 1 }}>
				<Text
					style={{
						opacity: 0.25,
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font10,
						color: CommonStyle.fontWhite
					}}
				>
					{I18n.t('date')}
				</Text>
				<NewTouchableOpacity onPress={this.showDatePicker} style={{}}>
					<DatePicker
						check={true}
						date={this.state.date}
						ref={(ref) => (this.dic.datePickerRef = ref)}
						handleDatePicked={this.handleDatePicked}
						maximumDate={timeUtils.addDaysToTime(Date.now(), -1)}
						wrapperTextStyle={{
							flex: 1,
							alignItems: 'flex-start'
						}}
					/>
				</NewTouchableOpacity>
			</View>
		);
	}

	renderPDF() {
		if (this.state.error) return this.props.renderNoData();
		if (this.state.isLoading) return this.props.renderLoading();
		if (!this.state.source) return <View />;
		return (
			<TransitionView
				animation="fadeIn"
				index={2}
				setRef={(ref) => (this.view = ref)}
				style={{
					flex: 1,
					paddingLeft: Platform.OS === 'ios' ? 4 : 8,
					paddingRight: 8,
					marginTop: 8,
					marginBottom: CommonStyle.heightTabbar,
					overflow: 'hidden'
				}}
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
                    activityIndicator={
                        this.props.renderLoading()
                    }
                    onLoadComplete={numberOfPages => {
                        console.log('numberOfPages', numberOfPages)
                    }}
                    onPageChanged={currentPage => {
                        console.log('currentPage', currentPage)
                    }}
                    onError={error => {
                        this.getReportError(error)
                        console.log(error)
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
						title={I18n.t('portfolioValuation')}
						style={{ paddingTop: 16 }}
						renderRightComp={this.renderRightComp}
						renderLeftComp={this.renderLeftComp}
						rightStyles={{
							backgroundColor: 'transparent',
							flex: 0
						}}
					>
						<View
							style={{
								width: '100%',
								paddingLeft: 32,
								paddingVertical: 8,
								justifyContent: 'center'
							}}
						>
							{this.renderDate()}
						</View>
					</Header>
				}
			>
				{this.renderPDF()}
				{this.renderFakeIconPosition()}
			</FallHeader>
		);
	}
}

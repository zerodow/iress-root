import React, { Component } from 'react';
import {
	View, Text, TouchableOpacity, Platform,
	ScrollView, Dimensions, ListView, InteractionManager, Animated,
	LayoutAnimation, UIManager
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import { dataStorage, func } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import styles from './style/business_log';
import * as businessLogActions from './business_log.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import config from '../../config';
import I18n from '../../modules/language';
import {
	deleteAllNotiNews, logAndReport,
	logDevice,
	showBusinessLogDetail,
	switchForm,
	getSymbolInfoApi,
	pushToVerifyMailScreen,
	setRefTabbar
} from '../../lib/base/functionUtil';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import ScreenId from '../../constants/screen_id';
import { iconsMap } from '../../utils/AppIcons';
import ModalPicker from '../modal_picker/modal_picker';
import RowBusinessLog from './row_business_log';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Enum from '../../../src/enum.js';
import * as Controller from '../../../src/memory/controller';
import NetworkWarning from '../../component/network_warning/network_warning';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import colors from '../setting/auth_setting/Themes/Colors';
import BottomTabBar from '~/component/tabbar'
import Header from '~/component/headerNavBar'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import CustomIcon from '~/component/Icon'
import CustomDate from '~/component/customDate'
import { Navigation } from 'react-native-navigation'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import moment from 'moment'
import VietNamQueue from '@lib/vietnam-queue';
import FallHeader from '~/component/fall_header'
import * as timeUtils from '~/lib/base/dateTime';
import * as InvertTranslate from '~/invert_translate'
import * as Util from '~/util'

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true)

const { BUSINESS_LOG_FILTER_TYPE, BUSINESS_LOG_PAGE_SIZE, LIST_FILTER_TIME, LIST_FILTER_ACTION, LIST_FILTER_ACTION_OPERATOR } = Enum;
const { width, height } = Dimensions.get('window');
const listFilter = Object.keys(BUSINESS_LOG_FILTER_TYPE);
const ApiQueue = new VietNamQueue();

const duration = {
	fromDate: null,
	toDate: null,
	isCustom: true
}
export class BusinessLog extends Component {
	constructor(props) {
		super(props);
		this.isMount = false;
		this.isready = Platform.OS === 'ios';
		this.hasScrolled = false;
		this.pageId = 1;
		this.pageSize = BUSINESS_LOG_PAGE_SIZE;
		this.menuSelected = dataStorage.menuSelected;
		this.isReloadBusinessLog = true;
		this.customDuration = this.props.bLog.customDuration || duration
		this.duration = this.props.bLog.duration
		this.action = this.props.bLog.action
		this.listItemFilterTime = Util.getValueObject(LIST_FILTER_TIME)
		this.listItemFilterAction = Controller.getUserType() === Enum.USER_TYPE.OPERATOR
			? Util.getValueObject(LIST_FILTER_ACTION_OPERATOR)
			: Util.getValueObject(LIST_FILTER_ACTION)
		this.listFilterTime = InvertTranslate.getListInvertTranslate(this.listItemFilterTime)
		this.listFilterAction = InvertTranslate.getListInvertTranslate(this.listItemFilterAction)
		this.filterTime = this.props.bLog.duration
		this.filterAction = this.props.bLog.action
		this.customDuration = this.props.bLog.customDuration || duration
		this.filterActionDisplay = Util.getFilterActionDisplay(this.filterAction)
		this.translateAnim = new Animated.Value(0);
		this.heightHeaderAnim = new Animated.Value(32);
		this.opacityHeaderAnim = new Animated.Value(0);
		this.paddingTop = new Animated.Value(140);
		this.translateYCustomDate = new Animated.Value(-width / 3)
		this.state = {
			listData: [],
			isLoadMore: false,
			isConnected: true,
			dataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			})
		};
		this.isLoadBusinessLogData = false;
		// this.renderToLink = this.renderToLink.bind(this);
		this.getPosition = this.getPosition.bind(this);
		this._renderRow = this._renderRow.bind(this);
		this.getBusinessLogData = this.getBusinessLogData.bind(this);
		this.getDataComplete = this.getDataComplete.bind(this);
		this.onScroll = this.onScroll.bind(this);
		this.updateDuration = this.updateDuration.bind(this)
		this.updateCustomDuration = this.updateCustomDuration.bind(this)
		this.updateAction = this.updateAction.bind(this)
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.perf = new Perf(performanceEnum.show_form_business_log);
		this.getHeader = this.getHeader.bind(this)
		this.resetBusinessLog = this.resetBusinessLog.bind(this)
		// filter
		this.onShowModalFilter = this.onShowModalFilter.bind(this)
		this.onCloseModalFilter = this.onCloseModalFilter.bind(this)
		this.onSelected = this.onSelected.bind(this)
	}

	progressApiQueue = this.progressApiQueue.bind(this)
	progressApiQueue(fn, params) {
		ApiQueue.push(fn, params)
	}

	onSelectDuration = this.onSelectDuration.bind(this)
	onSelectDuration(value) {
		enValue = InvertTranslate.translateCustomLang(value)
		this.onDismissModal()
		if (this.filterTime !== value && [(enValue + '').toUpperCase(), (this.filterTime + '').toUpperCase()].includes('CUSTOM')) {
			LayoutAnimation.easeInEaseOut()
		}
		this.filterTime = value
		if ((enValue + '').toUpperCase() !== 'CUSTOM') {
			// Khác custom thì query
			this.hideCustomDate()
			return this.onSelected()
		}
		let fromDate = timeUtils.convertLocationToStartDaySettingTime(+new Date())
		let toDate = timeUtils.convertLocationToEndDaySettingTime(+new Date())
		if (this.props.bLog.customDuration && this.props.bLog.customDuration.fromDate) {
			fromDate = this.props.bLog.customDuration.fromDate
		}

		if (this.props.bLog.customDuration && this.props.bLog.customDuration.toDate) {
			toDate = this.props.bLog.customDuration.toDate
		}
		this.applyDate(fromDate, toDate)
	}

	hideCustomDate = this.hideCustomDate.bind(this)
	hideCustomDate() {
		Animated.timing(
			this.heightHeaderAnim,
			{
				toValue: 36,
				duration: 300
			}
		).start()
		setTimeout(() => {
			this.opacityHeaderAnim.setValue(0)
			this.translateYCustomDate.setValue(-width / 3)
		}, 300)
	}

	onSelectAction = this.onSelectAction.bind(this)
	onSelectAction(value) {
		const enValue = InvertTranslate.translateCustomLang(value)
		let action = 'all';
		switch (enValue) {
			case LIST_FILTER_ACTION.signInSignOut:
				action = 'sign'
				break;
			case LIST_FILTER_ACTION.enterPin:
				action = 'enter_pin'
				break;
			case LIST_FILTER_ACTION.updateWatchList:
				action = 'symbol'
				break;
			case LIST_FILTER_ACTION.placeOrder:
				action = 'place_order'
				break;
			case LIST_FILTER_ACTION.modifyOrder:
				action = 'modify_order'
				break;
			case LIST_FILTER_ACTION.cancelOrder:
				action = 'cancel_order'
				break;
			case LIST_FILTER_ACTION.queryReport:
				action = 'query'
				break;
			case LIST_FILTER_ACTION.updateSetting:
				action = 'update_setting'
				break;
			case LIST_FILTER_ACTION.updateSCM:
				action = 'saxo'
				break;
			case LIST_FILTER_ACTION.changeNewsSource:
				action = 'change_news_source'
				break;
			case LIST_FILTER_ACTION.changeStatus:
				action = 'change_status'
				break;
			case LIST_FILTER_ACTION.changeao:
				action = 'change_AO'
				break;
			case LIST_FILTER_ACTION.resetPasswordLower:
				action = 'reset_password'
				break;
			case LIST_FILTER_ACTION.forgotPasswordLower:
				action = 'forgot_password'
				break;
			case LIST_FILTER_ACTION.createUser:
				action = 'create_user'
				break;
			case LIST_FILTER_ACTION.updateUser:
				action = 'update_user'
				break;
			case LIST_FILTER_ACTION.createRoleGroup:
				action = 'create_role_group'
				break;
			case LIST_FILTER_ACTION.updateRoleGroup:
				action = 'update_role_group'
				break;
			case LIST_FILTER_ACTION.deleteRoleGroup:
				action = 'delete_role_group'
				break;
			case LIST_FILTER_ACTION.changeMarketData:
				action = 'change_market_data'
				break;
			case LIST_FILTER_ACTION.updateVettingRule:
				action = 'update_vetting_rule'
				break;
			default:
				action = 'all'
				break;
		}
		this.filterAction = action
		this.filterActionDisplay = Util.getFilterActionDisplay(this.filterAction)
		this.onDismissModal()
		this.onSelected()
	}

	onShowModalFilter() {
		this.props.navigator.showModal({
			screen: 'equix.BusinessLogFilter',
			title: I18n.t('filter'),
			backButtonTitle: '',
			animated: true,
			animationType: 'slide-up',
			passProps: {
				onSelected: this.onSelected,
				onClose: this.onCloseModalFilter,
				listFilterTime: this.listFilterTime,
				listFilterAction: this.listFilterAction
			},
			navigatorStyle: {
				...CommonStyle.navigatorSpecialNoHeader,
				modalPresentationStyle: 'overCurrentContext'
			}
		});
	}

	onCloseModalFilter() {
		this.props.navigator.dismissModal({
			animated: true,
			animationType: 'slide-down'
		})
		this.isReloadBusinessLog = false
	}

	resetBusinessLog() {
		if (this.props.bLog.listData.length >= 0) {
			this.props.actions.resetBusinessLog()
			// Set lai modal selected
			this.pageId = 1;
			this.pageSize = BUSINESS_LOG_PAGE_SIZE
		}
	}

	updateDuration(data) {
		this.props.actions.updateDuration(data)
	}

	updateCustomDuration(data) {
		this.props.actions.updateCustomDuration(data)
	}

	updateAction(data) {
		this.props.actions.updateAction(data)
	}

	onSelected() {
		const duration = this.filterTime
		const action = this.filterAction
		const customDuration = this.customDuration
		try {
			if ((this.filterTime + '').toUpperCase() === 'CUSTOM' && customDuration) {
				this.updateCustomDuration(customDuration)
			}
			this.isReloadBusinessLog = false
			this.duration = duration
			this.action = action
			// Update redux duration
			this.resetBusinessLog()
			this.updateDuration(duration)
			this.updateAction(action)
			this.getBusinessLogData();
		} catch (error) {
			logDevice('info', `save type filter Contract Note failed ${error}`);
		}
	}

	getBusinessLogData(isLoadMore = false) {
		if (this.isLoadBusinessLogData) return
		this.props.actions.loadBusinessLogData(this.duration, this.action, this.pageSize, this.pageId, isLoadMore, this.getDataComplete, this.customDuration);
	}

	getDataComplete(isComplete = false) {
		this.isReloadBusinessLog = true // Reset
		this.isLoadBusinessLogData = isComplete; // Reset
	}

	onNavigatorEvent(event) {
		if (event.type === 'DeepLink') {
			switchForm(this.props.navigator, event)
		}
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				case 'business_log_filter':
					this.onShowModalFilter()
					break;
				case 'menu_ios':
					this.props.navigator.toggleDrawer({
						side: 'left',
						animated: true
					});
					break;
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					this.perf && this.perf.incrementCounter(performanceEnum.show_form_business_log);
					setCurrentScreen(analyticsEnum.businessLog);
					break;
				case 'didAppear':
					setRefTabbar(this.tabbar)
					if (dataStorage.isChangeAccount) {
						dataStorage.isChangeAccount = false
					}
					func.setCurrentScreenId(ScreenId.BUSINESSLOG)
					this.props.navigator.setButtons({
						rightButtons: this.menuSelected === dataStorage.menuSelected ? [{
							testID: 'BusinessLogFilterIcon',
							id: 'business_log_filter',
							icon: iconsMap['ios-funnel-outline']
						}] : [],
						leftButtons: Platform.OS === 'ios'
							? [
								{
									title: 'menu',
									id: 'menu_ios',
									icon: iconsMap['md-menu'],
									testID: 'menu_ios'
								}
							]
							: [
								{
									id: 'sideMenu'
								}
							]
					});
					break;
				case 'willDisappear':
					break;
				case 'didDisappear':
					this.getDataComplete(false);
					this.sendRequest();
					break;
				default:
					break;
			}
		}
	}

	sendRequest() {
		deleteAllNotiNews();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps && nextProps.isConnected !== this.state.isConnected) {
			this.setState({
				isLoading: nextProps.bLog.isSearchLoading,
				isConnected: nextProps.isConnected
			}, () => {
				if (this.state.isConnected) {
					if (this.props.bLog.listData.length === 0) {
						this.getBusinessLogData();
					}
				}
			});
		}
		// Cập nhật listview data
		let listData = [];
		if (nextProps.bLog.listData && nextProps.bLog.listData.length > 0) {
			listData = nextProps.bLog.listData;
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows(
					listData
				)
			});
		}
	}

	getPosition() {
		this.resetFlatList();
		this.getBusinessLogData();
	}

	componentDidMount() {
		this.isMount = true
		this.resetBusinessLog();
		this.getBusinessLogData();
		dataStorage.loadData = this.getBusinessLogData;
	}

	componentWillUnmount() {
		this.isMount = false
	}

	loadMore() {
		const currentDataLength = this.props.bLog.listData.length || 0;
		if (currentDataLength < BUSINESS_LOG_PAGE_SIZE * this.pageId) {
			return;
		}
		this.pageId += 1;
		this.getBusinessLogData(true);
	}

	_renderRow(rowData, rowID) {
		return (
			<RowBusinessLog
				progressApiQueue={this.progressApiQueue}
				setting={this.props.setting}
				index={rowID}
				key={`${rowData.bLog_id}_${rowID}`}
				testID='RowBusinessLog'
				data={rowData}
				renderToLink={this.renderToLink} />
		)
	}

	_renderFooter() {
		return (
			<View style={{
				height: 100,
				justifyContent: 'center',
				alignItems: 'center'
			}}>
				{
					this.props.bLog.isLoadMore ? <ProgressBar /> : null
				}
			</View>
		)
	}

	showModalBusinessLogSearch() {
		this.props.navigator.showModal({
			animationType: 'slide-up',
			backButtonTitle: ' ',
			screen: 'equix.BusinessLogSearch',
			passProps: {
				duration: this.props.bLog.duration
			},
			navigatorStyle: {
				...CommonStyle.navigatorSpecialNoHeader,
				modalPresentationStyle: 'overCurrentContext'
			}
		});
	}

	getHeader() {
		try {
			return (
				<View style={{
					backgroundColor: CommonStyle.backgroundColor,
					marginHorizontal: 16,
					flexDirection: 'row',
					paddingVertical: 6,
					borderBottomWidth: 1,
					borderBottomColor: CommonStyle.fontBorderGray
				}}>
					<View style={{ flex: 1 }}>
						<Text style={[CommonStyle.textMainHeader]}>{I18n.t('timeUpper')}</Text>
						<Text style={[CommonStyle.textSubHeader]}>{I18n.t('actorUpper')}</Text>
					</View>
				</View>
			)
		} catch (error) {
			console.log('getHeader working logAndReport exception: ', error)
			logAndReport('getHeader working exception', error, 'changeIndex working');
		}
	}

	renderSearchBar() {
		return (
			<View testID='ContractNoteSearchBar' style={styles.searchBarContainer}>
				<TouchableOpacity style={styles.searchBar} onPress={this.showModalBusinessLogSearch.bind(this)}>
					<Icon name='ios-search' style={styles.iconSearch} />
					<Text style={styles.searchPlaceHolder}>{I18n.t('filter', { locale: this.props.setting.lang })}</Text>
				</TouchableOpacity>
			</View>
		);
	}

	onScroll() {
		this.hasScrolled = true;
		this.setState({
			isLoadMore: true
		})
	}

	onDismissModal = this.onDismissModal.bind(this)
	onDismissModal() {
		Navigation.dismissModal({
			animation: true,
			animationType: 'none'
		})
	}

	onShowDuration = this.onShowDuration.bind(this)
	onShowDuration() {
		Navigation.showModal({
			screen: 'equix.PickerBottomV2',
			animated: true,
			animationType: 'none',
			navigatorStyle: {
				...CommonStyle.navigatorModalSpecialNoHeader,
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				title: '',
				textBtnCancel: '',
				listItem: this.listFilterTime,
				onCancel: this.onDismissModal,
				onPressBackdrop: this.onDismissModal,
				onSelect: this.onSelectDuration,
				top: this.topIconDuration,
				height: this.heightIconDuration,
				value: this.filterTime,
				modalStyle: { marginRight: 0 },
				rowStyle: { width: 0.35 * width },
				numberRowVisible: 7
			}
		})
	}

	onShowAction = this.onShowAction.bind(this)
	onShowAction() {
		Navigation.showModal({
			screen: 'equix.ReanimatedPicker',
			animated: true,
			animationType: 'none',
			navigatorStyle: {
				...CommonStyle.navigatorModalSpecialNoHeader,
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				title: '',
				textBtnCancel: '',
				listItem: this.listFilterAction,
				onCancel: this.onDismissModal,
				onPressBackdrop: this.onDismissModal,
				onSelect: this.onSelectAction,
				top: this.topIconAction,
				height: this.heightIconAction,
				value: this.filterActionDisplay,
				modalStyle: { marginRight: this.rightIconAction },
				numberRowVisible: 9.5,
				alwaysDown: true, // Luôn xổ xuống
				numberRowVisibleAlwaysDown: 6.5 // Số dòng hiển thị khi xổ xuống
			}
		})
	}

	renderRightComp = this.renderRightComp.bind(this);
	renderRightComp() {
		return (
			<View
				ref={view => view && (this.myComponent = view)}
				style={{
					width: 60,
					flexDirection: 'row',
					justifyContent: 'flex-end',
					right: 16
				}}
			>
				<TouchableOpacityOpt
					hitSlop={{
						top: 16,
						left: 16,
						bottom: 16,
						right: 16
					}}
					onPress={this.onShowAction}
					collapsable={false}
					style={{ marginRight: 32 }}
					setRef={ref => {
						if (ref) {
							this.refIconAction = ref
							setTimeout(() => {
								this.isMount && this.refIconAction.measure && this.refIconAction.measure((x, y, w, h, px, py) => {
									console.log('DCM this.measureIconAoctin', py, px, w)
									this.measureIconAction = { x, y, w, h, px, py }
									this.topIconAction = h + py
									this.heightIconAction = h
									this.rightIconAction = (width) - px - w
								})
							}, 50)
						}
					}}>
					<CustomIcon
						name='equix_filter'
						size={24}
						color={CommonStyle.fontWhite} />
				</TouchableOpacityOpt>
				<TouchableOpacityOpt
					hitSlop={{
						top: 16,
						left: 16,
						bottom: 16,
						right: 16
					}}
					onPress={this.onShowDuration}
					collapsable={false}
					setRef={ref => {
						if (ref) {
							this.refIconDuration = ref
							setTimeout(() => {
								this.refIconDuration.measure && this.refIconDuration.measure((x, y, w, h, px, py) => {
									console.log('DCM this.measureIconDuration', py, px, w)
									this.measureIconDuration = { x, y, w, h, px, py }
									this.topIconDuration = h + py
									this.heightIconDuration = h
									this.widthIconDuration = w
								})
							}, 50)
						}
					}}>
					<MaterialIcon
						name={'access-time'}
						style={[CommonStyle.iconHeader, { marginTop: -2 }]} />
				</TouchableOpacityOpt>
			</View >
		);
	}

	applyDate = this.applyDate.bind(this)
	applyDate(fromDate, toDate) {
		this.customDuration = {
			isCustom: true,
			fromDate,
			toDate
		}
		this.onSelected()
	}

	renderCustomDate = this.renderCustomDate.bind(this)
	renderCustomDate() {
		let fromDate = timeUtils.convertLocationToStartDaySettingTime(+new Date())
		let toDate = timeUtils.convertLocationToEndDaySettingTime(+new Date())

		if (this.props.bLog.customDuration && this.props.bLog.customDuration.fromDate) {
			fromDate = this.props.bLog.customDuration.fromDate
		}

		if (this.props.bLog.customDuration && this.props.bLog.customDuration.toDate) {
			toDate = this.props.bLog.customDuration.toDate
		}
		return <View style={{ paddingLeft: 32, paddingRight: 35, height: 45 }}>
			<CustomDate
				fromDate={fromDate}
				toDate={toDate}
				applyDate={this.applyDate}
			/>
		</View>
	}

	renderContentHeader = this.renderContentHeader.bind(this)
	renderContentHeader() {
		return <Text style={{
			fontFamily: CommonStyle.fontPoppinsBold,
			fontSize: CommonStyle.fontSizeXXL,
			color: CommonStyle.navigatorSpecial.navBarSubtitleColor,
			width: 0.5 * width
		}}
			ellipsizeMode='tail'
			numberOfLines={1}>
			{I18n.t('activities')}
		</Text>
	}

	renderHeader = this.renderHeader.bind(this)
	renderHeader() {
		return <Header
			leftIcon='ios-menu'
			navigator={this.props.navigator}
			renderContent={this.renderContentHeader}
			renderRightComp={this.renderRightComp}
			title={I18n.t('activities')}
			containerStyle={{
				borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
				overflow: 'hidden'
			}}
			firstChildStyles={{ minHeight: 18 }}
			style={{
				marginLeft: 0,
				paddingTop: 16
			}}
		>
			<View style={{ paddingBottom: 12 }}>
				{(this.filterTime + '').toUpperCase() === 'CUSTOM' ? this.renderCustomDate() : null}
			</View>
		</Header>
	}

	render() {
		const data = this.state.dataSource
		return (
			<FallHeader
				style={{ backgroundColor: CommonStyle.backgroundColorNews }}
				header={this.renderHeader()}
			>
				<View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColorNews }}>
					{
						this.props.bLog.isLoading ? (
							<View style={{
								backgroundColor: CommonStyle.backgroundColorNews,
								flex: 1,
								justifyContent: 'center',
								alignItems: 'center'
							}}>
								<ProgressBar />
							</View>
						) : (
								this.props.bLog.listData && this.props.bLog.listData.length > 0 ? (
									<View style={{
										flex: 1,
										backgroundColor: CommonStyle.backgroundColorNews,
										paddingTop: 8
									}}>
										<React.Fragment>
											<ListView
												testID='FlatListRelatedNews'
												onEndReached={this.props.bLog.listData.length > 10 ? this.loadMore.bind(this) : () => null}
												onEndReachedThreshold={50}
												renderScrollComponent={props => <InvertibleScrollView showsVerticalScrollIndicator={false} {...props} />}
												keyboardShouldPersistTaps="always"
												enableEmptySections
												automaticallyAdjustContentInsets={false}
												dataSource={data}
												initialListSize={20}
												pageSize={30}
												renderRow={this._renderRow.bind(this)}
												renderFooter={this._renderFooter.bind(this)}
												style={{ height, backgroundColor: CommonStyle.backgroundColorNews }}
											/>
											<View style={{ height: 1, width: '100%' }} />
										</React.Fragment>
									</View>
								) : (
										<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CommonStyle.backgroundColorNews }}>
											<Text style={CommonStyle.textNoData}>{I18n.t('noBusinessLogData')}</Text>
										</View>
									)
							)
					}
					<BottomTabBar navigator={this.props.navigator} ref={ref => {
						this.tabbar = ref
						setRefTabbar(ref)
					}} />
				</View>
			</FallHeader>
		);
	}
}

function mapStateToProps(state) {
	return {
		bLog: state.bLog,
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(businessLogActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessLog);

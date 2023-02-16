import React from 'react';
import {
	ScrollView,
	Text,
	View,
	Platform,
	Dimensions,
	RefreshControl
} from 'react-native';
import ProgressBar from '../../modules/_global/ProgressBar';
import styles from './style/market.style';
import IndexItem from './indexItem';
import { getDateStringWithFormat } from '../../lib/base/dateTime';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as AllMarket from '../../streaming/all_market';
import {
	logAndReport,
	checkPropsStateShouldUpdate,
	logDevice,
	switchForm,
	openWhatsNewModal,
	getSymbolInfoApi,
	checkReadWhatsNew,
	formatNumberNew2,
	checkCurrentScreen,
	setRefTabbar
} from '../../lib/base/functionUtil';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import { dataStorage, func } from '../../storage';
import I18n from '../../modules/language/';
import CommonStyle from '~/theme/theme_controller';
import * as api from '../../api';
import ScreenId from '../../constants/screen_id';
import EXCHANGE_RATE from '../../constants/exchange_rate.json';
import Flag from '../../component/flags/flag';
import loginUserType from '../../constants/login_user_type';
import SplashScreen from 'react-native-splash-screen';
import * as Util from '../../util';
import * as Business from '../../business';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import XComponent from '../../component/xComponent/xComponent';
import Enum from '../../enum';
import * as Controller from '../../memory/controller';
import * as UserPriceSource from '../../userPriceSource';
import * as ManageConection from '../../manage/manageConnection';
import BottomTabBar from '~/component/tabbar';
import Header from '~/component/headerNavBar';
import FallHeader from '~/component/fall_header';
import Icons from '@component/headerNavBar/icon';
import PullToRefresh from '~/component/pull_to_refresh';
import * as ManageAppState from '~/manage/manageAppState';

const { height: HEIGHT_DEVICE } = Dimensions.get('window');

export class ExchangeRate extends XComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {
			text16,
			exchangeRateRowContainer,
			rateCol1,
			rateCol2,
			rateCol3,
			alignStart,
			alignEnd
		} = styles;
		const { data } = this.props;
		const flagExchange = data.displayName.split('/');

		let priceText = '--';
		if (
			!this.props.isLoading &&
			data.bid_price !== null &&
			data.bid_price !== undefined
		) {
			priceText = formatNumberNew2(data.bid_price, 5);
		}

		return (
			<View style={exchangeRateRowContainer}>
				<View style={[rateCol1, alignStart]}>
					<Text style={CommonStyle.textCurrencies}>
						{data.displayName ? data.displayName : '--'}
					</Text>
					<View style={{ flexDirection: 'row' }}>
						<Flag
							wrapperStyle={{ marginTop: -2 }}
							code={Business.getFlagByCode(flagExchange[0])}
							size={18}
							type="flat"
						/>
						<Text style={{ color: CommonStyle.fontColor }}>
							{' '}
							/{' '}
						</Text>
						<Flag
							wrapperStyle={{ marginTop: -2 }}
							code={Business.getFlagByCode(flagExchange[1])}
							size={18}
							type="flat"
						/>
					</View>
				</View>
				<View style={[rateCol3]}></View>
				<View style={[rateCol2, alignEnd]}>
					<Text style={CommonStyle.textCurrencies}>{priceText}</Text>
					<Text></Text>
				</View>
			</View>
		);
	}
}

export class NewOverview extends XComponent {
	init() {
		try {
			dataStorage.isNewOverview = true;
			this.heightHeader = 0;
			this.dic = {
				isRequesting: false,
				idForm: Util.getRandomKey(),
				c2r: false,
				register: {},
				refreshChart: {},
				actionFlashing: {},
				lastCode: '',
				isShowUserWarning: false,
				listSymbolObject: []
			};

			this.state = {
				isLoading: true,
				isRefresh: false,
				listExchangeRate: [],
				dataTop5: []
			};
			this.toggleDrawer = this.toggleDrawer.bind(this);
			this.closePopup = this.closePopup.bind(this);
			this.changeIndex = this.changeIndex.bind(this);
			// this.newOrderFunc = this.newOrderFunc.bind(this);
			this.showWhatsNew = this.showWhatsNew.bind(this);
			this.loadDataFrom = this.loadDataFrom.bind(this);
			this.dataGetPrice = this.dataGetPrice.bind(this);
			this.subLv1Realtime = this.subLv1Realtime.bind(this);
			this.registerChange = this.registerChange.bind(this);
			this.getExchangeRate = this.getExchangeRate.bind(this);
			this.getDataOverview = this.getDataOverview.bind(this);
			this.unsubLv1Realtime = this.unsubLv1Realtime.bind(this);
			this.showUserWarningPopup = this.showUserWarningPopup.bind(this);
			this.registerRefreshChart = this.registerRefreshChart.bind(this);
			this.onNavigatorEvent = this.onNavigatorEvent.bind(this);
			this.registerActionFlashingOverview = this.registerActionFlashingOverview.bind(
				this
			);
			func.setFuncReload('overview', this.getDataOverview.bind(this));
			func.setNavigatorGlobal({
				index: 0,
				navigator: this.props.navigator
			});
			ManageAppState.registerAppStateChangeHandle(
				ScreenId.OVERVIEW,
				() => {
					this.setState({ isLoading: true });
					this.getDataOverview();
				}
			);
			return true;
		} catch (error) {
			console.log('OVERVIEW INIT EXCEPTION', error);
			return false;
		}
	}

	registerChange(code, cb) {
		if (!this.dic.register) this.dic.register = {};
		this.dic.register[code] = cb;
	}

	registerActionFlashingOverview(code, cb) {
		this.dic.actionFlashing = this.dic.actionFlashing || {};
		this.dic.actionFlashing[code] = cb;
	}

	registerRefreshChart(code, cb) {
		this.dic.refreshChart = this.dic.refreshChart || {};
		this.dic.refreshChart[code] = cb;
	}

	changeIndex(code, isOpen) {
		try {
			const cb = this.dic.register[code];
			if (!cb) return false;

			const preCode = this.dic.lastCode;
			this.dic.lastCode = isOpen ? code : '';

			cb(isOpen);
			if (preCode !== code) {
				const preCb = this.dic.register[preCode];
				if (preCb) preCb(false);
			}

			return true;
		} catch (error) {
			logDevice('info', `changeIndex overview exception ${error}`);
			console.catch(error);
			return false;
		}
	}

	componentWillMount() {
		SplashScreen.hide();
	}

	componentDidMount() {
		super.componentDidMount();
		this.showWhatsNew();
		ManageConection.dicConnection.screenId = ScreenId.OVERVIEW;
		ManageConection.dicConnection.getSnapshot = this.getDataOverview;
	}

	componentWillUnmount() {
		try {
			this.unsubLv1Realtime(this.dic.listSymbolObject);
			super.componentWillUnmount();
			ManageConection.unRegisterSnapshot(ScreenId.OVERVIEW);

			return true;
		} catch (error) {
			console.catch(error);
			return false;
		}
	}

	async showWhatsNew() {
		try {
			if (dataStorage.homeScreen !== 0) return;
			console.log('OVERVIEW show whats news');
			const showModalWhatsNew = await checkReadWhatsNew();
			if (showModalWhatsNew) {
				console.log('Show whats new', showModalWhatsNew);
				await openWhatsNewModal(this.props.navigator, true);
			}

			return true;
		} catch (error) {
			console.catch(error);
			return false;
		}
	}

	closePopup() {
		this.dic.isRequesting = true;
		this.props.navigator.dismissModal({
			animated: true,
			animationType: 'none'
		});
	}

	showUserWarningPopup() {
		try {
			if (dataStorage.isShowNoAccount && dataStorage.isNotHaveAccount) {
				if (
					this.props.showWarningPopup &&
					!this.dic.isShowUserWarning
				) {
					this.props.navigator.showModal({
						screen: 'equix.PopUpWarning',
						animated: true,
						animationType: 'none',
						navigatorStyle: {
							navBarHidden: true,
							screenBackgroundColor: CommonStyle.fontTransparent,
							modalPresentationStyle: 'overCurrentContext'
						},
						passProps: {
							isHideModal: false,
							type: 'noAccount',
							okBtnCallback: this.closePopup
						}
					});
					this.dic.isShowUserWarning = true;
				}
				dataStorage.isShowNoAccount = false;
			} else {
				switch (dataStorage.loginUserType) {
					case loginUserType.LOCKED:
						if (
							this.props.showWarningPopup &&
							!this.dic.isShowUserWarning
						) {
							this.props.showWarningPopup(this.lockPrompt);
							this.dic.isShowUserWarning = true;
						}
						break;
					case loginUserType.REVIEW:
						if (
							this.props.showWarningPopup &&
							!this.dic.isShowUserWarning
						) {
							this.props.showWarningPopup(this.reviewPrompt);
							this.dic.isShowUserWarning = true;
						}
						break;
					default:
						break;
				}
			}

			return true;
		} catch (error) {
			console.catch(error);
			return false;
		}
	}

	onNavigatorEvent(event) {
		try {
			if (event.type === 'DeepLink') {
				switchForm(this.props.navigator, event);
			}
			if (event.type === 'NavBarButtonPress') {
				switch (event.id) {
					case 'overview_refresh':
						this.dic.c2r = true;
						this.setState({ isLoading: true });
						// REFRESH CHART
						const { lastCode } = this.dic;
						const refreshChartFn = this.dic.refreshChart[lastCode];

						refreshChartFn && refreshChartFn();
						// this.getExchangeRate()
						this.loadDataFrom();
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
						setCurrentScreen(analyticsEnum.overview);
						break;
					case 'didAppear':
						if (dataStorage.isChangeAccount) {
							dataStorage.isChangeAccount = false;
						}
						setRefTabbar(this.refBottomTabBar);
						dataStorage.loadData = func.getFuncReload('overview');

						func.setCurrentScreenId(ScreenId.OVERVIEW);
						this.dic.isRequesting = false;
						this.getDataOverview();
						break;
					case 'willDisappear':
						break;
					case 'didDisappear':
						this.unsubLv1Realtime(this.dic.listSymbolObject);
						break;
					default:
						break;
				}
			}

			return true;
		} catch (error) {
			console.catch(error);
			return false;
		}
	}

	setRefBottomTabbar = this.setRefBottomTabbar.bind(this);
	setRefBottomTabbar(ref) {
		this.refBottomTabBar = ref;
		setRefTabbar(ref);
	}

	changeTabOrders = this.changeTabOrders.bind(this);
	changeTabOrders(index) {
		this.refBottomTabBar && this.refBottomTabBar.changeTabActive(index); // Change tab orders
	}

	getDataOverview() {
		try {
			if (this.dic.isRequesting || !checkCurrentScreen(0)) return true;
			this.setState({ isLoading: true });
			this.loadDataFrom();
			// this.getExchangeRate()
			return true;
		} catch (error) {
			console.catch(error);
			return false;
		}
	}

	getExchangeRate() {
		let stringQuery = '';
		for (let i = 0; i < EXCHANGE_RATE.length; i++) {
			const { query } = EXCHANGE_RATE[i];
			stringQuery += `${query},`;
		}
		stringQuery = stringQuery.replace(/.$/, '');

		const url = api.getUrlExchangeRate(stringQuery);
		api.requestData(url, true)
			.then((response) => {
				if (response) {
					if (response.errorCode) {
						console.log(response.errorCode);
					} else if (response.length > 0) {
						const listExchangeRate = response;
						for (let i = 0; i < EXCHANGE_RATE.length; i++) {
							const { symbol } = EXCHANGE_RATE[i];
							listExchangeRate[i].displayName = symbol;
						}
						this.setState({ listExchangeRate });
					}
				} else {
					console.log('exchange rate is null');
				}
			})
			.catch((err) => {
				console.log(err);
			});

		return true;
	}

	shouldComponentUpdate(nextProps, nextState) {
		const listProps = [
			{ app: ['isConnected'] },
			'isShowWhatsNew',
			{ setting: ['lang', 'textFontSize'] }
		];
		const listState = ['listExchangeRate', 'isLoading', 'dataTop5'];
		return checkPropsStateShouldUpdate(
			nextProps,
			nextState,
			listProps,
			listState,
			this.props,
			this.state
		);
	}

	unsubLv1Realtime(listSymbolObject) {
		if (!Controller.isPriceStreaming()) return Promise.resolve();
		return new Promise((resolve) =>
			AllMarket.unsub(listSymbolObject, this.dic.idForm, resolve)
		);
	}

	subLv1Realtime(listSymbolObject) {
		if (!Controller.isPriceStreaming()) return Promise.resolve();
		return new Promise((resolve) => {
			AllMarket.setIsAIO(false);
			AllMarket.sub(listSymbolObject, this.dic.idForm, resolve);
		});
	}

	async dataGetPrice(listSymbol, listSymbolObject) {
		try {
			const isPriceStreaming = Controller.isPriceStreaming();
			perf = new Perf(performanceEnum.get_data_price_indicies);
			perf && perf.start();

			const numberSymbolUserWatchList = listSymbol.length;
			let expireSymbol = [];
			let isContain = false;

			await this.unsubLv1Realtime(listSymbolObject);
			await this.subLv1Realtime(listSymbolObject);

			UserPriceSource.loadDataPrice(
				Enum.STREAMING_MARKET_TYPE.QUOTE,
				listSymbolObject
			).then((bodyData) => {
				let newData = [];
				if (bodyData.length !== numberSymbolUserWatchList) {
					// Không lấy được đủ giá của symbol -> fill object fake
					expireSymbol = listSymbol.filter((v) => {
						const userWatchListSymbol = v.symbol;
						for (let i = 0; i < bodyData.length; i++) {
							const priceSymbol = bodyData[i].symbol;
							if (userWatchListSymbol === priceSymbol) {
								isContain = true;
							}
						}
						if (isContain) {
							isContain = false;
							return false;
						}
						return true;
					});
				}
				newData = [...bodyData, ...expireSymbol];

				// sort lai theo user watchlist
				const bodyDataSortByUserWatchList = [];
				for (let i = 0; i < listSymbol.length; i++) {
					const symbol = listSymbol[i].symbol;
					const arr = newData.filter((e, i) => {
						return e.symbol === symbol;
					});
					bodyDataSortByUserWatchList.push(arr[0]);
				}
				if (
					bodyDataSortByUserWatchList &&
					bodyDataSortByUserWatchList.length
				) {
					this.setTimeUpdate();
					this.setState({
						dataTop5: bodyDataSortByUserWatchList,
						isLoading: false,
						isRefresh: false
					});
				}
			});
		} catch (error) {
			this.setTimeUpdate();
			this.setState({
				isLoading: false,
				isRefresh: false
			});
			console.log(`Overview data get price exception: ${error}`);
			logDevice('info', `Overview data get price exception: ${error}`);
		}
	}

	setListSymbolObject(listSymbolObject) {
		this.dic.listSymbolObject = listSymbolObject;
	}

	setTimeUpdate = this.setTimeUpdate.bind(this);
	setTimeUpdate() {
		this.dic.refUpdateTime &&
			this.dic.refUpdateTime.setTimeUpdate(new Date().getTime());
	}

	loadDataFrom() {
		perf = new Perf(performanceEnum.load_data_overview);
		perf && perf.start();
		try {
			const url = api.getOverviewUrl(5); // get top 5
			api.requestData(url)
				.then((data) => {
					if (data) {
						if (data && data.errorCode) {
							this.setTimeUpdate();
							this.setState({
								isLoading: false,
								isRefresh: false
							});
						} else {
							const symbols = data.value || [];
							let symbolQuery = '';
							let stringQuery = '';
							for (let i = 0; i < symbols.length; i++) {
								const symbol = symbols[i].symbol;
								stringQuery += `${symbol},`;
								if (!dataStorage.symbolEquity[symbol]) {
									symbolQuery += `${symbol},`;
								}
							}
							if (symbolQuery) {
								symbolQuery = symbolQuery.replace(/.$/, '');
							}
							if (stringQuery) {
								stringQuery = stringQuery.replace(/.$/, '');
							}
							getSymbolInfoApi(symbolQuery, () => {
								const listSymbolObject = Util.getListSymbolObject(
									stringQuery
								);
								this.setListSymbolObject(listSymbolObject);

								this.dataGetPrice(symbols, listSymbolObject);
								perf && perf.stop();
							});
						}
					} else {
						this.setTimeUpdate();
						this.setState({
							isLoading: false,
							isRefresh: false
						});
					}
				})
				.catch((err) => {
					console.log(err);
					logDevice('info', `Overview.actions - getTopIndex: ${err}`);
					this.setTimeUpdate();
					this.setState({
						isLoading: false,
						isRefresh: false
					});
				});
		} catch (error) {
			logAndReport(
				'loadDataFrom overviewAction exception',
				error,
				'loadDataFrom overviewAction'
			);
			logDevice('info', `Overview.actions - loadDataFrom: ${error}`);
			this.setTimeUpdate();
			this.setState({
				isLoading: false,
				isRefresh: false
			});
		}
	}

	renderHeaderOverview({ label1, label2, label3, label4 }) {
		const {
			rateCol1,
			rateCol2,
			rateCol3,
			alignStart,
			alignEnd,
			text12,
			text9
		} = styles;
		return (
			<View style={styles.rateLabelContainer}>
				<View style={[rateCol1, alignStart]}>
					<Text style={[text12]}>{label1}</Text>
					<Text></Text>
				</View>
				<View style={[rateCol2, alignEnd]}>
					<Text style={[text12]}>{label2}</Text>
					<Text></Text>
				</View>
				<View style={[rateCol3, alignEnd]}>
					<Text style={[text12]}>{label3}</Text>
					<Text style={[text9]}>{label4}</Text>
				</View>
			</View>
		);
	}

	renderHeaderExchange({ label1, label2 }) {
		const {
			rateCol1,
			rateCol2,
			rateCol3,
			alignStart,
			alignEnd,
			text12,
			text9
		} = styles;
		return (
			<View style={styles.rateLabelContainer}>
				<View style={[rateCol1, alignStart]}>
					<Text style={[text12]}>{label1}</Text>
				</View>
				<View style={[rateCol3, { flex: 1 }]}></View>
				<View style={[rateCol2, alignEnd, { flex: 4 }]}>
					<Text style={[text12]}>{label2}</Text>
				</View>
			</View>
		);
	}

	renderLoading() {
		return (Controller.isPriceStreaming() && this.state.isLoading) ||
			(Controller.isPriceStreaming() &&
				!(
					(this.state.dataTop5 && this.state.dataTop5.length) ||
					(this.state.listExchangeRate &&
						this.state.listExchangeRate.length)
				)) ? (
			<View
				style={{
					backgroundColor: CommonStyle.fontTransparent,
					position: 'absolute',
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<ProgressBar />
			</View>
		) : null;
	}

	toggleDrawer() {
		// this.props.navigator.switchToTab({ tabIndex: 2 })
		this.props.navigator.toggleDrawer({
			side: 'left',
			animated: true
		});
	}

	openMenu = () => {
		const { navigator } = this.props;
		if (navigator) {
			navigator.toggleDrawer({
				side: 'left',
				animated: true
			});
		}
	};

	renderLeftComp = () => {
		return (
			<View style={{ left: -14 }}>
				<Icons
					styles={{ paddingRight: 16 }}
					name="ios-menu"
					onPress={this.openMenu}
					size={34}
				/>
			</View>
		);
	};

	renderMainHeader = this.renderMainHeader.bind(this);
	renderMainHeader() {
		return (
			<Header
				leftIcon="ios-menu"
				// onLeftPress={this.toggleDrawer}
				renderLeftComp={this.renderLeftComp}
				containerStyle={{
					borderBottomRightRadius:
						CommonStyle.borderBottomRightRadius,
					overflow: 'hidden'
				}}
				firstChildStyles={{ minHeight: 18 }}
				navigator={this.props.navigator}
				title={I18n.t('marketOverview')}
				style={{ marginLeft: 0, paddingTop: 16 }}
			>
				<View />
			</Header>
		);
	}

	renderTimeUpdate() {
		return (
			<PullToRefresh
				textStyle={{ paddingLeft: 16 }}
				ref={(ref) => (this.dic.refUpdateTime = ref)}
				header={this.renderMainHeader()}
			/>
		);
	}

	clickToRefresh() {
		this.getDataOverview();
	}

	onRefresh = this.onRefresh.bind(this);
	onRefresh() {
		if (Controller.isPriceStreaming()) return;
		this.setState({ isRefresh: true });
		this.clickToRefresh();
	}

	render() {
		const { rateContainer } = styles;
		return (
			<FallHeader isPullToRefresh header={this.renderMainHeader()}>
				<View
					testID="overviewScreen"
					style={{
						flex: 1,
						height: HEIGHT_DEVICE,
						backgroundColor: CommonStyle.backgroundColor
					}}
				>
					<ScrollView
						stickyHeaderIndices={[0]}
						ref={'overviewScroll'}
						scrollEventThrottle={16}
						contentContainerStyle={{ flexGrow: 1 }}
						showsVerticalScrollIndicator={false}
						onScroll={({ nativeEvent }) => {
							if (Platform.OS === 'android') return;
							if (Controller.isPriceStreaming()) return;
							if (
								nativeEvent &&
								nativeEvent.contentOffset &&
								nativeEvent.contentOffset.y < -100
							) {
								this.timeout && clearTimeout(this.timeout);
								this.timeout = setTimeout(() => {
									this.C2R = this.clickToRefresh;
								}, 100);
							}
						}}
						onScrollEndDrag={() => {
							if (Platform.OS === 'android') return;
							this.timeout2 && clearTimeout(this.timeout2);
							this.timeout2 = setTimeout(() => {
								this.C2R && this.C2R();
								this.C2R = null;
							}, 500);
						}}
						refreshControl={
							Platform.OS === 'android' &&
							!Controller.isPriceStreaming() ? (
								<RefreshControl
									progressViewOffset={100}
									refreshing={this.state.isRefresh}
									onRefresh={this.onRefresh}
								/>
							) : null
						}
						indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
					>
						{this.renderTimeUpdate()}
						{this.state.isLoading ? (
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<ProgressBar />
							</View>
						) : (
							[
								<View
									style={[rateContainer, { paddingRight: 4 }]}
									key="headeroverview"
								>
									{this.renderHeaderOverview({
										label1: I18n.t('australianMarkets', {
											locale: this.props.setting.lang
										}),
										label2: I18n.t('points', {
											locale: this.props.setting.lang
										}),
										label3: `${I18n.t('chg', {
											locale: this.props.setting.lang
										})}%`,
										label4: I18n.t('chg', {
											locale: this.props.setting.lang
										})
									})}
								</View>,
								this.state.dataTop5.map((e, i) => {
									const symbol = e.symbol;
									const displayName =
										dataStorage.symbolEquity[symbol] &&
										dataStorage.symbolEquity[symbol].company
											? dataStorage.symbolEquity[symbol]
													.company
											: symbol;
									const countryCode =
										dataStorage.symbolEquity[symbol] &&
										dataStorage.symbolEquity[symbol].country
											? dataStorage.symbolEquity[symbol]
													.country
											: 'AU';
									return (
										<View
											style={{ width: '100%' }}
											key={e.symbol}
										>
											<IndexItem
												onRef={(ref) =>
													(this.indexItem = ref)
												}
												testID={`overview_${e.symbol}`}
												symbol={symbol}
												countryCode={countryCode}
												originalObj={e}
												displayName={displayName}
												registerChange={
													this.registerChange
												}
												registerRefreshChart={
													this.registerRefreshChart
												}
												registerActionFlashingOverview={
													this
														.registerActionFlashingOverview
												}
												isLoading={this.state.isLoading}
												type="overview"
												changeIndex={this.changeIndex}
												{...this.props}
												key={e.symbol}
											/>
										</View>
									);
								}),
								<View
									style={{ width: '100%', marginBottom: 32 }}
									key="bottlineoverview"
								>
									<View
										style={{
											marginHorizontal: 16,
											borderBottomWidth: 1,
											borderColor:
												CommonStyle.fontBorderGray
										}}
									/>
								</View>,
								<View
									key="marbottomtabbaroverview"
									style={{
										width: '100%',
										backgroundColor:
											CommonStyle.backgroundColor,
										height: 100
									}}
								></View>
							]
						)}

						{/* <View style={[rateContainer, {}]}>
							{
								this.renderHeaderExchange({
									label1: I18n.t('currencies', { locale: this.props.setting.lang }),
									label2: I18n.t('exchangeRate', { locale: this.props.setting.lang })
								})
							}

							<View>
								{
									this.state.dataTop5.length === 0 && !this.dic.c2r
										? null
										: this.state.listExchangeRate.map((e, i) => {
											return <ExchangeRate data={e} key={i} isLoading={this.state.isLoading} />
										})
								}
							</View>
							<View style={{ height: 1, backgroundColor: CommonStyle.fontBorderGray }}></View>
						</View> */}
					</ScrollView>
					<BottomTabBar
						setRef={this.setRefBottomTabbar}
						index={0}
						navigator={this.props.navigator}
					/>
				</View>
			</FallHeader>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isShowWhatsNew: state.login.isShowWhatsNew,
		setting: state.setting,
		app: state.app
	};
}

// export default connect(mapStateToProps, {})(NewOverview);

export default () => null;

import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Dimensions, PixelRatio, InteractionManager } from 'react-native';
import Tabs, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import MarketCaps from '../../screens/market/market';
import config from '../../config';
import { func, dataStorage } from '../../storage';
import { getPriceSource } from '../../lib/base/functionUtil';
import styles from './style/movers';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Warning from '../../component/warning/warning';
import I18n from '../../modules/language/';
import Perf from '../../lib/base/performance_monitor';
import performanceEnum from '../../constants/performance';
import userType from '../../constants/user_type';
import * as Util from '../../util'
import * as Business from '../../business'
import * as Controller from '../../memory/controller'

const { height, width } = Dimensions.get('window');

export class Movers extends Component {
	constructor(props) {
		super(props);
				this.isFirstLoser = true;
		this.state = {
			heightTab: 50
		}
		this.reloadRegister = {};
		this.setAnimation = null;
		this.setAnimationCb = this.setAnimationCb.bind(this);
		this.runAnimation = this.runAnimation.bind(this);
		this.getTopGainRef = this.getTopGainRef.bind(this);
		this.getTopLoseRef = this.getTopLoseRef.bind(this);
		this.showHeader = this.showHeader.bind(this);
		this.perf = new Perf(performanceEnum.show_form_top_price);
	}

	componentWillMount() {
		this.perf.incrementCounter(performanceEnum.show_form_top_price);
	}

	componentDidMount() {
		this.props.onRef && this.props.onRef(this)
	}

	getTopGainRef() {
		if (this.topGain) {
			return this.topGain;
		}
		return null;
	}

	getTopLoseRef() {
		if (this.topLose) {
			return this.topLose;
		}
		return null;
	}

	showHeader() {
		this.topGain && this.topGain.showHeader();
		this.topLose && this.topLose.showHeader();
	}

	// reloadData(type, cb) {
	//   this.reloadRegister[type] = cb;
	//   this.props.reloadData && this.props.reloadData(type, cb);
	// }
	setAnimationCb(cbFn) {
		this.setAnimation = cbFn;
	}

	runAnimation(isOpen) {
		this.setAnimation && this.setAnimation(isOpen);
		this.props.setAnimation && this.props.setAnimation(isOpen);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				{func.getUserPriceSource() === userType.Delay ? <Warning ref={ref => this.tradeTab = ref} warningText={I18n.t('delayWarning', { locale: this.props.lang })} isConnected={true} /> : null}
				<Tabs
					contentProps={{
						keyboardShouldPersistTaps: 'always'
					}}
					style={{ backgroundColor: config.background.screen, marginBottom: 0 }}
					tabBarUnderlineStyle={{ height: 0, borderColor: 0 }}
					onChangeTab={(tabInfo) => {
						if (Controller.isPriceStreaming()) {
							// Unsub realtime watchlist
							Business.unSubByScreen('watchlist')
						}
						dataStorage.setButtonWatchlist && dataStorage.setButtonWatchlist({ i: 1 }, true)
						InteractionManager.runAfterInteractions(() => {
							if (tabInfo && tabInfo.i === 0) {
								dataStorage.tabWatchList = 'topGainers';
								dataStorage.tabTopPrice = 'topGainers';
								dataStorage.watchListScreenId = 'topGainers';
								if (!this.isFirstLoser) {
									const fcb = func.getFuncReload('topGainers');
									dataStorage.loadData = fcb;
									fcb && fcb();
								}
								this.isFirstGainer = false;
							} else if (tabInfo && tabInfo.i === 1) {
								dataStorage.tabWatchList = 'topLosers';
								dataStorage.tabTopPrice = 'topLosers';
								dataStorage.watchListScreenId = 'topLosers';
								const fcb = func.getFuncReload('topLosers');
								dataStorage.loadData = fcb;
								fcb && fcb();
								this.isFirstLoser = false;
							}
						})
						// this.reloadRegister[dataStorage.tabWatchList] && this.reloadRegister[dataStorage.tabWatchList]();
					}}
					renderTabBar={(...arg) => {
						return <ScrollableTabBar
							setAnimation={this.setAnimationCb}
							activeTab={1}
							activeTextColor='#FFF'
							renderTab={(name, page, isTabActive, onPressHandler, onLayoutHandler) => {
								if (dataStorage.platform === 'ios') {
									return (
										<TouchableOpacity
											test_id={'Tab' + page}
											key={page}
											onPress={() => onPressHandler(page)}
											onLayout={onLayoutHandler}
											style={{
												height: 30,
												alignItems: 'center',
												justifyContent: 'center',
												borderRightColor: config.background.buttonGroup,
												borderTopColor: config.background.buttonGroup,
												borderTopWidth: 1,
												borderBottomColor: config.background.buttonGroup,
												borderBottomWidth: 1,
												marginLeft: page === 0 ? 16 : 0,
												marginRight: page === 1 ? 16 : 0,
												borderLeftColor: config.background.buttonGroup,
												backgroundColor: isTabActive ? config.background.buttonGroup : config.background.buttonGroupActive,
												borderLeftWidth: page === 0 ? 1 : 0,
												borderRightWidth: 1,
												borderTopLeftRadius: page === 0 ? 4 : 0,
												borderBottomLeftRadius: page === 0 ? 4 : 0,
												borderTopRightRadius: page === 1 ? 4 : 0,
												borderBottomRightRadius: page === 1 ? 4 : 0,
												width: (width - 32) / 2
											}}>
											<Text testID={`WLTopPrice${name}`} style={{
												color: isTabActive ? config.background.buttonGroupActive : config.background.buttonGroup,
												fontFamily: 'HelveticaNeue',
												fontSize: CommonStyle.font13,
												fontWeight: '300',
												textAlign: 'center'
											}}>{name}</Text>
										</TouchableOpacity>);
								} else {
									return (
										<TouchableOpacity
											test_id={'Tab' + page}
											key={page}
											onPress={() => onPressHandler(page)}
											onLayout={onLayoutHandler}
											style={{
												height: 36,
												marginLeft: page === 0 ? 49 : 0,
												marginRight: page === 1 ? 49 : 0,
												width: '40%'
											}}>
											<View style={page === 0 ? {
												width: '100%',
												height: 0,
												borderTopWidth: 36,
												borderTopColor: isTabActive ? config.background.buttonGroup : config.background.buttonGroupActive,
												borderRightWidth: 8,
												borderRightColor: 'transparent',
												borderStyle: 'solid',
												alignItems: 'center',
												justifyContent: 'center'
											} : {
													width: '100%',
													height: 0,
													borderBottomWidth: 36,
													borderBottomColor: isTabActive ? config.background.buttonGroup : config.background.buttonGroupActive,
													borderLeftWidth: 8,
													borderLeftColor: 'transparent',
													borderStyle: 'solid',
													alignItems: 'center',
													justifyContent: 'center'
												}}>
												<Text style={{
													color: isTabActive ? config.background.buttonGroupActive : config.background.buttonGroup,
													fontFamily: 'HelveticaNeue',
													fontSize: CommonStyle.fontSizeS,
													textAlign: 'center',
													bottom: page === 0 ? 18 : null,
													top: page === 1 ? 18 : null
												}}>{name}</Text>
											</View>
										</TouchableOpacity>
									);
								}
							}}
							backgroundColor={config.background.buttonGroupActive} style={{
								height: this.state.heightTab,
								alignItems: 'center',
								marginTop: 8,
								justifyContent: 'center'
							}} tabsContainerStyle={{ height: dataStorage.platform === 'ios' ? 30 : 36 }} />
					}}>
					<View testID='GainersTab' tabLabel={I18n.t('Gainers', { locale: this.props.lang })} style={{ flex: 1, backgroundColor: '#FFF' }}>
						<MarketCaps type='topGainers' {...this.props} setAnimation={this.runAnimation}
							topType={getPriceSource('top_price_gainer')} />
					</View>
					<View testID='LosersTab' tabLabel={I18n.t('Losers', { locale: this.props.lang })} style={{ flex: 1, backgroundColor: '#FFF' }}>
						<MarketCaps type='topLosers' {...this.props} setAnimation={this.runAnimation}
							topType={getPriceSource('top_price_loser')} />
					</View>
				</Tabs>
			</View>
		);
	}
}

export default Movers;

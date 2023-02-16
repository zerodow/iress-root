import React, { PureComponent } from 'react';
import _ from 'lodash';
import {
	Text,
	View,
	TouchableOpacity,
	LayoutAnimation,
	UIManager
} from 'react-native';
import { connect } from 'react-redux';

import { func } from '../../storage';
import { iconsMap } from '../../utils/AppIcons';
import { openSignIn } from '../../lib/base/functionUtil';
import * as Util from '../../util';
import * as RoleUser from '../../roleUser';
import * as Controller from '../../memory/controller';
import * as InvertTranslate from '../../invert_translate';
import Enum from '../../enum';
import config from '../../config';
import HeaderPrice from './header_price';
import Announcement from './announcement';
import styles from '../trade/style/trade';
import ContentPrice from './content_price';
import I18n from '../../modules/language/';
import CommonStyle from '~/theme/theme_controller';
import PriceHistoricalChart from '../price_historical_chart.1/price_historical_chart';
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';
import TradeActions from './trade.reducer';
import { Loading } from './trade_component';

const CHART_TYPE = Enum.CHART_TYPE;

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;

if (UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

class CustomHeader extends PureComponent {
	state = {
		isLoading: true
	};
	componentDidMount() {
		setTimeout(() => {
			LayoutAnimation.easeInEaseOut();
			this.setState({ isLoading: false });
		}, 500);
	}
	render() {
		if (this.state.isLoading) {
			return (
				<View
					style={{
						width: '100%',
						height: 200
					}}
				>
					<Loading />
				</View>
			);
		} else return this.props.children;
	}
}

class PureCollapsibleComp extends PureComponent {
	onPress = this.onPress.bind(this);

	componentWillUpdate(nextProps) {
		if (this.props.isExpand !== nextProps.isExpand) {
			LayoutAnimation.easeInEaseOut();
		}
	}

	onPress() {
		if (this.isLoading) return;
		const {
			indexInList,
			setExpandIndex,
			setShowedInfo,
			childShowedInfo
		} = this.props;
		this.isLoading = true;
		setTimeout(() => (this.isLoading = false), 300);
		setExpandIndex(indexInList);
		this.preShowedInfo = childShowedInfo;
		setShowedInfo({
			startPoint: -1,
			endPoint: 0
		});

		setTimeout(() => {
			setShowedInfo(this.preShowedInfo);
		}, 500);
	}

	render() {
		const { renderContent, renderHeader, isExpand } = this.props;

		const header = () => (
			<TouchableOpacity onPress={this.onPress}>
				{renderHeader()}
			</TouchableOpacity>
		);

		if (isExpand) {
			return (
				<React.Fragment>
					{header()}
					<CustomHeader>{renderContent()}</CustomHeader>
				</React.Fragment>
			);
		}
		return header();
	}

	// indexInList
}

function mapStateToProps(state, { indexInList }) {
	if (indexInList === state.watchlist2.expandIndex) {
		return {
			isExpand: true,
			childShowedInfo: state.watchlist2.childShowedInfo
		};
	}
	return {
		isExpand: false,
		childShowedInfo: state.watchlist2.childShowedInfo
	};
}

const mapDispatchToProps = dispatch => ({
	setExpandIndex: (...p) => dispatch(TradeActions.setExpandIndex(...p)),
	setShowedInfo: (...p) => dispatch(TradeActions.setShowedInfo(...p))
});

const PureCollapsible = connect(
	mapStateToProps,
	mapDispatchToProps
)(PureCollapsibleComp);

export default class Price extends PureComponent {
	constructor(props) {
		super(props);
		this.renderHeader = this.renderHeader.bind(this);
		this.renderContent = this.renderContent.bind(this);
		this.showModalNew = this.showModalNew.bind(this);
	}
	componentDidMount() {
		this.priceBoardID = func.getCurrentPriceboardId();
	}

	showModalNew() {
		const symbol = this.props.data.symbol;

		this.props.navigator.push({
			screen: 'equix.SearchDetail',
			title: I18n.t('search'),
			backButtonTitle: ' ',
			animated: true,
			animationType: 'slide-horizontal',
			passProps: {
				isPushFromWatchlist: true,
				isBackground: false,
				symbol,
				login: Controller.getLoginObj()
			},
			navigatorButtons: {
				leftButtons: [
					{
						title: '',
						id: 'back_button',
						icon: Util.isIOS()
							? iconsMap['ios-arrow-back']
							: iconsMap['md-arrow-back']
					}
				]
			},
			navigatorStyle: CommonStyle.navigatorSpecial
		});
	}

	renderContentPrice() {
		return this.priceBoardID === Enum.WATCHLIST.TOP_ASX_INDEX ? (
			<React.Fragment />
		) : (
				<ContentPrice
					data={this.props.data}
					loadingInfo={this.props.loadingInfo}
					indexInList={this.props.indexInList}
					allowRenderInfo={this.props.allowRenderInfo}
					channelPlaceOrder={this.props.channelPlaceOrder}
				/>
			);
	}

	renderPriceChart() {
		const symbol = this.props.data.symbol;
		const channelLoading = this.props.loadingInfo.channelLoading;
		return (
			<PriceHistoricalChart
				symbol={symbol}
				showButtonWhatlist={true}
				chartType={CHART_TYPE.VALUE}
				style={styles.chartContainer}
				priceObject={this.props.data}
				filterType={PRICE_FILL_TYPE._1D}
				indexInList={this.props.indexInList}
				allowRenderInfo={this.props.allowRenderInfo}
				channelReload={channelLoading}
				listFilterType={InvertTranslate.getListInvertTranslate(
					Util.getValueObject(PRICE_FILL_TYPE)
				)}
			/>
		);
	}

	renderAnnouncement() {
		const symbol = this.props.data.symbol;
		const channelLoading = this.props.loadingInfo.channelLoading;

		return this.priceBoardID === Enum.WATCHLIST.TOP_ASX_INDEX ? (
			<React.Fragment />
		) : (
				<React.Fragment>
					<View style={{ width: '100%' }}>
						<TouchableOpacityOpt
							onPress={this.showModalNew}
							disabled={
								!RoleUser.checkRoleByKey(
									Enum.ROLE_DETAIL.PERFORM_MORE_BUTTON
								)
							}
							style={[styles.rowExpandNews, { width: '100%' }]}
							timeDelay={Enum.TIME_DELAY}
						>
							<Text
								testID={`more`}
								style={[
									CommonStyle.textMainOrigin,
									{
										color: RoleUser.checkRoleByKey(
											Enum.ROLE_DETAIL.PERFORM_MORE_BUTTON
										)
											? CommonStyle.fontBlue
											: CommonStyle.fontSilver
									}
								]}
							>
								{I18n.t('more')}
							</Text>
						</TouchableOpacityOpt>
					</View>
					{Controller.getLoginStatus() ? (
						RoleUser.checkRoleByKey(
							Enum.ROLE_DETAIL.VIEW_NEWS_OF_SYMBOL
						) ? (
								<Announcement
									symbol={symbol}
									setting={Controller.getSettingApp()}
									isConnected={this.isConnected}
									navigator={this.props.navigator}
									channelReload={channelLoading}
								/>
							) : (
								<View
									style={{
										height: 50,
										paddingHorizontal: 16,
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									{<Text style={CommonStyle.textNoData}>{I18n.t('noData')}</Text>}
								</View>
							)
					) : (
							<View
								style={{
									height: 40,
									justifyContent: 'center',
									alignItems: 'center',
									flexDirection: 'row'
								}}
							>
								<Text
									style={{
										opacity: 0.87,
										color: CommonStyle.fontColor
									}}
								>
									{I18n.t('newsPart1')}{' '}
								</Text>
								<Text
									style={{ color: CommonStyle.fontAzureRadiance }}
									onPress={openSignIn}
								>
									{I18n.t('newsPart2')}{' '}
								</Text>
								<Text
									style={{
										opacity: 0.87,
										color: CommonStyle.fontColor
									}}
								>
									{I18n.t('newsPart3')}
								</Text>
							</View>
						)}
				</React.Fragment>
			);
	}

	renderHeader() {
		return (
			<HeaderPrice
				data={this.props.data}
				loadingInfo={this.props.loadingInfo}
				isNewsToday={this.props.isNewsToday}
				indexInList={this.props.indexInList}
				allowRenderInfo={this.props.allowRenderInfo}
			/>
		);
	}

	renderContent() {
		return (
			<View style={{ width: '100%', marginTop: 2 }}>
				{this.renderContentPrice()}
				{this.renderPriceChart()}
				{this.renderAnnouncement()}
			</View>
		);
	}

	render() {
		return (
			<View style={{ backgroundColor: CommonStyle.backgroundColor }}>
				<PureCollapsible
					indexInList={this.props.indexInList}
					renderHeader={this.renderHeader}
					renderContent={this.renderContent}
				/>
			</View>
		);
	}
}

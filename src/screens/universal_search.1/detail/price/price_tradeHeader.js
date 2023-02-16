import React, { Component } from 'react';
import { Animated, View, Text } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import Flag from '~/component/flags/flag';
import * as Business from '~/business';
import Enum from '~/enum';
import Flashing from '~/component/flashing/flashing.2';
import HighLightText from '~/modules/_global/HighLightText';
import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import {
	getDisplayName,
	formatNumber,
	formatNumberNew2
} from '~/lib/base/functionUtil';
import { func } from '../../../../storage';
import AnnouncementIcon from '~/component/announcement_icon/announcement_icon';
import SVActions from '~/component/scrollCustom/scrollview.reducer';
import PriceActions from './price.reducer';

const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const CHILD_NAME = 'TradeOverview';
class OverView extends Component {
	constructor(props) {
		super(props);
		this.props.addSVChild(CHILD_NAME, () => this);
		this.props.getCompany();
	}

	shouldComponentUpdate({ isShouldRender }) {
		return isShouldRender || _.isUndefined(isShouldRender);
	}

	componentWillReceiveProps = nextProps => {
		if (this.props.symbol !== nextProps.symbol) nextProps.getCompany();
	};

	componentWillUnmount = () => {
		this.props.rmSVChild(CHILD_NAME);
	};

	getText(text) {
		const { language } = this.props;
		return I18n.t(text, { locale: language });
	}

	showChangePercent(isLoading, value) {
		if (isLoading || value === null || value === undefined) {
			return '--';
		} else {
			return `${formatNumberNew2(value, PRICE_DECIMAL.PERCENT)}%`;
		}
	}

	showValue(isLoading, value, isFormat = true) {
		if (isLoading || value === null || value === undefined) {
			return '--';
		} else {
			return isFormat
				? formatNumberNew2(value, PRICE_DECIMAL.PRICE)
				: value;
		}
	}

	renderHeader() {
		const { symbol, tradingHalt, isNewsToday } = this.props;
		const flagIcon = Business.getFlag(symbol);
		const section = func.getSymbolObj(symbol);
		const { display_name: displayName } = section;
		return (
			<View
				style={[
					{
						flexDirection: 'row',
						paddingVertical: 2,
						alignItems: 'center'
					}
				]}
			>
				<Text style={[CommonStyle.textMainRed, { fontSize: CommonStyle.font30 }]}>
					{tradingHalt ? '! ' : ''}
				</Text>
				<Text
					testID={`${symbol}HeaderWL`}
					style={[CommonStyle.textMain, { fontSize: CommonStyle.font30 }]}
				>
					{displayName}
				</Text>
				<View
					style={{
						marginLeft: 9,
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'row'
					}}
				>
					<Flag
						style={{ marginRight: 9 }}
						type={'flat'}
						code={flagIcon}
						size={18}
					/>
					<AnnouncementIcon
						isNewsToday={isNewsToday}
						symbol={symbol}
						containerStyle={{
							backgroundColor: isNewsToday
								? CommonStyle.newsActive
								: CommonStyle.newsInactive,
							height: 13,
							width: 14,
							borderRadius: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
						contentStyle={{
							fontSize: CommonStyle.fontSizeXS - 2,
							color: 'white',
							fontFamily: CommonStyle.fontFamily
						}}
					/>
				</View>
			</View>
		);
	}

	renderCompany() {
		const { symbol } = this.props;
		const section = func.getSymbolObj(symbol);
		const securityName =
			section.company_name || section.company || section.security_name;
		return (
			<View style={{ flexDirection: 'row' }}>
				<Text
					testID={`${symbol}NameWL`}
					style={[CommonStyle.textSub, { fontSize: CommonStyle.fontSizeXS }]}
				>
					{securityName || ''}
				</Text>
			</View>
		);
	}

	renderChangeQuantityLastTrade() {
		return (
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<View style={{ width: '50%', marginTop: 16 }}>
					<Text
						style={[CommonStyle.textSub, { fontSize: CommonStyle.fontSizeS }]}
					>{`${this.getText('quantity')} @ ${this.getText(
						'lastTrade'
					)}`}</Text>
				</View>
				<View style={{ width: '50%', marginTop: 16 }}>
					<Text
						style={[
							CommonStyle.textSub,
							{ fontSize: CommonStyle.fontSizeS, textAlign: 'right' }
						]}
					>{`${this.getText('changePercent')}`}</Text>
				</View>
			</View>
		);
	}

	renderChangeQuantityLastTradeValue() {
		const { symbol, isLoading, priceObject = {} } = this.props;
		const {
			trade_price: tradePrice = null,
			trade_size: tradeSize = null,
			change_point: changePoint = null,
			change_percent: changePercent = null
		} = priceObject;
		return (
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<View style={{ width: '50%', marginTop: 8 }}>
					<View style={{ flexDirection: 'row' }}>
						<Text
							testID={`${symbol}SizeWL`}
							numberOfLines={2}
							style={[
								CommonStyle.textSub,
								{ textAlign: 'left', fontWeight: 'bold' }
							]}
						>{`${this.showValue(
							isLoading,
							formatNumber(tradeSize),
							false
						)} @ `}</Text>
						<Flashing
							isLoading={this.props.isLoading}
							value={tradePrice}
							typeFormRealtime={
								TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL
							}
						/>
					</View>
				</View>
				<View style={{ width: '50%', marginTop: 8 }}>
					<HighLightText
						style={[
							CommonStyle.textSubNoColor,
							{ textAlign: 'right', fontWeight: 'bold' }
						]}
						addSymbol
						base={formatNumberNew2(
							changePoint,
							PRICE_DECIMAL.PRICE
						)}
						testID={`${symbol}changePoiWL`}
						value={`${this.showValue(
							isLoading,
							changePoint
						)} (${this.showChangePercent(
							isLoading,
							changePercent
						)})`}
					/>
				</View>
			</View>
		);
	}

	render() {
		return (
			<Animated.View
				style={{
					paddingHorizontal: CommonStyle.paddingSize,
					paddingVertical: 6,
					backgroundColor: CommonStyle.backgroundColor,
					width: '100%'
				}}
			>
				{this.renderHeader()}
				{this.renderCompany()}
				{this.renderChangeQuantityLastTrade()}
				{this.renderChangeQuantityLastTradeValue()}
			</Animated.View>
		);
	}
}

const mapStateToProps = state => ({
	isShouldRender: state.scrollView.childStatus[CHILD_NAME],
	priceObject: state.price.priceObject,
	tradingHalt: state.price.tradingHalt,
	company: state.price.company,
	symbol: state.searchDetail.symbol,
	isLoading: state.price.isLoading,
	isNewsToday: state.price.isNewsToday,
	language: state.setting.lang
});

const mapDispatchToProps = dispatch => ({
	addSVChild: (...p) => dispatch(SVActions.SvMeasureAddChildToStack(...p)),
	rmSVChild: (...p) => dispatch(SVActions.SvMeasureRemoveChildToStack(...p)),
	getCompany: (...p) => dispatch(PriceActions.getCompany(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(OverView);

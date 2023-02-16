import React, { PureComponent } from 'react';
import { Text, View, TouchableOpacity, Animated } from 'react-native';
import _ from 'lodash';
import Uuid from 'react-native-uuid';
import * as Emitter from '@lib/vietnam-emitter';

import HighLightText from '../../modules/_global/HighLightText';
import * as Business from '../../business';
import * as Controller from '../../memory/controller';
import * as loginActions from '../login/login.actions';
import * as util from '../../util';
import Enum from '../../enum';
import Flag from '../../component/flags/flag';
import Flashing from '../../component/flashing/flashing.2';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { dataStorage } from '../../storage';
import { getSymbolInfo } from '../../app.actions';
import * as Channel from '../../streaming/channel';
import Ionicons from 'react-native-vector-icons/Ionicons'
import {
	formatNumberNew2,
	formatNumberNew2ClearZero
} from '../../lib/base/functionUtil';
const styles = {}
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

loginActions['getSymbolInfo'] = getSymbolInfo;

export class Header extends PureComponent {
	constructor(props) {
		super(props);
		// const { symbol = '' } = this.props.data || {};
		// const { trading_halt: tradingHalt } =
		// 	dataStorage.symbolEquity[symbol] || {};
		// this.isTradingHalt = tradingHalt === 1;
		this.checkPosition(this.props.data);
		this.iconRotate = new Animated.Value(1)
		// this.id = Uuid.v4();
		// this.isPosition =
		// 	dataStorage.accountId &&
		// 	!isEmptyDataPort &&
		// 	Controller.getLoginStatus();
	}

	// componentDidMount = () => {
	// 	const { symbol = '' } = this.props.data || {};
	// 	const channelName = Channel.getChannelChangeTradingHalt(symbol);
	// 	Emitter.addListener(channelName, this.id, data => {
	// 		this.isTradingHalt = data === 1;
	// 	});
	// };
	runAnimation(isCollapsed) {
		if (isCollapsed) {
			Animated.timing(this.iconRotate, {
				toValue: 1,
				duration: 200
			}).start()
		} else {
			Animated.timing(this.iconRotate, {
				toValue: 0,
				duration: 200
			}).start()
		}
	}
	componentWillReceiveProps = nextProps => {
		this.checkPosition(nextProps.data);
		if (nextProps.isCollapsed !== this.props.isCollapsed) {
			this.runAnimation(nextProps.isCollapsed)
		}
		// this.isTradingHalt = nextProps.isTradingHalt;
	};

	checkPosition(data) {
		const { symbol = '', isEmptyDataPort } = data || {};
		this.isPosition =
			dataStorage.accountId &&
			!isEmptyDataPort &&
			Controller.getLoginStatus();
	}

	getDisplayName() {
		const { symbol = '', display_name: displayName } =
			this.props.data || {};

		if (displayName) {
			return displayName;
		}

		const { display_name: displayNameInStorage } =
			(dataStorage.symbolEquity && dataStorage.symbolEquity[symbol]) ||
			{};

		if (displayNameInStorage) {
			return displayNameInStorage;
		}

		return symbol;
	}

	getCompanyName() {
		const {
			company_name: companyName,
			company,
			security_name: securityName,
			symbol = ''
		} = this.props.data;
		if (companyName) return companyName;
		if (company) return company;
		if (securityName) return securityName;

		const {
			company_name: companyNameFromDic,
			company: companyFromDic,
			security_name: securityNameFromDic
		} =
			(dataStorage.symbolEquity && dataStorage.symbolEquity[symbol]) ||
			{};
		if (companyNameFromDic) return companyNameFromDic;
		if (companyFromDic) return companyFromDic;
		if (securityNameFromDic) return securityNameFromDic;

		return '';
	}

	renderDisplayName() {
		const { symbol = '' } = this.props.data || {};
		const { isCollapsed } = this.props
		const displayName = this.getDisplayName();
		const flagIcon = Business.getFlag(symbol);

		let shortDisplayname = displayName;
		if (_.size(displayName) > 11) {
			shortDisplayname = Business.convertDisplayName(displayName);
		}

		return (
			<React.Fragment>
				<AnimatedIcon
					style={{
						width: '5%',
						textAlign: 'center',
						alignSelf: 'baseline',
						transform: [{
							rotate: this.iconRotate.interpolate({
								inputRange: [0, 1],
								outputRange: ['0deg', '90deg']
							})
						}]
					}}
					name='ios-arrow-forward'
					size={18}
					color={CommonStyle.fontColor} />
				<Text style={[CommonStyle.textMainRed, { width: this.props.tradingHalt ? '10%' : '5%' }]}>{this.props.tradingHalt ? '!' : ''}</Text>
				<Text numberOfLines={2} testID={`openPriceCode-${symbol}`} style={[CommonStyle.textMain2, styles.col7]}>
					{shortDisplayname}
				</Text>
				<View style={[{ alignItems: 'flex-end' }, { width: '10%' }]}>
					<Flag
						type={'flat'}
						code={flagIcon}
						size={18}
						style={{ paddingHorizontal: 8 }}
					/>
				</View>
			</React.Fragment>
		);
	}

	renderVolume() {
		const { volume, symbol = '' } = this.props.data;

		const base = this.isPosition ? formatNumberNew2ClearZero(volume) : 0;
		let value = 0;
		if (this.isPosition && volume) {
			value = formatNumberNew2ClearZero(volume);
		}
		return (
			<HighLightText
				testID={`positionVolume-${symbol}`}
				style={[
					CommonStyle.textMainNoColor,
					{ textAlign: 'right', paddingRight: 4 }
				]}
				base={base}
				value={value}
			/>
		);
	}

	renderValueConvert() {
		const { isLoading } = this.props;
		const { value_convert: valueConvert, symbol = '' } = this.props.data;
		let value = '';
		if (!isLoading && valueConvert) {
			value = formatNumberNew2(valueConvert, PRICE_DECIMAL.VALUE);
		}

		if (isLoading || (!isLoading && !valueConvert && this.isPosition)) {
			value = '--';
		}

		return (
			<Text
				testID={`positionValueAUD-${symbol}`}
				style={[
					styles.col4,
					CommonStyle.textMain2,
					{ textAlign: 'right' }
				]}
			>
				{this.isPosition && value}
			</Text>
		);
	}

	renderAveragePrice() {
		const { average_price: averagePrice, symbol = '' } = this.props.data;
		let value = '';
		if (this.isPosition && _.isNull(averagePrice)) {
			value = '--';
		}
		if (this.isPosition && !_.isNull(averagePrice)) {
			value = formatNumberNew2(averagePrice, PRICE_DECIMAL.PRICE);
		}
		return (
			<Text
				testID={`positionAvgPrice-${symbol}`}
				style={[
					styles.col3,
					CommonStyle.textSub,
					{ textAlign: 'right' }
				]}
			>
				{value}
			</Text>
		);
	}

	renderValue() {
		const { symbol = '', value } = this.props.data;
		const accountCurrency = dataStorage.currentAccount && dataStorage.currentAccount.currency;
		const symbolCurrency = this.props.data.currency;

		if (util.checkCurrency(symbolCurrency, accountCurrency)) {
			return (
				<Text
					style={[
						styles.col4,
						CommonStyle.textSub,
						{ textAlign: 'right' }
					]}
				/>
			);
		}

		const { isLoading } = this.props;

		let valueDisplay = '';
		if (!isLoading && value) {
			valueDisplay = formatNumberNew2(value, PRICE_DECIMAL.VALUE);
		}

		if (isLoading || (!isLoading && !value && this.isPosition)) {
			valueDisplay = '--';
		}

		return (
			<Text
				testID={`positionValue-${symbol}`}
				style={[
					styles.col4,
					CommonStyle.textSub,
					{ textAlign: 'right' }
				]}
			>
				{valueDisplay}
			</Text>
		);
	}
	isPositionClose = (data) => {
		return data && data.volume === 0
	}
	handleExpanded = () => {
		this.props.onPress()
	}
	showPositionDetail = () => {
		this.props.handleShowPortfolioDetail && this.props.handleShowPortfolioDetail({ data: this.props.data })
	}
	render() {
		const { symbol = '', market_price: marketPrice } = this.props.data;
		const companyName = this.getCompanyName();
		const isNeedNextLine = this.isPosition && marketPrice > 999;
		return (
			<TouchableOpacity onPress={this.props.onPress}>
				<View
					testID={`listUserPosition-${symbol}`}
					style={CommonStyle.headerBorder}
				>
					<View
						style={[
							styles.headerContainer,
							isNeedNextLine ? { height: 40 } : {}
						]}
					>
						<TouchableOpacity style={[styles.col50, styles.headerContainer]} onPress={this.handleExpanded}>
							{this.renderDisplayName()}
						</TouchableOpacity>
						<TouchableOpacity onPress={this.showPositionDetail} style={[styles.col50, styles.headerContainer]}>
							<View style={[styles.col5]}>
								{this.renderVolume()}
							</View>
						</TouchableOpacity>
						{/* {this.renderValueConvert()} */}
					</View>
					<View style={styles.headerContainer}>
						<View style={[styles.col50]}>
							<TouchableOpacity onPress={this.handleExpanded}>
								<Text style={[CommonStyle.textSub]}>
									{companyName}
								</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity onPress={this.showPositionDetail} style={[styles.col50, styles.headerContainer]}>
							<View style={styles.col50} />
						</TouchableOpacity>

					</View>
				</View>
			</TouchableOpacity >
		);
	}
}

Header.defaultProps = {
	onPress: () => null
};

function mapStateToProps(state) {
	return {
		tradingHalt: state.price.tradingHalt,
		data: state.searchPortfolio,
		isLoading: state.price.isLoading
	};
}

function mapDispatchToProps(dispatch) {
	return {
		loginActions: bindActionCreators(loginActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Header);

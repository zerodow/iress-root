import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { connect } from 'react-redux';

import * as Controller from '../../memory/controller';
import * as RoleUser from '../../roleUser';
import * as util from '../../util';
import Enum from '../../enum';
import I18n from '../../modules/language';
import config from '../../config';
import { formatNumberNew2 } from '../../lib/base/functionUtil';
import { func, dataStorage } from '../../storage';
import HighLightText from '../../modules/_global/HighLightText';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import NewOpenPriceButton from './new_open_price.button';

const styles = {}
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const Button = props => {
	const { isConnected, isLoading, disabled, color, textContent } = props;
	const curFlag = !isConnected || !func.isAccountActive();
	return (
		<TouchableOpacity
			disabled={disabled || isLoading || curFlag}
			onPress={props.onPress}
			style={[
				styles.buttonExpand,
				{
					backgroundColor: curFlag ? '#0000001e' : color
				}
			]}
		>
			<Text
				style={[
					CommonStyle.textButtonColor,
					{
						color: curFlag ? 'black' : 'white'
					}
				]}
			>
				{textContent}
			</Text>
		</TouchableOpacity>
	);
};
Button.defaultProps = {
	onPress: () => null
};

const ChangeComp = props => {
	const {
		label,
		value,
		center,
		isHighLight,
		isShowValue,
		isLoading
		// isPosition - allway is true
	} = props;
	let flexLeft = 5;
	let flexRight = 5;
	if (!center) {
		flexLeft = 6;
		flexRight = 4;
	}

	let content = <View />;

	if (isShowValue && isLoading) {
		content = (
			<Text style={[CommonStyle.textMainNoColor, { textAlign: 'right' }]}>
				{'--'}
			</Text>
		);
	}

	if (isShowValue && !isLoading) {
		content = (
			<HighLightText
				style={[
					CommonStyle.textMainNoColor,
					{
						textAlign: 'right',
						fontSize: CommonStyle.fontSizeS
					}
				]}
				base={isHighLight ? value : 0}
				value={!value ? 0 : value}
			/>
		);
	}

	return (
		<View style={[{ flexDirection: 'row' }]}>
			<View style={{ flex: flexLeft }}>
				<Text style={[CommonStyle.textSub, { textAlign: 'left' }]}>
					{label}
				</Text>
			</View>
			<View style={{ flex: flexRight }}>{content}</View>
		</View>
	);
};

export class PriceContent extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isForgotPinModalVisible: false
		};
	}

	render() {
		const data = this.props.data || {}
		const {
			isEmptyDataPort,
			isLoading,
			symbol = '',
			today_upnl: todayChangeVal,
			today_change_percent: todayChangePercent,
			upnl: profitVal,
			profit_percent: profitPercent,
			book_value: bookValue,
			book_value_convert: bookValueConvert
		} = data;
		const accountCurrency = dataStorage.currentAccount && dataStorage.currentAccount.currency;
		const symbolCurrency = data.currency;
		const isPosition =
			dataStorage.accountId &&
			!isEmptyDataPort &&
			Controller.getLoginStatus()

		if (!isPosition) return <View />;

		return (
			<React.Fragment>
				<View
					style={{
						width: '100%',
						marginTop: 8,
						marginBottom: 16,
						paddingLeft: 16,
						paddingRight: 16
					}}
				>
					<View style={{ flexDirection: 'row' }}>
						<View style={[{ paddingRight: 10, width: '50%' }]}>
							<ChangeComp
								label={`${I18n.t('bookVal')} (${accountCurrency})`}
								value={formatNumberNew2(
									bookValueConvert,
									PRICE_DECIMAL.VALUE_AUD
								)}
								isShowValue
								isLoading={isLoading}
							/>
						</View>

						<View style={[{ paddingLeft: 10, width: '50%' }]}>
							<ChangeComp
								label={I18n.t('bookVal')}
								value={formatNumberNew2(
									bookValue,
									PRICE_DECIMAL.VALUE
								)}
								center
								// isHighLight
								isShowValue={!util.checkCurrency(symbolCurrency, accountCurrency)}
								isLoading={isLoading}
							/>
						</View>
					</View>

					<View style={{ flexDirection: 'row', marginTop: 8 }}>
						<View style={[{ paddingRight: 10, width: '50%' }]}>
							<ChangeComp
								label={I18n.t('todayChg')}
								value={formatNumberNew2(
									todayChangeVal,
									PRICE_DECIMAL.PRICE
								)}
								center
								isHighLight
								isShowValue
								isLoading={isLoading}
							/>
						</View>

						<View style={[{ paddingLeft: 10, width: '50%' }]}>
							<ChangeComp
								label={`%${I18n.t('todayChg')}`}
								value={`${formatNumberNew2(
									todayChangePercent * 100,
									PRICE_DECIMAL.PERCENT
								)}%`}
								isHighLight
								isShowValue
								isLoading={isLoading}
							/>
						</View>
					</View>

					<View style={{ flexDirection: 'row', marginTop: 8 }}>
						<View style={[{ paddingRight: 10, width: '50%' }]}>
							<ChangeComp
								label={I18n.t('gainLoss')}
								value={formatNumberNew2(
									profitVal,
									PRICE_DECIMAL.VALUE
								)}
								center
								isHighLight
								isShowValue
								isLoading={isLoading}
							/>
						</View>
						<View style={[{ paddingLeft: 10, width: '50%' }]}>
							<ChangeComp
								label={`%${I18n.t('gainLoss')}`}
								value={`${formatNumberNew2(
									profitPercent * 100,
									PRICE_DECIMAL.PERCENT
								)}%`}
								isHighLight
								isShowValue
								isLoading={isLoading}
							/>
						</View>
					</View>
				</View>
				<NewOpenPriceButton navigator={this.props.navigator} />
				{/* {this.renderButton()} */}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state, ownProps) => {
	return {
		data: state.searchPortfolio || {},
		isConnected: state.app.isConnected
	};
};

const mapDispatchToProps = {};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(PriceContent);

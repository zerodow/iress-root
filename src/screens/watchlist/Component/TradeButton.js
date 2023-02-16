import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import _ from 'lodash';

import { func, dataStorage } from '~/storage';
import config from '~/config';
import Enum from '~/enum';
import * as Controller from '~/memory/controller';
import * as RoleUser from '~/roleUser';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import { connect } from 'react-redux';
import { getSymbolClass } from '~/business'

const { SYMBOL_CLASS_API_UPPER } = Enum
class ButtonExpand extends PureComponent {
	constructor(props) {
		super(props);
		this.isPress = false;
		this.nav = this.props.navigator;
		this.onPress = this.onPress.bind(this);
	}

	setTimeoutClickable() {
		this.isPress = true;
		setTimeout(() => {
			this.isPress = false;
		}, 1500);
	}

	onPress() {
		if (this.isPress) return;
		this.setTimeoutClickable();
		this.props.onPress && this.props.onPress(this.props.isBuy || false);
	}

	render() {
		const { isBuy, isLoading, symbol } = this.props;
		const symbolClass = getSymbolClass({ symbol })
		const isLogin = Controller.getLoginStatus();
		const isConnected = this.props.isConnected;
		const { email } = Controller.getUserInfo() || {};

		const hasRole = RoleUser.checkRoleByKey(
			Enum.ROLE_DETAIL.PERFORM_BUY_SELL_UNIVERSALSEARCH_BUTTON
		);
		const hasBuySell = RoleUser.checkRoleByKey(
			Enum.ROLE_DETAIL.PERFORM_BUY_SELL_BUTTON
		);

		const { isNotHaveAccount, loginUserType } = dataStorage;

		let disabled =
			(symbolClass + '').toUpperCase() === SYMBOL_CLASS_API_UPPER.INDEX ||
			isLoading ||
			!func.isAccountActive() ||
			isNotHaveAccount ||
			!isLogin ||
			!hasRole ||
			!hasBuySell ||
			email === config.username ||
			!isConnected ||
			loginUserType === 'REVIEW';
		disabled = false
		const disableColor = '#808080';
		const buyColor = CommonStyle.fontGreen1;
		const sellColor = CommonStyle.fontRed1;

		let colorButton = sellColor;
		if (isBuy) colorButton = buyColor;
		if (disabled) colorButton = disableColor;

		const buttonTitle = isBuy ? I18n.t('buy') : I18n.t('sell');
		return (
			<TouchableOpacity
				disabled={disabled}
				onPress={this.onPress}
				style={{ flex: 1 }}
			>
				<View
					style={{
						backgroundColor: colorButton,
						paddingVertical: 6,
						borderRadius: 100,
						minHeight: 28
					}}
				>
					<Text
						style={{
							fontFamily: CommonStyle.fontPoppinsRegular,
							fontSize: CommonStyle.fontSizeXS,
							textAlign: 'center',
							color: disabled
								? CommonStyle.newsTextColor
								: CommonStyle.fontDark
						}}
					>
						{buttonTitle}
					</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

function mapStateToProps(state) {
	return {
		isConnected: state.app.isConnected
	};
}

export default connect(mapStateToProps)(ButtonExpand);

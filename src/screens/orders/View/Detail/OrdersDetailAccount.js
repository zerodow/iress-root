import React from 'react';
import { View, Text } from 'react-native';
import { useShadow } from '~/component/shadow/SvgShadow';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import {
	getPorfolioTypeByCode,
	getPortfolioName
} from '~s/portfolio/Model/PortfolioAccountModel';
import { shallowEqual, useSelector } from 'react-redux';

const AccountId = ({ accountId }) => {
	return (
		<View
			style={{
				flexDirection: 'row'
			}}
		>
			<Text
				style={{
					fontSize: CommonStyle.font11,
					fontFamily: CommonStyle.fontPoppinsBold,
					color: CommonStyle.fontColor,
					opacity: 0.5
				}}
			>
				{`${I18n.t('userInfo')}  `}
			</Text>
			<Text
				style={{
					fontSize: CommonStyle.font11,
					fontFamily: CommonStyle.fontPoppinsBold,
					color: CommonStyle.fontColor,
					opacity: 1
				}}
			>
				{accountId}
			</Text>
		</View>
	);
};
const AccountType = ({ accountType }) => {
	const title = I18n.t('userType');
	if (!accountType) return null;
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			<Text
				numberOfLines={1}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS,
					color: CommonStyle.fontNearLight6,
					marginRight: 6
				}}
			>
				{title}
			</Text>
			<Text
				numberOfLines={1}
				style={{
					textAlign: 'right',
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontColor
				}}
			>
				{accountType.charAt(0).toUpperCase() + accountType.slice(1)}
			</Text>
		</View>
	);
};
const AccountName = ({ accountName }) => {
	return (
		<Text
			style={{
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font11,
				color: CommonStyle.fontColor
			}}
		>
			{accountName}
		</Text>
	);
};

const OrdersDetailAccount = ({ accountId }) => {
	const accActive = useSelector(
		(state) => state.portfolio.accActive,
		shallowEqual
	);
	const accountType = getPorfolioTypeByCode(accActive);
	const accountName = getPortfolioName(accountId);
	return (
		<View
			style={{
				backgroundColor: CommonStyle.color.dark,
				paddingTop: 8,
				paddingBottom: 10,
				width: '100%',
				flexDirection: 'row',
				paddingHorizontal: 16
			}}
		>
			<View
				style={{
					flex: 1,
					backgroundColor: CommonStyle.color.dark,
					padding: 8,
					borderWidth: 1,
					borderColor: CommonStyle.color.dusk,
					borderRadius: 8
				}}
			>
				<AccountId accountId={accountId} />
				<AccountType accountType={accountType} />
				<AccountName accountName={accountName} />
			</View>
		</View>
	);
};

export default OrdersDetailAccount;

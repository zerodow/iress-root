import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import PropTypes from 'prop-types'
import Animated from 'react-native-reanimated'
import Enum from '~/enum'
import {
	formatNumberNew2
} from '~/lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import ValueFormat from '~/component/ValueFormat'

import * as Business from '~/business';
import I18n from '~/modules/language/';
import { getPortfolioTotal, getPortfolioBalance } from '~s/portfolio/Controller/PortfolioTotalController'
import { getAccActive, getDicPortfolioType, getListPortfolioType, getPorfolioTypeByCode } from '~/screens/portfolio/Model/PortfolioAccountModel.js'
const { TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE }, SYMBOL_CLASS, CURRENCY, PRICE_DECIMAL, PORTFOLIO_TYPE } = Enum
const { Value } = Animated

const IconSearchAccount = () => {
	return (
		<MaterialCommunityIcons name='account-search' size={22} color={'white'} />
	)
}
const AccountName = ({ accountName }) => {
	return <Text style={{
		fontSize: CommonStyle.fontSizeXS,
		fontFamily: CommonStyle.fontPoppinsRegular,
		color: CommonStyle.fontColor
	}}>{accountName}</Text>
}
const AccountId = ({ accountId, isSelected, hideCheckBox = false, disabled }) => {
	return <View style={{ flexDirection: 'row' }}>
		<Text style={{
			fontFamily: CommonStyle.fontPoppinsBold,
			fontSize: CommonStyle.fontSizeXS,
			color: CommonStyle.fontNearLight6
		}}>{'Account'}</Text>
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
			<Text style={{
				fontFamily: CommonStyle.fontPoppinsBold,
				fontSize: CommonStyle.fontSizeXS,
				color: CommonStyle.fontColor,
				paddingLeft: 8
			}}>{accountId}</Text>
			{isSelected && !hideCheckBox && <IconSelected disabled={disabled} />}
		</View>
	</View>
}
const IconSelected = ({ style, disabled }) => (
	<View style={style}>
		<CommonStyle.icons.checkMarkCircle
			size={13} color={!disabled ? CommonStyle.color.modify : CommonStyle.color.dusk}
		/>
	</View>
)

const AvailableBalance = ({ cashAvailable, isLoading }) => {
	const currency = useMemo(() => '$')
	const title = useMemo(() => {
		const accActive = getAccActive()
		const typeAccount = getPorfolioTypeByCode(accActive)
		if (typeAccount === PORTFOLIO_TYPE.CFD) {
			return 'Free Equity Balance '
		}
		return 'Available Balance'
	}, [])
	return (
		<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

			<Text numberOfLines={1} style={{
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.fontSizeXS,
				color: CommonStyle.fontNearLight6,
				flex: 1
			}}>{title}</Text>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }} >
				<ValueFormat
					forceColor={CommonStyle.color.buy}
					ignorePositiveNumber={true}
					isLoading={isLoading}
					value={cashAvailable}
					decimal={PRICE_DECIMAL.VALUE}
					textStyle={{ fontFamily: CommonStyle.fontPoppinsRegular }}
				/>
			</View>

		</View >
	)
}
export const AccountCFD = (props) => {
	const { initialMargin, lotSize, cfdShell, isLoading, initialMarginPercent } = props
	return (
		<View>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
				<Text style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS1,
					color: CommonStyle.fontNearLight6
				}}>{I18n.t('initialMarginPercent')}</Text>
				<TextLoading isLoading={isLoading} style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS1,
					color: CommonStyle.fontColor,
					marginBottom: 1
				}}> {formatNumberNew2(initialMarginPercent, PRICE_DECIMAL.VALUE) || '--'}</TextLoading>

			</View>
			<View style={{ width: '100%', height: 1 }}></View>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
				<Text style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS1,
					color: CommonStyle.fontNearLight6
				}}>{I18n.t('marginLotSize')}</Text>
				<TextLoading isLoading={isLoading} style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS1,
					color: CommonStyle.fontColor,
					marginBottom: 1
				}}> {formatNumberNew2(lotSize, PRICE_DECIMAL.VALUE) || '--'}</TextLoading>

			</View>
			<View style={{ width: '100%', height: 1 }}></View>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
				<Text style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS1,
					color: CommonStyle.fontNearLight6
				}}>{I18n.t('shotSell')}</Text>
				<TextLoading isLoading={isLoading} style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS1,
					color: CommonStyle.fontColor,
					marginBottom: 1
				}}> {cfdShell ? 'Yes' : 'No'}</TextLoading>
			</View>
		</View>
	)
}
const BoxAccount = ({
	accountId,
	accountName,
	currentAccount,
	isSelected,
	setCurrentAccount,
	type,
	hideCheckBox = false,
	style,
	el, isLoading,
	symbol,
	exchange,
	disabled,
	onDataBalance = () => { }
}) => {
	const [portfolioTotal, setPortfolioTotal] = useState({})
	const dic = useRef({ isLoading: true })
	const accActive = getAccActive()
	const typeAccount = getPorfolioTypeByCode(accActive)
	useEffect(() => {
		getPortfolioBalance(accountId, symbol, exchange).then(res => {
			dic.current.isLoading = false
			setPortfolioTotal(res || {})
			onDataBalance && onDataBalance(res, typeAccount)
		}).catch(err => {
			dic.current.isLoading = false
			console.info(err)
		})
	}, [])
	const {
		available_balance: availableBalance,
		total_initial_margin: initialMargin,
		lot_size: lotSize = '--',
		short_sellable: cfdShell = '--',
		free_equity: freeEquity,
		initial_margin_used_percent: initialMarginPercent
	} = portfolioTotal
	if (typeAccount === PORTFOLIO_TYPE.CFD) {
		return (
			<View
				style={[{
					width: '100%'
				}, style]}
			>
				<View style={[{
					borderWidth: 1,
					borderRadius: 8,
					padding: 8,
					borderColor: CommonStyle.color.dusk
				}]}>
					<AccountId isLoading={dic.current.isLoading} hideCheckBox={hideCheckBox} accountId={accountId} />
					<AccountName isLoading={dic.current.isLoading} accountName={accountName} />
					<AvailableBalance isLoading={dic.current.isLoading} cashAvailable={freeEquity} />
					<AccountCFD
						initialMarginPercent={initialMarginPercent}
						isLoading={dic.current.isLoading}
						initialMargin={initialMargin || '--'}
						lotSize={lotSize}
						cfdShell={cfdShell}></AccountCFD>
				</View>
			</View>
		)
	}
	return (
		<View style={[{
			borderWidth: 1,
			borderRadius: 8,
			padding: 8,
			borderColor: isSelected ? CommonStyle.borderColorActive : CommonStyle.color.dusk,
			width: '100%',
			marginRight: 8,
			flex: 1
		}, style]}>
			<AccountId disabled={disabled} isLoading={dic.current.isLoading} hideCheckBox={hideCheckBox} isSelected={isSelected} accountId={accountId} />
			<AccountName isLoading={dic.current.isLoading} accountName={accountName} />
			<AvailableBalance isLoading={dic.current.isLoading} cashAvailable={availableBalance} />
		</View>
	)
};
BoxAccount.propTypes = {
	type: PropTypes.oneOf(['Single', 'Multiple'])
}
export default BoxAccount;

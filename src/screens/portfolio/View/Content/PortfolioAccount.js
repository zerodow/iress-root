import React, { useState, useCallback } from 'react'
import {
	View, Text, ScrollView
} from 'react-native'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import CommonStyle from '~/theme/theme_controller'
import SvgIcon from '~s/watchlist/Component/Icon2'
import I18n from '~/modules/language/'
import { getAccActive, getDicPortfolioType, getListPortfolioType, getPorfolioTypeByCode } from '~s/portfolio/Model/PortfolioAccountModel'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useShadow } from '~/component/shadow/SvgShadow';
import { useSelector, shallowEqual } from 'react-redux'

const SelectedIcon = ({ active }) => {
	const iconColor = 'none'
	return active ? <CommonStyle.icons.tickRounded
		color={iconColor}
		size={13}
		style={{ marginLeft: 16 }}
	/> : null
}

const AccountId = ({ item, index }) => {
	const { portfolio_id: accountId } = item
	return <View style={{
		flexDirection: 'row'
	}}>
		<Text style={{
			fontSize: CommonStyle.font11,
			fontFamily: CommonStyle.fontPoppinsBold,
			color: CommonStyle.fontColor,
			opacity: 0.5
		}}>
			{`${I18n.t('userInfo')}  `}
		</Text>
		<Text style={{
			fontSize: CommonStyle.font11,
			fontFamily: CommonStyle.fontPoppinsBold,
			color: CommonStyle.fontColor,
			opacity: 1
		}}>{accountId}</Text>
	</View>
}

const AccountName = ({ item, index }) => {
	const { portfolio_name: accountName } = item
	return <Text style={{
		fontFamily: CommonStyle.fontPoppinsRegular,
		fontSize: CommonStyle.font11,
		color: CommonStyle.fontColor
	}}>
		{accountName}
	</Text>
}
const AccountType = ({ item }) => {
	const { portfolio_type: accountType } = item
	const title = I18n.t('userType')
	if (!accountType) return null
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			<Text numberOfLines={1} style={{
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.fontSizeXS,
				color: CommonStyle.fontNearLight6,
				marginRight: 6
			}}>
				{title}
			</Text>
			<Text numberOfLines={1} style={{
				textAlign: 'right',
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.font11,
				color: CommonStyle.fontColor
			}}>
				{accountType.charAt(0).toUpperCase() + accountType.slice(1)}
			</Text>
		</View>
	)
}
const Item = ({ item, index }) => {
	const active = true
	return <View
		style={{
			flex: 1,
			backgroundColor: CommonStyle.color.dark,
			padding: 8,
			borderWidth: 1,
			borderColor: active
				? CommonStyle.color.modify
				: CommonStyle.color.dark,
			borderRadius: 8,
			flexDirection: 'row',
			justifyContent: 'space-between'
		}}>
		<View style={{ flex: 1 }}>
			<AccountId
				item={item}
				index={index} />
			<AccountType item={item} />
			<AccountName
				item={item}
				index={index} />
		</View>
		<SelectedIcon active={active} />
	</View>
}

const PortfolioAccount = React.memo(({ showSearchAccount }) => {
	const [Shadow, onLayout] = useShadow()
	const accActive = useSelector(state => state.portfolio.accActive)
	const defaultAccount = getDicPortfolioType(accActive)
	const listAccount = getListPortfolioType()
	const disabled = !listAccount || Object.keys(listAccount).length < 2 // defaultAccount={portflio_id,portfolio_name}
	return <View style={{ paddingBottom: 5, backgroundColor: CommonStyle.color.dark }}>
		<View>
			<Shadow />
			<TouchableOpacityOpt
				disabled={disabled}
				onPress={showSearchAccount}
				onLayout={onLayout}
				style={{ paddingTop: 8, paddingBottom: 10, width: '100%', flexDirection: 'row', paddingHorizontal: 16 }}>
				{
					!disabled
						? <View
							style={{ alignSelf: 'center', marginRight: 8 }}>
							<CommonStyle.icons.accountSearch
								size={22}
								color={CommonStyle.color.modify} />
						</View>
						: null
				}
				<Item item={defaultAccount} index={0} />
			</TouchableOpacityOpt>
		</View>
	</View>
}, () => true)

export default PortfolioAccount

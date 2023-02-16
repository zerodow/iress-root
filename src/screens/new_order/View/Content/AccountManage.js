import React, { useCallback, useEffect, useState, useMemo, useRef, useContext } from 'react'
import { View, TouchableOpacity } from 'react-native';
import { dataStorage, func } from '~/storage';
import { getRandomKey } from '~/util'
import { reloadDataAfterChangeAccount } from '~/lib/base/functionUtil.js'
import { useDispatch, useSelector } from 'react-redux'

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AccountList from '~/component/ListBoxAccount/AccountList.js'
import BoxAccount from '~/component/ListBoxAccount/BoxAccount.js'
import RemakeBoxAccount from '~/component/ListBoxAccount/RemakeBoxAccount.js'
import { useShadow } from '~/component/shadow/SvgShadow';

import { getAccActive, getDicPortfolioType, getListPortfolioType, getPorfolioTypeByCode } from '~/screens/portfolio/Model/PortfolioAccountModel.js'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as fbEmit from '~/emitter';
import Enum from '~/enum'
import AsyncStorage from '~/manage/manageLocalStorage'
import * as Bussines from '~/business'
import * as Controller from '~/memory/controller';
import { resetStateNewOrder, changeStepQuantity } from '~/screens/new_order/Redux/actions.js'
import { getDisableTabBuySell } from '~/screens/new_order/Model/TabModel.js'
import { setType, getType, checkDisabledChangeAccount } from '~/screens/new_order/Model/OrderEntryModel.js'
import { ENUM } from '~/component/animation_view';
import { checkFnUseToGetLotSize } from '~s/new_order/View/Content/LotsizeManage'
const {
	ACCOUNT_STATE,
	CHANNEL,
	EVENT,
	PORTFOLIO_TYPE,
	NAME_PANEL,
	METHOD_GET_LOT_SIZE_BY_EXCHANGE
} = Enum;
const { TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE } } = Enum
function IconSearchAccount({ disabled }) {
	return (
		<CommonStyle.icons.accountSearch
			size={22}
			color={disabled ? CommonStyle.color.dusk : CommonStyle.color.modify}
			style={{ marginRight: 16 }}
		/>
	)
}

function createNewArray(item, listItem) {
	let tmp = listItem.filter(el => el.account_id !== item.account_id)
	return [item, ...tmp]
}

const AboveFiveAccount = React.memo(({ symbol, exchange, showSearchAccount }) => {
	// const dispatch = useDispatch()
	const [Shadow, onLayout] = useShadow()
	const accActive = useSelector(state => state.portfolio.accActive)
	const defaultAccount = getDicPortfolioType(accActive)
	const typeAccount = getPorfolioTypeByCode(accActive)
	const listAccount = getListPortfolioType()
	const disabled = !listAccount || Object.keys(listAccount).length < 2 || checkDisabledChangeAccount()
	const onOpenSearchAccount = useCallback(() => {
		if (disabled) return
		Bussines.showButtonConfirm()
		showSearchAccount && showSearchAccount()
	}, [])
	const currentAccount = {
		account_id: defaultAccount.portfolio_id,
		account_name: defaultAccount.portfolio_name,
		portfolio_type: defaultAccount.portfolio_id
	}
	if (!currentAccount.account_name) return null
	return (
		<View>
			<Shadow />
			<TouchableOpacity
				disabled={disabled}
				onPress={onOpenSearchAccount}
			>
				<View onLayout={onLayout} style={{ alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16, width: '100%', paddingBottom: 8 }}>
					<IconSearchAccount disabled={disabled} />
					<RemakeBoxAccount
						disabled={disabled}
						style={{
							flex: 1
						}}
						isSelected={true}
						hideCheckBox={false}
						accountId={currentAccount.account_id}
						accountName={currentAccount.account_name}
						typeAccount={typeAccount}
						symbol={symbol}
						exchange={exchange}
						onDataBalance={(res, type, exchange) => {
							// const methodGetLotsizeByExchange = checkFnUseToGetLotSize({ exchange })
							// if (methodGetLotsizeByExchange === METHOD_GET_LOT_SIZE_BY_EXCHANGE.MARKET_INFO_SYMBOL) return // Nếu exchange này cần lấy từ market info symbol thì return
							// if (PORTFOLIO_TYPE.CFD === type) {
							//     const lotSize = res.lot_size || 1
							//     if (lotSize) {
							//         dispatch(changeStepQuantity(lotSize))
							//     }
							// }
						}}
					/>
				</View>
			</TouchableOpacity>
		</View>
	)
}, () => true)

const ManageAccount = React.memo((props) => {
	return <AboveFiveAccount {...props} />
}, () => true);

export default ManageAccount;

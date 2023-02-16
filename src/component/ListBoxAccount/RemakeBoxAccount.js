import React, {
	useEffect,
	useState,
	useMemo,
	useRef,
	useLayoutEffect
} from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';
import Animated from 'react-native-reanimated';
import Enum from '~/enum';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller';
import { dataStorage } from '~/storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
	Text as TextLoading,
	View as ViewLoading
} from '~/component/loading_component';
import ValueFormat from '~/component/ValueFormat';
import {
	setToCurrency,
	setFromCurrency
} from '~s/portfolio/Model/PortfolioAccountModel';
import * as Business from '~/business';
import I18n from '~/modules/language/';
import { getPortfolioBalance } from '~s/portfolio/Controller/PortfolioTotalController';
import {
	changeStepQuantity,
	changeLoadingBoxAccount
} from '~/screens/new_order/Redux/actions.js';
import LotsizeManage, {
	checkFnUseToGetLotSize
} from '~s/new_order/View/Content/LotsizeManage';
import { isErrorSystemByCode } from '~/component/error_system/Controllers/ErrorSystem.js';
import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux';
const { PRICE_DECIMAL, PORTFOLIO_TYPE, TYPE_LOT_SIZE } = Enum;

const IconSearchAccount = () => {
	return (
		<MaterialCommunityIcons
			name="account-search"
			size={22}
			color={'white'}
		/>
	);
};
const AccountName = ({ accountName }) => {
	return (
		<Text
			numberOfLines={1}
			style={{
				fontSize: CommonStyle.fontSizeXS,
				fontFamily: CommonStyle.fontPoppinsRegular,
				color: CommonStyle.fontColor
			}}
		>
			{accountName}
		</Text>
	);
};
const AccountType = ({ typeAccount }) => {
	const title = I18n.t('userType');
	if (!typeAccount) return null;
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
				{typeAccount.charAt(0).toUpperCase() + typeAccount.slice(1)}
			</Text>
		</View>
	);
};
const AccountId = ({
	accountId,
	isSelected,
	hideCheckBox = false,
	disabled
}) => {
	return (
		<View style={{ flexDirection: 'row' }}>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.fontSizeXS,
					color: CommonStyle.fontNearLight6
				}}
			>
				{'Account'}
			</Text>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					flex: 1
				}}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsBold,
						fontSize: CommonStyle.fontSizeXS,
						color: CommonStyle.fontColor,
						paddingLeft: 8
					}}
				>
					{accountId}
				</Text>
				{isSelected && !hideCheckBox && (
					<IconSelected disabled={disabled} />
				)}
			</View>
		</View>
	);
};
const IconSelected = ({ style, disabled }) => (
	<View style={style}>
		<CommonStyle.icons.checkMarkCircle
			size={13}
			color={
				!disabled ? CommonStyle.color.modify : CommonStyle.color.dusk
			}
		/>
	</View>
);

const AvailableBalance = ({
	cashAvailable,
	typeAccount,
	isLoading,
	currency
}) => {
	// const currency = useMemo(() => '$')
	const title = useMemo(() => {
		if (typeAccount === PORTFOLIO_TYPE.CFD) {
			return 'Free Equity Balance ';
		}
		return 'Available Balance';
	}, []);
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}
		>
			<Text
				numberOfLines={1}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS,
					color: CommonStyle.fontNearLight6,
					flex: 1
				}}
			>
				{title}
			</Text>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'flex-end'
				}}
			>
				<ValueFormat
					currencyCode={currency}
					forceColor={CommonStyle.color.buy}
					ignorePositiveNumber={true}
					isLoading={isLoading}
					value={cashAvailable}
					decimal={PRICE_DECIMAL.VALUE}
					textStyle={{ fontFamily: CommonStyle.fontPoppinsRegular }}
				/>
			</View>
		</View>
	);
};

const SecurityLotSize = ({ securityLotSize, isLoading, symbol, exchange }) => {
	if (exchange === 'NAS' || exchange === 'NYS') return null;
	return (
		<View
			style={{
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignItems: 'center'
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS1,
					color: CommonStyle.fontNearLight6
				}}
			>
				{I18n.t('securityLotSize')}
			</Text>
			<TextLoading
				isLoading={isLoading}
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.fontSizeXS1,
					color: CommonStyle.fontColor,
					marginBottom: 1
				}}
			>
				{formatNumberNew2(securityLotSize, PRICE_DECIMAL.VOLUME) ||
					'--'}
			</TextLoading>
		</View>
	);
};
export const AccountCFD = (props) => {
	const {
		marginLotSize,
		securityLotSize,
		cfdShell,
		isLoading,
		initialMarginPercent,
		symbol,
		exchange
	} = props;
	return (
		<View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS1,
						color: CommonStyle.fontNearLight6
					}}
				>
					{I18n.t('initialMarginPercent')}
				</Text>
				<TextLoading
					isLoading={isLoading}
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS1,
						color: CommonStyle.fontColor,
						marginBottom: 1
					}}
				>
					{' '}
					{formatNumberNew2(
						initialMarginPercent,
						PRICE_DECIMAL.VALUE
					) || '--'}
				</TextLoading>
			</View>
			<View style={{ width: '100%', height: 1 }}></View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS1,
						color: CommonStyle.fontNearLight6
					}}
				>
					{I18n.t('marginLotSize')}
				</Text>
				<TextLoading
					isLoading={isLoading}
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS1,
						color: CommonStyle.fontColor,
						marginBottom: 1
					}}
				>
					{' '}
					{formatNumberNew2(marginLotSize, PRICE_DECIMAL.VOLUME) ||
						'--'}
				</TextLoading>
			</View>
			{exchange !== 'NAS' && exchange !== 'NYS' && (
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Text
						style={{
							fontFamily: CommonStyle.fontPoppinsRegular,
							fontSize: CommonStyle.fontSizeXS1,
							color: CommonStyle.fontNearLight6
						}}
					>
						{I18n.t('securityLotSize')}
					</Text>
					<TextLoading
						isLoading={isLoading}
						style={{
							fontFamily: CommonStyle.fontPoppinsRegular,
							fontSize: CommonStyle.fontSizeXS1,
							color: CommonStyle.fontColor,
							marginBottom: 1
						}}
					>
						{' '}
						{formatNumberNew2(
							securityLotSize,
							PRICE_DECIMAL.VOLUME
						) || '--'}
					</TextLoading>
				</View>
			)}
			<View style={{ width: '100%', height: 1 }}></View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center'
				}}
			>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS1,
						color: CommonStyle.fontNearLight6
					}}
				>
					{I18n.t('shotSell')}
				</Text>
				<TextLoading
					isLoading={isLoading}
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS1,
						color: CommonStyle.fontColor,
						marginBottom: 1
					}}
				>
					{' '}
					{cfdShell ? 'Yes' : 'No'}
				</TextLoading>
			</View>
		</View>
	);
};
const useGetCashBalance = ({
	typeAccount,
	accountId,
	setPortfolioTotal,
	onDataBalance,
	symbol,
	exchange,
	dic
}) => {
	const dispatch = useDispatch();
	return useLayoutEffect(() => {
		dispatch(changeLoadingBoxAccount(true));
		dic.current.isLoading = true;

		dataStorage.getPortfolioBalance = () => {
			getPortfolioBalance(accountId, symbol, exchange)
				.then((res) => {
					if (isErrorSystemByCode(res)) return;
					// // Fake currency
					// res['from_currency'] = 'KRW'
					const {
						from_currency: fromCurrency,
						to_currency: toCurrency
					} = res;
					setToCurrency(toCurrency);
					setFromCurrency(fromCurrency);
					dic.current.isLoading = false;
					dispatch(changeLoadingBoxAccount(false));
					setPortfolioTotal && setPortfolioTotal(res || {});
					onDataBalance && onDataBalance(res, typeAccount, exchange);
				})
				.catch((err) => {
					dic.current.isLoading = false;
					dispatch(changeLoadingBoxAccount(false));
				});
		};
		getPortfolioBalance(accountId, symbol, exchange)
			.then((res) => {
				if (isErrorSystemByCode(res)) return;
				// // Fake currency
				// res['from_currency'] = 'KRW'
				const { from_currency: fromCurrency, to_currency: toCurrency } =
					res;
				setToCurrency(toCurrency);
				setFromCurrency(fromCurrency);
				dic.current.isLoading = false;
				dispatch(changeLoadingBoxAccount(false));
				setPortfolioTotal && setPortfolioTotal(res || {});
				onDataBalance && onDataBalance(res, typeAccount, exchange);
			})
			.catch((err) => {
				dic.current.isLoading = false;
				dispatch(changeLoadingBoxAccount(false));
			});
	}, [accountId]);
};
const RemakeBoxAccount = ({
	accountId,
	accountName,
	typeAccount,
	isSelected,
	hideCheckBox = false,
	style,
	symbol,
	exchange,
	disabled,
	borderColor,
	onDataBalance = () => {}
}) => {
	const [portfolioTotal, setPortfolioTotal] = useState({});
	const [securityLotSize, setSecurityLotSize] = useState(null);
	const { isLoadingErrorSystem } = useLoadingErrorSystem();
	const dispatch = useDispatch();
	const dic = useRef({ isLoading: true });
	useGetCashBalance({
		typeAccount,
		symbol,
		exchange,
		dic,
		accountId,
		setPortfolioTotal,
		onDataBalance
	});
	dic.current.isLoading = dic.current.isLoading || isLoadingErrorSystem;
	const {
		available_balance: availableBalance,
		total_initial_margin: initialMargin,
		lot_size: marginLotSize,
		short_sellable: cfdShell = '--',
		free_equity: freeEquity,
		initial_margin_used_percent: initialMarginPercent,
		from_currency: fromCurrency, // Symbol
		to_currency: toCurrency, // Account
		account_designation: accountDesignation
	} = portfolioTotal;
	useEffect(() => {
		// Cứ thay đổi 1 trong 2 cái này thì sẽ update lại quantity step
		if (marginLotSize || securityLotSize) {
			// Thứ tự ưu tiên là marginLotSize > securityLotSize
			if (marginLotSize) {
				dataStorage.typeLotSize = TYPE_LOT_SIZE.MARGIN;
				dataStorage.stepQuantity = marginLotSize;
				dispatch(changeStepQuantity(marginLotSize));
			} else {
				dataStorage.typeLotSize = TYPE_LOT_SIZE.SECURITY;
				dataStorage.stepQuantity = securityLotSize;
				dispatch(changeStepQuantity(securityLotSize));
			}
		} else {
			// Nếu cả 2 đều không có set lại lot_size = 1
			dataStorage.typeLotSize = null;
			dataStorage.stepQuantity = 1;
			dispatch(changeStepQuantity(1));
		}
	}, [marginLotSize, securityLotSize, accountId]);
	if (typeAccount === PORTFOLIO_TYPE.CFD) {
		return (
			<View style={style}>
				<View
					style={[
						{
							borderWidth: 1,
							borderRadius: 8,
							padding: 8,
							borderColor: isSelected
								? CommonStyle.borderColorActive
								: CommonStyle.color.dusk
						}
					]}
				>
					<AccountId
						disabled={disabled}
						isLoading={dic.current.isLoading}
						isSelected={isSelected}
						hideCheckBox={hideCheckBox}
						accountId={accountId}
					/>
					<AccountType typeAccount={typeAccount} />

					<AccountName
						isLoading={dic.current.isLoading}
						accountName={accountName}
					/>
					<AvailableBalance
						typeAccount={typeAccount}
						isLoading={dic.current.isLoading}
						currency={toCurrency}
						cashAvailable={freeEquity}
					/>
					<AccountCFD
						symbol={symbol}
						exchange={exchange}
						initialMarginPercent={initialMarginPercent}
						isLoading={dic.current.isLoading}
						initialMargin={initialMargin || '--'}
						marginLotSize={marginLotSize}
						securityLotSize={securityLotSize}
						cfdShell={cfdShell}
					/>
					<LotsizeManage
						symbol={symbol}
						exchange={exchange}
						setSecurityLotSize={setSecurityLotSize}
					/>
				</View>
			</View>
		);
	}
	return (
		<View style={style}>
			<View
				style={[
					{
						borderWidth: 1,
						borderRadius: 8,
						padding: 8,
						borderColor: !borderColor
							? isSelected
								? CommonStyle.borderColorActive
								: CommonStyle.color.dusk
							: borderColor
					}
				]}
			>
				<AccountId
					disabled={disabled}
					isLoading={dic.current.isLoading}
					hideCheckBox={hideCheckBox}
					isSelected={isSelected}
					accountId={accountId}
				/>
				<AccountType typeAccount={typeAccount} />
				<AccountName
					isLoading={dic.current.isLoading}
					accountName={accountName}
				/>
				{/* <AccountDesignation accountDesignation={accountDesignation} /> */}
				<AvailableBalance
					currency={toCurrency}
					isLoading={dic.current.isLoading}
					cashAvailable={availableBalance}
				/>
				<SecurityLotSize
					symbol={symbol}
					exchange={exchange}
					isLoading={dic.current.isLoading}
					securityLotSize={securityLotSize}
				/>
				<LotsizeManage
					symbol={symbol}
					exchange={exchange}
					setSecurityLotSize={setSecurityLotSize}
				/>
			</View>
		</View>
	);
};
RemakeBoxAccount.propTypes = {
	type: PropTypes.oneOf(['Single', 'Multiple']),
	symbol: PropTypes.string,
	exchange: PropTypes.string,
	onDataBalance: PropTypes.func,
	disabled: PropTypes.bool,
	accountId: PropTypes.any,
	accountName: PropTypes.string,
	isSelected: PropTypes.bool,
	style: PropTypes.any
};
export default RemakeBoxAccount;

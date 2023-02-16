import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, Platform } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import { useSelector, useDispatch } from 'react-redux';
import PortfolioAccount from './PortfolioAccount';
import PortfolioSummary from './PortfolioSummary';
import PortfolioHoldingTitle from './PortfolioHoldingTitle';
import PortfolioHolding from './PortfolioHolding';
import PortfolioTab from './PortfolioTab';
import PortfolioExpandTab from './PortfolioExpandTab';
import { getAccActive } from '~s/portfolio/Model/PortfolioAccountModel';
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController';
import { changeLoadingState } from '~s/portfolio/Redux/actions';
import * as PureFunc from '~/utils/pure_func';

const dataFake = {
	total_portfolio: 923380.1,
	total_value: 200000,
	positions: [
		{
			symbol: 'THC',
			exchange: 'ASX',
			company: 'THC Global Group',
			filled_quantity: 1000,
			avg_price: 28.39,
			today_upnl: 822.2,
			today_upnl_percent: 20.3,
			total_profit_amount: -1293.9,
			total_profit_percent: -35.39,
			value: 200000 * 40,
			value_percent: 40,
			volume: 1000
		},
		{
			symbol: 'MQG',
			exchange: 'ASX',
			company: 'MQG Global Group',
			filled_quantity: 100,
			avg_price: 100.39,
			today_upnl: -1222.2,
			today_upnl_percent: -40.18,
			total_profit_amount: 1564.8,
			total_profit_percent: 40.09,
			value: 200000 * 15,
			value_percent: 15,
			volume: 100
		},
		{
			symbol: 'ANZ',
			exchange: 'ASX',
			company: 'ANZ Global Group',
			filled_quantity: 1894,
			avg_price: 36.18,
			today_upnl: 522.2,
			today_upnl_percent: 15.15,
			total_profit_amount: -893.9,
			total_profit_percent: -30.09,
			value: 200000 * 5,
			value_percent: 5,
			volume: 1894
		},
		{
			symbol: 'BHP',
			exchange: 'ASX',
			company: 'BHP Global Group',
			filled_quantity: 600,
			avg_price: 38.39,
			today_upnl: -922.2,
			today_upnl_percent: -21.6,
			total_profit_amount: 1168.9,
			total_profit_percent: 40,
			value: 200000 * 20,
			value_percent: 20,
			volume: 600
		},
		{
			symbol: 'RIO',
			exchange: 'ASX',
			company: 'RIO Global Group',
			filled_quantity: 108,
			avg_price: 98.39,
			today_upnl: 812.2,
			today_upnl_percent: 20.3,
			total_profit_amount: 1293.9,
			total_profit_percent: 35.39,
			value: 200000 * 5,
			value_percent: 5,
			volume: 108
		},
		{
			symbol: 'APT',
			exchange: 'ASX',
			company: 'APT Global Group',
			filled_quantity: 18,
			avg_price: 98.39,
			today_upnl: 812.2,
			today_upnl_percent: 20.3,
			total_profit_amount: 1293.9,
			total_profit_percent: 35.39,
			value: 200000 * 15,
			value_percent: 15,
			volume: 18
		}
	]
};

const HeaderList = ({ numberHolding }) => {
	const refPortfolioTab = useRef({});
	return (
		<React.Fragment>
			<PortfolioTab ref={refPortfolioTab} />
			<PortfolioExpandTab refPortfolioTab={refPortfolioTab} />
			<PortfolioHoldingTitle numberHolding={numberHolding} />
		</React.Fragment>
	);
};

const Content = ({
	showDetail,
	showSearchAccount,
	showHideTabbar,
	showHideBuySell,
	updateDataRealtime
}) => {
	const [isFirstLoadAccount, setFirstLoadAccount] = useState(false);
	const [isFirstLoadSummary, setFirstLoadSummary] = useState(true);
	const [isFirstLoadHolding, setFirstLoadHolding] = useState(true);
	const dic = useRef({
		timeoutLoadSummary: null,
		timeoutLoadHolding: null,
		numberHolding: 0,
		isLoading: true
	});
	const [refreshing, setRefreshing] = useState(false);
	const dispatch = useDispatch();
	const { data, isLoading, accActive } =
		useSelector((state) => ({
			data: state.portfolio.data || {},
			isLoading: state.portfolio.isLoading,
			accActive: state.portfolio.accActive
		})) || {};
	dic.current.isLoading = isLoading;
	let positions = (data && data.positions) || [];
	positions.length &&
		positions.sort((a, b) => {
			if (a.symbol > b.symbol) {
				return 1;
			} else {
				return -1;
			}
		});
	dic.current.numberHolding = positions.length;
	const { total_market_value: totalMarketValue, currency } = data || {};
	const renderHeader = useCallback(() => {
		return <HeaderList numberHolding={dic.current.numberHolding} />;
	}, []);

	const renderItem = useCallback(
		({ item, index }) => {
			return (
				<PortfolioHolding
					currency={item.currency}
					totalMarketValue={totalMarketValue}
					showDetail={showDetail}
					showHideTabbar={showHideTabbar}
					showHideBuySell={showHideBuySell}
					position={item}
					index={index}
				/>
			);
		},
		[totalMarketValue]
	);
	const renderFooter = () => {
		return <View style={{ height: 88 + 8 }} />;
	};
	const keyExtractor = (item, index) => {
		const { symbol, exchange } = item;
		return `${symbol}.${exchange}`;
	};
	const onRefresh = useCallback(() => {
		const accActive = getAccActive();
		setRefreshing((prevRefreshing) => !prevRefreshing);
		dispatch(changeLoadingState(true));
		getPortfolioTotal(accActive).then(() => {
			setRefreshing(false);
		});
	}, []);
	const lazyLoad = () => {
		dic.current.timeoutLoadSummary = setTimeout(() => {
			setFirstLoadSummary(false);
		}, 200);
		// dic.current.timeoutLoadHolding = setTimeout(() => {
		//     setFirstLoadHolding(false)
		// }, 400)
	};
	const unmount = () => {
		dic.current.timeoutLoadHolding &&
			clearTimeout(dic.current.timeoutLoadHolding);
		dic.current.timeoutLoadSummary &&
			clearTimeout(dic.current.timeoutLoadSummary);
	};
	useEffect(() => {
		const {
			positions,
			total_market_value: totalMarketValue,
			currency
		} = data;
		positions &&
			updateDataRealtime &&
			updateDataRealtime(positions, totalMarketValue, currency);
	}, [data]);
	const _listEmptyComponent = useCallback(() => {
		return (
			!dic.current.isLoading && (
				<View
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Text
						style={{
							fontFamily: CommonStyle.fontPoppinsItalic,
							fontSize: CommonStyle.fontSizeS,
							color: CommonStyle.fontColor,
							alignSelf: 'center'
						}}
					>
						This portfolio does not have any holdings
					</Text>
				</View>
			)
		);
	}, []);
	useEffect(() => {
		lazyLoad();
		return unmount;
	}, []);
	return (
		<View style={{ flex: 1 }}>
			<PortfolioAccount showSearchAccount={showSearchAccount} />
			{isFirstLoadSummary ? null : (
				<React.Fragment>
					<PortfolioSummary data={data} />
					<FlatList
						contentContainerStyle={
							!positions.length &&
							!dic.current.isLoading && {
								flexGrow: 1,
								justifyContent: 'center'
							}
						}
						keyboardShouldPersistTaps={'always'}
						showsVerticalScrollIndicator={false}
						data={positions}
						keyExtractor={keyExtractor}
						ListHeaderComponent={renderHeader}
						ListFooterComponent={renderFooter}
						renderItem={renderItem}
						ListEmptyComponent={_listEmptyComponent}
						refreshControl={
							<RefreshControl
								style={
									Platform.OS === 'ios'
										? {
												backgroundColor:
													CommonStyle.color.dark
										  }
										: {}
								}
								tintColor={CommonStyle.fontColor}
								refreshing={refreshing}
								onRefresh={onRefresh}
							/>
						}
					/>
				</React.Fragment>
			)}
		</View>
	);
};

export default React.memo(Content, () => true);

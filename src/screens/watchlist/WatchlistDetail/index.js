import React, {
	useCallback,
	useLayoutEffect,
	useState,
	useEffect,
	useMemo
} from 'react';
import { ScrollView, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import ChartDetail from '../DetailChart';
import HandleDataComp from '../Detail/handle_data_detail';
import MarketInfo from '../Detail/components/MartketInfo.2';
import SymbolInfo from '../Detail/symbolInfoDetail';
import TradeInfo from '../Detail/components/TradeInfo.2';
import BuySellButton from '../Detail/components/BuySellButton.2';
import AddToWLScreen from '~s/portfolio/View/AddToWL/';
import Icon from '~/component/headerNavBar/icon';
import Header from '~/component/headerNavBar';
import CommonStyle from '~/theme/theme_controller';
import ProgressBar from '~/modules/_global/ProgressBar';
import * as Business from '~/business';

import * as Controller from '~/memory/controller';
import { useShowAddToWl } from '~s/portfolio/Hook/';
import BestBidAsk from '../Detail/BestBidAsk';
import { useData } from '~s/watchlist/Detail';
import * as Channel from '~/streaming/channel';
import * as Emitter from '@lib/vietnam-emitter';
import Enum from '~/enum';
const { INDICES } = Enum.SYMBOL_CLASS
const WatchlistDetail = ({
	navigator,
	symbol,
	exchange,
	isDisableShowNewDetail,
	isBackToSearch = false
}) => {
	const [refAddToWl, showAddToWl] = useShowAddToWl();
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	useEffect(() => {
		setTimeout(() => {
			setIsFirstLoad(false);
		}, 100);
	}, []);

	useData(symbol, exchange, navigator);
	const LoadingChannel = Channel.getChannelAlertLoading();
	const isLoading = useSelector(
		(state) =>
			state.loading.effects.quotes.getSnapshot ||
			state.loading.effects.trades.getSnapshot ||
			state.loading.effects.depths.getSnapshot
	);

	useEffect(() => {
		Emitter.emit(LoadingChannel, isLoading);
	}, [isLoading]);

	const classSymbol = useMemo(() => {
		return Business.getClassBySymbolAndExchange({ symbol, exchange })
	}, [symbol, exchange])

	const renderLeftComp = () => (
		<View style={{
			width: 36,
			alignSelf: 'flex-start'
		}}>
			<Text
				numberOfLines={1}
				style={{
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.fontSizeXXL,
					color:
						CommonStyle.navigatorSpecial
							.navBarSubtitleColor,
					opacity: 0
				}}
			>
				{'AAA'}
			</Text>
			<View style={[StyleSheet.absoluteFillObject, {
				justifyContent: 'center',
				alignItems: 'center'
			}]}>
				<TouchableOpacity
					style={{
						width: '100%',
						height: '100%',
						justifyContent: 'center'
					}}>
					<Icon
						size={30}
						onPress={() => {
							navigator.dismissModal({
								animated: true,
								animationType: 'slide-horizontal'
							})
							if (isBackToSearch) {
								navigator.pop({
									animated: true,
									animationType: 'slide-horizontal'
								})
							} else {
								navigator.popToRoot({
									animated: true,
									animationType: 'slide-horizontal'
								})
							}
						}
						}
						name="ios-arrow-back"
					/>
				</TouchableOpacity>
			</View>
		</View>
	);

	const companyName = Business.getCompanyName({ symbol, exchange });
	if (isFirstLoad) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<ProgressBar color={CommonStyle.fontColor} />
			</View>
		);
	}
	return (
		<React.Fragment>
			<Header
				renderLeftComp={renderLeftComp}
				style={{ marginLeft: 0, paddingTop: 16 }}
				rightStyles={{ flex: 0 }}
				titleStyle={{ flex: 1 }}
				renderContent={() => (
					<View
						style={{
							flex: 1,
							alignItems: 'center'
						}}
					>
						<Text
							numberOfLines={1}
							style={{
								fontFamily: CommonStyle.fontPoppinsBold,
								fontSize: CommonStyle.fontSizeXXL,
								color:
									CommonStyle.navigatorSpecial
										.navBarSubtitleColor
							}}
						>
							{symbol + '.' + exchange}
						</Text>
						<Text
							numberOfLines={1}
							style={{
								fontFamily: CommonStyle.fontPoppinsRegular,
								fontSize: CommonStyle.font13,
								color: CommonStyle.fontWhite,
								opacity: 0.7,
								paddingBottom: 8
							}}
						>
							{companyName}
						</Text>
					</View>
				)}
			></Header>

			<ScrollView style={{ flex: 1 }}>
				{/* <HandleDataComp
					userId={Controller.getUserId()}
					navigator={navigator}
					listSymbol={listSymbol}
					isDetail
				/> */}

				<SymbolInfo
					navigator={navigator}
					symbol={symbol}
					exchange={exchange}
					showAddToWl={showAddToWl}
				/>
				{classSymbol !== INDICES ? <BestBidAsk symbol={symbol} exchange={exchange} /> : null}

				<TradeInfo symbol={symbol} exchange={exchange} />

				<ChartDetail
					navigator={navigator}
					symbol={symbol}
					exchange={exchange}
				/>

				<MarketInfo
					isDisableShowNewDetail={isDisableShowNewDetail}
					symbol={symbol}
					exchange={exchange}
					navigator={navigator}
				/>
				<View style={styles.bottomSpace} />
			</ScrollView>
			<BuySellButton symbol={symbol} exchange={exchange} />
			<AddToWLScreen
				showHideTabbar={() => { }}
				showHideBuySell={() => { }}
				ref={refAddToWl}
			/>
		</React.Fragment>
	);
};

export default WatchlistDetail;

const styles = StyleSheet.create({
	bottomSpace: {
		height: 84
	}
});

import React, {
	Component,
	useCallback,
	useState,
	useMemo,
	useEffect,
	useContext
} from 'react';
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Keyboard,
	TouchableWithoutFeedback,
	Dimensions,
	ActivityIndicator
} from 'react-native';
import { connect, useSelector, useDispatch } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter';
import HandleSearch from '~/component/add_symbol/HandleSearchComp.js';
// Style
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
// Langue
import I18n from '~/modules/language/';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import ListLoading from '~/component/add_symbol/Components/FlatListSequenceAnimation/index.js';
import * as Animatable from 'react-native-animatable';
import SvgIcon from '~/component/svg_icon/SvgIcon.js';
import Flag from '~/component/flags/flagIress.js';
import { changeDicSymbolSelected } from '~/component/add_symbol/Redux/actions.js';
import BoxSystemWatchlist from '~/component/add_and_search_symbol/Components/BoxSystemWatchlist.js';

import * as ContentModel from '~/component/add_symbol/Models/Content.js';

import * as Controller from '~/memory/controller';
import { func, dataStorage } from '~/storage';
import * as Business from '~/business';
import * as Channel from '~/streaming/channel.js';
import { changeLoading } from '~/screens/new_order/Redux/actions.js';
import ENUM from '~/enum';
import { ScrollView } from 'react-native-gesture-handler';
import * as FunctionUtil from '~/lib/base/functionUtil';
let top = FunctionUtil.getTopPanel();
const { NAME_PANEL } = ENUM;
const { height: heightDevice } = Dimensions.get('window');
const fakeDataNews = [
	{
		news_id: 1038017311455314439
	},
	{
		news_id: 1038017311455314440
	},

	{
		news_id: 1038017311455314441
	},

	{
		news_id: 1038017311455314442
	},

	{
		news_id: 1038017311455314443
	},

	{
		news_id: 1038017311455314444
	},

	{
		news_id: 1038017311455314445
	},

	{
		news_id: 1038017311455314446
	},

	{
		news_id: 1038017311455314447
	}
];
export const BoxClass = ({ className }) => {
	const { text, color } = Business.getClassTagProperty({
		classSymbol: className
	});
	return (
		<View
			style={[
				styles.boxClass,
				{ marginTop: 4, marginLeft: 8, backgroundColor: color }
			]}
		>
			<Text style={[styles.textClass]}>{text}</Text>
		</View>
	);
};
const mapDispatchToProps = (dispatch) => ({
	changeLoadingState: (...p) => dispatch(changeLoading(...p))
});
const BoxSymbol = connect(
	null,
	mapDispatchToProps
)(
	({
		displayName,
		companyName,
		onSelectedSymbol,
		index,
		classSymbol,
		symbol,
		exchange,
		symbolObject,
		onClose,
		disableSelected,
		isShowBoxCheck,
		addOnOutside
	}) => {
		const [isSelected, updateSelected] = useState(
			ContentModel.isSelected({ symbol, exchange })
		);

		const dispatch = useDispatch();
		const onSelect = useCallback(() => {
			Keyboard.dismiss();
			func.setReccentSearchSymbol &&
				func.setReccentSearchSymbol(symbolObject);
			ContentModel.addSymbolSelected({
				symbol,
				exchange,
				isSelected: !isSelected
			});
			updateSelected(!isSelected);
			dispatch(
				changeDicSymbolSelected(`${symbol}#${exchange}`, !isSelected)
			);
		}, [symbol, exchange, isSelected]);

		// Clear Model
		// useEffect(() => {
		//     return ContentModel.clearSymbolSelected()
		// }, [])
		const onCbSelectedSymbol = useCallback(() => {
			if (!addOnOutside) {
				onClose && onClose();
				func.setReccentSearchSymbol &&
					func.setReccentSearchSymbol(symbolObject);
				onSelectedSymbol &&
					onSelectedSymbol({ symbol, exchange, symbolObject });
			} else {
				onSelect();
			}
		}, [symbol, exchange]);
		if (disableSelected) {
			return (
				<View
					style={[styles.boxRow, { marginTop: index === 0 ? 0 : 8 }]}
				>
					<TouchableOpacity
						onPress={onCbSelectedSymbol}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							flex: 1
						}}
					>
						<Flag {...{ symbol, exchange }} />
						<View style={{ flex: 1 }}>
							<View
								style={{
									flexDirection: 'row',
									alignItems: 'center'
								}}
							>
								<Text style={[styles.textSymbol]}>
									{displayName}
								</Text>
								<BoxClass className={classSymbol} />
							</View>
							<Text style={[styles.textCompany]}>
								{companyName}
							</Text>
						</View>
					</TouchableOpacity>
				</View>
			);
		}

		let withBorder = {};

		if (isSelected) {
			withBorder = {
				borderWidth: 1,
				borderColor: CommonStyle.color.select
			};
		}

		return (
			<View
				style={[
					styles.boxRow,
					{ marginTop: index === 0 ? 0 : 8 },
					withBorder
				]}
			>
				<TouchableOpacity
					onPress={onCbSelectedSymbol}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						flex: 1
					}}
				>
					{/* <Flag {...{ symbol, exchange }} /> */}
					<View style={{ flex: 1 }}>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center'
							}}
						>
							<Text style={[styles.textSymbol]}>
								{displayName}
							</Text>
							<BoxClass className={classSymbol} />
						</View>
						<Text style={[styles.textCompany]}>{companyName}</Text>
					</View>
				</TouchableOpacity>
				{isShowBoxCheck && (
					<TouchableOpacity
						hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
						onPress={onSelect}
					>
						<BoxCheck isSelected={isSelected} />
					</TouchableOpacity>
				)}
			</View>
		);
	}
);
export const BoxCheck = ({ isSelected }) => {
	if (isSelected) {
		return (
			<SvgIcon size={24} name="added" color={CommonStyle.color.select} />
		);
	}
	return <SvgIcon size={24} name="noun_push" color={CommonStyle.fontWhite} />;
};
export function NoData() {
	return (
		<Text style={[CommonStyle.textNoData, { alignSelf: 'center' }]}>
			{I18n.t('noData')}
		</Text>
	);
}
function useOnListenClearRecent({ setData }) {
	return useEffect(() => {
		const id = Emitter.addListener(
			Channel.getChannelClearRecentSymbol(),
			null,
			() => {
				setData && setData([]);
				func.clearRecentSearchSymbol && func.clearRecentSearchSymbol();
			}
		);
		return () => {
			Emitter.deleteByIdEvent(id);
		};
	}, []);
}
function mapStateToProps(state) {
	const isLoading = state.addSymbol.isLoading;
	return {
		isLoading: isLoading
	};
}
const SearchSymbolContent = ({
	dicSymbolSelected,
	onSelectedSymbol,
	disableSelected,
	onClose,
	isShowBoxCheck,
	addOnOutside
}) => {
	const isLoading = useSelector((state) => state.addSymbol.isLoading);
	useMemo(() => {
		ContentModel.init({ ...dicSymbolSelected } || {});
	}, []);
	const [data, setData] = useState([]);
	useOnListenClearRecent({ setData });
	const dismissKeyboard = useCallback(() => {
		Keyboard.dismiss();
	}, []);
	return (
		<React.Fragment>
			<Animatable.View
				pointerEvents={'none'}
				duration={isLoading ? 1 : 500}
				animation={isLoading ? 'fadeIn' : 'fadeOut'}
				style={[
					StyleSheet.absoluteFillObject,
					{ zIndex: 999, paddingTop: 8 }
				]}
			>
				<PureFunction dependency={[isLoading]}>
					<ListLoading
						style={{
							paddingHorizontal: 8
						}}
						isLoading={isLoading}
						data={fakeDataNews}
					/>
				</PureFunction>
			</Animatable.View>
			{!isLoading && (
				<Animatable.View
					style={{
						paddingHorizontal: 8,
						paddingTop: 8,
						flex: 1
					}}
					animation={'fadeIn'}
				>
					{data && Array.isArray(data) && data.length > 0 ? (
						<ScrollView
							onScrollBeginDrag={dismissKeyboard}
							keyboardShouldPersistTaps={'always'}
							contentContainerStyle={{ flexGrow: 1 }}
						>
							{data.map((item, index) => {
								if (item.watchlist) {
									return (
										<BoxSystemWatchlist
											onClose={onClose}
											key={`${item.watchlist}`}
											index={index}
											item={item}
										/>
									);
								}
								if (!item.symbol) return null;
								const {
									symbol,
									company_name: companyName,
									class: classSymbol,
									exchanges,
									display_name: displayName
								} = item;
								const exchange = exchanges[0];
								return (
									<BoxSymbol
										disableSelected={disableSelected}
										onClose={onClose}
										classSymbol={classSymbol}
										index={index}
										displayName={displayName}
										companyName={companyName}
										key={`${symbol}#${exchange}`}
										symbol={symbol}
										exchange={exchange}
										symbolObject={item}
										onSelectedSymbol={onSelectedSymbol}
										isShowBoxCheck={isShowBoxCheck}
										addOnOutside={addOnOutside}
									/>
								);
							})}
							{data.length > 0 && <View style={{ height: 16 }} />}
						</ScrollView>
					) :
						(
							<View style={{ flex: 1, justifyContent: 'center' }}>
								<NoData />
							</View>
						)
					}
				</Animatable.View>
			)}
			<HandleSearch updateResult={setData} />
		</React.Fragment>
	);
};
export default connect(mapStateToProps)(SearchSymbolContent);
const PureFunction = ({ dependency = [], children }) => {
	return useMemo(() => {
		return <React.Fragment>{children}</React.Fragment>;
	}, dependency);
};
export const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		boxRow: {
			paddingVertical: 8,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderColor: CommonStyle.color.unselect,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center'
		},
		textSymbol: {
			fontFamily: CommonStyle.fontPoppinsBold,
			fontSize: CommonStyle.fontSizeM,
			color: CommonStyle.fontColor
		},
		textCompany: {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeTen,
			color: CommonStyle.fontNearLight6
		},
		boxClass: {
			paddingVertical: 2,
			paddingHorizontal: 4,
			borderRadius: 8,
			backgroundColor: 'rgb(8,108,205)',
			alignSelf: 'flex-start'
		},
		textClass: {
			fontSize: CommonStyle.fontMin,
			fontFamily: CommonStyle.fontPoppinsBold,
			color: CommonStyle.fontDark
		},
		boxSelected: {
			height: 32,
			width: 32,
			borderRadius: 100,
			justifyContent: 'center',
			alignItems: 'center'
		}
	});

	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

import React, {
	useState,
	useCallback,
	useRef,
	useEffect,
	PureComponent,
	useLayoutEffect,
	useContext,
	useMemo
} from 'react';
import {
	Text,
	View,
	TouchableOpacity,
	TextInput,
	StyleProp,
	StyleSheet,
	Platform,
	LayoutAnimation,
	UIManager, Keyboard
} from 'react-native';
import { connect, useSelector, shallowEqual, useDispatch } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter';
// Style
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
// Langue
import I18n from '~/modules/language/';
// Component
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextInputAvoidPadding from '~/component/text_input/index.js';

import CustomIcon from '~/component/Icon';
import Icon from '~/component/svg_icon/SvgIcon.js';
import { useShadow } from '~/component/shadow/SvgShadow';
import { CloseIcon2 } from '~/component/panel/Icon.js';
import * as ContentAddSymbolModel from '~/component/add_symbol/Models/Content.js';
import {
	changeLoading,
	changeTextSearch,
	initDicSymbolSelected
} from '~/component/add_symbol/Redux/actions.js';
import { getChannelClearRecentSymbol } from '~/streaming/channel.js';
import * as Controller from '~/memory/controller'
import { func, dataStorage } from '~/storage';
import Enum from '~/enum';
UIManager.setLayoutAnimationEnabledExperimental &&
	UIManager.setLayoutAnimationEnabledExperimental(true);
const { NAME_PANEL } = Enum;
function useSetDisableButtonClearRecent({ type, setDisable }) {
	if (type === 'SEARCH_SYMBOL') {
		func.getReccentSearchSymbol()
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					setDisable(false);
				}
			})
			.catch((e) => cb && cb([]));
	} else {
		func.getReccentAccount()
			.then((data) => {
				if (Array.isArray(data) && data.length > 0) {
					setDisable(false);
				}
			})
			.catch((e) => { });
	}
}
export const BarBottomSearch = ({ onClearSearch, type }) => {
	const [isDisable, setDisable] = useState(true);
	useSetDisableButtonClearRecent({
		type,
		setDisable
	});
	const onClear = useCallback(() => {
		onClearSearch && onClearSearch();
		setDisable(true);
	}, []);
	return (
		<View
			style={[
				{
					flexDirection: 'row',
					justifyContent: 'space-between',
					paddingVertical: 8,
					paddingHorizontal: 8,
					alignItems: 'center'
				}
			]}
		>
			<Text style={[styles.textRecent]}>Recent</Text>
			<TouchableOpacity disabled={isDisable} onPress={onClear} style={{ paddingLeft: 16 }}>
				<CommonStyle.icons.deleteSvg
					disabled={isDisable}
					onPress={onClear}
					name={'delete'}
					size={20}
					color={
						isDisable
							? CommonStyle.fontNearLight3
							: CommonStyle.fontNearLight6
					}
				/>
			</TouchableOpacity>
		</View>
	);
};
export const ButtonDone = ({ handleOnDone }) => {
	const dicSymbolSelected = useSelector(
		(state) => state.addSymbol.dicSymbolExchangeSelected,
		shallowEqual
	);
	const isShowCloseIcon = useMemo(() => {
		const length = Object.keys(dicSymbolSelected).length;

		if (length > 0) {
			return false;
		}
		return true;
	});
	return (
		<TouchableOpacity
			hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
			onPress={handleOnDone}
			style={{ alignItems: 'flex-end', paddingLeft: 16 }}
		>
			{isShowCloseIcon ? (
				<CloseIcon2
					style={{
						width: 17,
						height: 17
					}}
					onPress={handleOnDone}
				/>
			) : (
				<Icon
					testID="iconCancelSearchCode"
					name="done"
					size={17}
					color={CommonStyle.color.icon}
				/>
			)}
		</TouchableOpacity>
	);
};

const NetworkWarning = (props) => {
	const isConnectedRedux = useSelector((state) => state.app.isConnected);
	const [isConnected, setIsConnected] = useState(isConnectedRedux);
	useEffect(() => {
		if (isConnectedRedux !== isConnected) {
			LayoutAnimation.easeInEaseOut();
			setIsConnected(isConnectedRedux);
		}
	}, [isConnectedRedux, isConnected]);
	return isConnected ? (
		<View />
	) : (
		<View
			style={{
				width: '100%',
				backgroundColor: CommonStyle.color.sell,
				paddingVertical: 8
			}}
		>
			<Text
				style={{
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					color: CommonStyle.fontBlack,
					textAlign: 'center'
				}}
			>
				{I18n.t('connectingFirstCapitalize')}
			</Text>
		</View>
	);
};

export const Header = React.memo(
	({
		searchSymbol,
		callBackClearText,
		changeLoadingSearch,
		onClearSearch,
		type,
		onDone,
		onClose,
		forwardContext,
		textSearch,
		handleUpdateTextSearch,
		placeholder
	}) => {
		const dispatch = useDispatch();
		let timeoutSearch = useRef(null);
		const refTextInput = useRef();
		const onSearch = useCallback((text) => {
			changeLoadingSearch(true);
			handleUpdateTextSearch && handleUpdateTextSearch(text);
			timeoutSearch && clearTimeout(timeoutSearch);
			timeoutSearch = setTimeout(() => {
				searchSymbol && searchSymbol(text);
			}, 500);
		}, []);
		useEffect(() => {
			setTimeout(() => {
				try {
					refTextInput.current && refTextInput.current.focus && refTextInput.current.focus()
				} catch (error) {

				}
			}, 500);
			return () => {
				searchSymbol('');
			};
		}, []);
		const handleOnDone = useCallback(() => {
			Keyboard.dismiss()
			dispatch.subWatchlist.resetContent();
			onDone && onDone(ContentAddSymbolModel.getSymbolSelected());
			onClose && onClose();
			Controller.dispatch(
				initDicSymbolSelected({})
			);
		}, [dispatch]);
		const [Shadow2, onLayout2] = useShadow();
		return (
			<View>
				<View
					style={[styles.header]}
					testID={'search-bar-button-common'}
				>
					<View style={{
						borderBottomRightRadius: 8,
						borderBottomLeftRadius: 8,
						borderColor: 'red',
						zIndex: 99999
					}}>
						<Shadow2
							customRect='x="0" y="0" rx="5"'
							stopOpacity={0.18}
							style={{
								borderBottomRightRadius: 8,
								borderBottomLeftRadius: 8
							}} heightShadow={16} />
						<View
							onLayout={(e) => {
								e.nativeEvent.layout.height = e.nativeEvent.layout.height - 12
								onLayout2(e)
							}}
							style={[
								{
									flexDirection: 'row',
									alignItems: 'center',
									paddingBottom: 8,
									paddingHorizontal: 16,
									paddingVertical: 8,
									borderBottomRightRadius: 8,
									borderBottomLeftRadius: 8,
									zIndex: 99999999,
									backgroundColor: CommonStyle.backgroundColor
								}
							]}
						>
							<View
								style={[
									{
										flexDirection: 'row',
										flex: 1
									},
									styles.searchBar
								]}
							>
								<CommonStyle.icons.searchWl
									name="search"
									size={17}
									color={CommonStyle.fontColor}
								/>
								<View
									style={{
										flex: 1,
										justifyContent: 'center',
										paddingLeft: 8
									}}
								>
									<TextInputAvoidPadding
										numberOfLines={1}
										placeholder={placeholder || I18n.t('search')}
										forwardRef={refTextInput}
										onChangeText={onSearch}
										placeholderTextColor={
											'rgba(255,255,255,0.5)'
										}
										underlineColorAndroid="transparent"
										// selectionColor={CommonStyle.fontColor}
										style={styles.textInput}
									/>
								</View>
							</View>
							<ButtonDone handleOnDone={handleOnDone} />
						</View>
					</View>
					{textSearch === '' && (
						<BarBottomSearch
							type={type || 'SEARCH_ACCOUNT'}
							onClearSearch={onClearSearch}
						/>
					)}
				</View>
				<NetworkWarning />
			</View>
		);
	},
	(pre, next) => pre.textSearch === next.textSearch
);
const mapDispatchToProps = (dispatch) => ({
	searchSymbol: (...p) => dispatch(changeTextSearch(...p)),
	changeLoadingSearch: (p) => dispatch(changeLoading(p)),
	onClearSearch: (p) => Emitter.emit(getChannelClearRecentSymbol())
});
export default connect(null, mapDispatchToProps)(Header);
const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		header: {
			zIndex: 9,
			backgroundColor: CommonStyle.backgroundColor,
			borderTopLeftRadius: 22,
			borderTopRightRadius: 22
		},
		searchBar: {
			borderWidth: 1,
			borderColor: CommonStyle.backgroundNewSearchBar,
			borderRadius: 8,
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: CommonStyle.backgroundNewSearchBar,
			paddingVertical: 8
		},
		textRecent: {
			color: CommonStyle.fontNearLight6,
			fontSize: CommonStyle.fontSizeXS
		},
		iconSearch: {
			color: CommonStyle.fontWhite,
			fontSize: CommonStyle.iconSizeS,
			paddingRight: CommonStyle.paddingSize
		},
		textInput: {
			color: CommonStyle.fontColor,
			fontSize: CommonStyle.fontSizeXS,
			fontFamily: CommonStyle.fontPoppinsRegular,
			padding: 0,
			margin: 0
		}
	});

	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

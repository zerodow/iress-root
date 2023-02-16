import React, {
	useEffect,
	useState,
	useCallback,
	useRef,
	useMemo
} from 'react';
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Platform
} from 'react-native';
import { forEach, filter } from 'lodash';
import PropTypes from 'prop-types';
import { connect, useSelector, shallowEqual } from 'react-redux';

import CommonStyle from '~/theme/theme_controller';
import { useShadow } from '~/component/shadow/SvgShadow';
import TextInputAvoidPadding from '~/component/text_input/index.js';

import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js';

import Enum from '~/enum';
const { WATCHLIST } = Enum;
const BottomHeader = React.memo(
	(props) => {
		const { setDisabledButtonDone } = props;
		const isWatchlistSystem = useSelector(
			(state) =>
				state.priceBoard.typePriceBoard === Enum.TYPE_PRICEBOARD.IRESS
		);

		const listPriceBoardUser = useSelector(
			(state) => state.priceBoard.userPriceBoard
		);

		const { watchlist: watchlistId, watchlist_name: watchlistName } =
			useSelector((state) => {
				const { userPriceBoard, staticPriceBoard, priceBoardSelected } =
					state.priceBoard;
				return (
					userPriceBoard[priceBoardSelected] ||
					staticPriceBoard[priceBoardSelected] ||
					{}
				);
			});

		const dic = useRef({
			text: isWatchlistSystem ? '' : watchlistName
		});

		const inputRef = useRef();
		const refView = useRef();
		const [isFocus, setFocus] = useState(false);

		const checkExist = useCallback((text) => {
			let isExist = false;
			try {
				forEach(listPriceBoardUser, (el = {}) => {
					if (
						text === el.watchlist_name &&
						watchlistId !== el.watchlist
					) {
						isExist = true;
					}
				});
				return isExist;
			} catch (error) {
				return true;
			}
		});
		const onChangeText = useCallback((text) => {
			dic.current.text = text;
			inputRef.current &&
				inputRef.current.setNativeProps &&
				inputRef.current.setNativeProps({ text });
			PriceBoardModel.setWatchlistName(text);
			if (text === '') {
				setDisabledButtonDone && setDisabledButtonDone(true);
				refView.current &&
					refView.current.setNativeProps &&
					refView.current.setNativeProps({
						style: {
							borderWidth: 1,
							borderColor: CommonStyle.color.sell
						}
					});
			} else {
				if (checkExist(text)) {
					setDisabledButtonDone && setDisabledButtonDone(true);
					refView.current &&
						refView.current.setNativeProps &&
						refView.current.setNativeProps({
							style: {
								borderWidth: 1,
								borderColor: CommonStyle.color.sell
							}
						});
				} else {
					const watchListNameRemote =
						PriceBoardModel.getPriceBoardRemote().watchlist_name;
					if (watchListNameRemote === text) {
						setDisabledButtonDone && setDisabledButtonDone(true);
					} else {
						setDisabledButtonDone && setDisabledButtonDone(false);
					}
					refView.current &&
						refView.current.setNativeProps({
							style: {
								borderWidth: 1,
								borderColor: CommonStyle.color.dusk
							}
						});
				}
			}
		}, []);

		const onFocus = useCallback(() => {
			setFocus(true);
		}, []);
		const onBlur = useCallback(() => {
			setFocus(false);
		}, []);
		const focus = useCallback(() => {
			inputRef.current &&
				inputRef.current.focus &&
				inputRef.current.focus();
		}, []);
		useEffect(() => {
			isWatchlistSystem &&
				setDisabledButtonDone &&
				setDisabledButtonDone(true);
			const wlName = isWatchlistSystem ? '' : watchlistName;
			dic.current.text = wlName;
			PriceBoardModel.setWatchlistName(wlName);
			inputRef.current &&
				inputRef.current.setNativeProps &&
				inputRef.current.setNativeProps({ text: wlName });
			setTimeout(() => {
				isWatchlistSystem && focus();
			}, 500);
		}, []);
		const [Shadow, onLayout] = useShadow();
		return (
			<View>
				<Shadow />
				<View onLayout={onLayout}>
					<View
						pointerEvents={'box-none'}
						ref={refView}
						style={{
							borderRadius: 16,
							paddingVertical: 4,
							paddingHorizontal: 8,
							marginHorizontal: 40,
							marginVertical: 8,
							borderColor: CommonStyle.color.dusk_tabbar,
							borderWidth: 1,
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Text
							numberOfLines={1}
							style={{
								fontFamily: CommonStyle.fontPopinRegular,
								color: 'red',
								fontSize: CommonStyle.fontSizeM,
								textAlign: 'center',
								padding: 0,
								margin: 0,
								opacity: 0
							}}
						>
							AAAAdsdasdasdaddaddada
						</Text>
						<View
							pointerEvents={'box-none'}
							style={[
								StyleSheet.absoluteFillObject,
								{
									alignItems: 'center',
									justifyContent: 'center'
								}
							]}
						>
							<TextInputAvoidPadding
								styleWrapper={{
									justifyContent: 'center',
									alignItems: 'center',
									width: '100%'
								}}
								numberOfLines={1}
								onFocus={onFocus}
								onBlur={onBlur}
								placeholderTextColor={'rgba(255,255,255,0.3)'}
								placeholder={'Watchlist Name'}
								// autoFocus={isWatchlistSystem}
								forwardRef={inputRef}
								onChangeText={onChangeText}
								style={{
									fontFamily: CommonStyle.fontPoppinsRegular,
									color: CommonStyle.fontColor,
									fontSize: CommonStyle.fontSizeM,
									textAlign: 'center',
									width: '100%',
									padding: 0,
									margin: 0,
									opacity: isFocus ? 1 : 0
								}}
								underlineColorAndroid={'transparent'}
							/>
						</View>
						{!isFocus && (
							<View
								style={[
									StyleSheet.absoluteFillObject,
									{
										alignItems: 'center',
										justifyContent: 'center'
									}
								]}
							>
								<TouchableOpacity
									disabled
									activeOpacity={1}
									onPress={focus}
									style={{
										flex: 1,
										width: '100%',
										alignItems: 'center',
										justifyContent: 'center'
									}}
								>
									<Text
										numberOfLines={1}
										style={{
											fontFamily:
												CommonStyle.fontPoppinsRegular,
											color:
												dic.current.text === ''
													? 'rgba(255,255,255,0.3)'
													: CommonStyle.fontColor,
											fontSize: CommonStyle.fontSizeM,
											textAlign: 'center',
											padding: 0,
											margin: 0
										}}
									>
										{dic.current.text === ''
											? 'Watchlist Name'
											: dic.current.text}
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</View>
			</View>
		);
	},
	() => true
);
BottomHeader.propTypes = {};
BottomHeader.defaultProps = {};

export default BottomHeader;

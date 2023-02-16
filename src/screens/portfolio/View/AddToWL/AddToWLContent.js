import React, {
	useState,
	useImperativeHandle,
	useCallback,
	useEffect
} from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Keyboard,
	TouchableWithoutFeedback
} from 'react-native';
import _ from 'lodash';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { useSelector, useDispatch } from 'react-redux';
import ENUM from '~/enum';
import SvgIcon from '~/component/svg_icon/SvgIcon.js';
import {
	updateDicAdd,
	setSymbolInfo,
	reset,
	getDicAdd
} from '~s/portfolio/Model/AddToWLModel';

import { useCheckInclude } from '~s/portfolio/Hook/';
import { changeIsSelector } from '../../Redux/actions';

const { WATCHLIST } = ENUM;

const BoxCheck = ({ isSelected }) => {
	if (isSelected) {
		return (
			<SvgIcon
				name={'added'}
				size={24}
				color={CommonStyle.color.borderAddWLSelected}
			/>
		);
	}
	return <SvgIcon size={24} name="noun_push" color={CommonStyle.fontWhite} />;
};

const Item = ({ symbol, exchange, data, firstKey, syncDicAdd }) => {
	const dispatch = useDispatch();
	const { watchlist: watchlistId, watchlist_name: watchlistName } =
		data || {};
	const [isInclude, setIsInclude] = useState(false);
	const renderIcon = (isInclude) => {
		return <BoxCheck isSelected={isInclude} />;
	};
	const containerStyles = isInclude
		? styles.includeContainer
		: styles.container;

	const curOnPress = useCallback(() => {
		syncDicAdd(watchlistId);
		Keyboard.dismiss();
		const dicAdd = getDicAdd();
		let isSelector = false;
		_.forEach(dicAdd, (value, key) => {
			if (value) {
				isSelector = true;
				return false;
			}
		});
		dispatch(changeIsSelector(isSelector));
		setIsInclude((preIsInclude) => !preIsInclude);
	}, [isInclude, watchlistId]);

	useEffect(() => {
		setIsInclude(false);
	}, [exchange, symbol, watchlistId, firstKey]);
	return (
		<TouchableOpacity onPressIn={Keyboard.dismiss} onPress={curOnPress}>
			<View style={containerStyles}>
				<Text style={styles.title} numberOfLines={1}>
					{watchlistName}
				</Text>
				{renderIcon(isInclude)}
			</View>
		</TouchableOpacity>
	);
};

const AddToWLContent = React.forwardRef(
	({ symbol, exchange, refContent, firstKey }) => {
		if (!symbol || !exchange) return <View />;
		const [textSearch, setTextSearch] = useState('');

		const userWL = useSelector((state) => state.priceBoard.userPriceBoard);

		const txtCheck = _.toUpper(textSearch && textSearch.trim());
		const listUserWL = [];
		_.forEach(userWL, (item) => {
			const { watchlist_name: watchlistName, watchlist } = item;
			const nameCheck = _.toUpper(watchlistName);
			const idCheck = _.toUpper(watchlist);
			if (
				_.includes(nameCheck, txtCheck) ||
				_.includes(idCheck, txtCheck)
			) {
				listUserWL.push(item);
			}
		});

		useEffect(() => {
			reset();
			setSymbolInfo({ exchange, symbol });
			// setDicAdded(filterDicAdded({ userWL, symbol, exchange })) // Set dic added to model
		}, [userWL, symbol, exchange]);
		const syncDicAdd = useCallback((watchlistId) => {
			updateDicAdd({ watchlistId });
		}, []);
		const checkIsInclude = ({ watchlistId }) =>
			useCheckInclude({ watchlistId });
		useImperativeHandle(refContent, () => {
			return { setTextSearch };
		});

		renderItem = ({ item, index }) => {
			return (
				<Item
					symbol={symbol}
					exchange={exchange}
					data={item}
					key={item.watchlist}
					checkIsInclude={checkIsInclude}
					syncDicAdd={syncDicAdd}
					firstKey={firstKey}
				/>
			);
		};
		renderListEmptyComponent = () => {
			return (
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View
						style={{
							alignItems: 'center',
							justifyContent: 'center',
							flex: 1
						}}
					>
						<Text
							style={{
								color: CommonStyle.fontColor,
								fontFamily: CommonStyle.fontPoppinsRegular,
								fontSize: CommonStyle.fontSizeS
							}}
						>
							No Data{' '}
						</Text>
					</View>
				</TouchableWithoutFeedback>
			);
		};
		renderFooter = () => {
			return <View style={{ height: 88 }} />;
		};
		if (!listUserWL || !listUserWL.length) {
			return renderListEmptyComponent();
		}
		return (
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View
					onStartShouldSetResponder={() => {
						Keyboard.dismiss();
						console.info('onStartShouldSetResponder');
					}}
				>
					{listUserWL &&
						listUserWL.map((item, index) => {
							return renderItem({ item, index });
						})}
					{renderFooter()}
				</View>
			</TouchableWithoutFeedback>
		);
	}
);

const defaultContainer = {
	marginHorizontal: 8,
	marginTop: 8,
	padding: 16,
	borderRadius: 8,
	borderWidth: 1,
	flexDirection: 'row',
	alignItems: 'center'
};
const styles = {};
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			...defaultContainer,
			borderColor: CommonStyle.color.dusk
		},
		includeContainer: {
			...defaultContainer,
			borderColor: CommonStyle.color.borderAddWLSelected
		},
		title: {
			fontFamily: CommonStyle.fontPoppinsBold,
			fontSize: CommonStyle.font13,
			color: CommonStyle.fontWhite,
			flex: 1
		},
		boxSelected: {
			height: 24,
			width: 24,
			borderRadius: 12,
			justifyContent: 'center',
			alignItems: 'center'
		}
	});
	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

export default AddToWLContent;

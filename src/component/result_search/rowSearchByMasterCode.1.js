import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	Dimensions,
	TouchableOpacity,
	Keyboard,
	Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicon from 'react-native-vector-icons/Ionicons';

import Highlighter from 'react-native-highlight-words';
import { resultSearchNewOrderByMaster, checkParent } from '../../lib/base/functionUtil';
import Collapsible from '~/component/collapsible/';
import AddCodeDetail from '../../screens/addcode/addcode.detail.1';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import { func, dataStorage } from '../../storage';
import ENUM from '../../enum';
import XComponent from '../../component/xComponent/xComponent';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import RowComp from '~s/watchlist/EditWatchList/RowComponent';
import { calculateLineHeight } from '~/util'
const { height: HEIGHT } = Dimensions.get('window');

export class Row extends RowComp {
	renderLeftIcon() { }
	renderSortIcon() { }

	renderLeftComp(symbol, securityName) {
		return (
			<View style={{ flex: 1 }}>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsBold,
						fontSize: CommonStyle.fontSizeL,
						color: CommonStyle.fontColor
					}}
					numberOfLines={1}
				>
					<Highlighter
						highlightStyle={this.props.textSearch ? styles.colorHighlight : CommonStyle.fontColor}
						searchWords={[this.props.textSearch]}
						textToHighlight={symbol}
						style={{ opacity: 1 }}
					/>
				</Text>

				<Text
					numberOfLines={1}
					style={[{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS,
						color: CommonStyle.fontCompany
					}, Platform.OS === 'android' ? {
						lineHeight: calculateLineHeight(CommonStyle.fontSizeXS)
					} : {}]}
				>
					<Highlighter
						highlightStyle={this.props.textSearch ? styles.colorHighlight : CommonStyle.fontColor}
						searchWords={[this.props.textSearch]}
						textToHighlight={securityName}
						style={{ opacity: 1 }}
					/>
				</Text>
			</View>
		);
	}
}

export default class RowSearchByMasterCode extends XComponent {
	constructor(props) {
		super(props);
		this.isExpand = false
		this.state = {
			listData: [],
			isExpand: false,
			isOnPress: false
		};
	}

	componentWillReceiveProps(nextProps) {
		const { selectedClass, textSearch, data } = this.props;
		const {
			selectedClass: nextClass,
			textSearch: nextTextSearch
		} = nextProps;
		if (selectedClass !== nextClass || textSearch !== nextTextSearch) {
			this.setState({ isExpand: false });
		}
	}

	// set list data by master code and text search
	callbackSearch = this.callbackSearch.bind(this);
	callbackSearch(listData) {
		listData && this.setState({ listData });
	}

	_renderEmpty = () => (
		<View style={{ alignItems: 'center' }}>
			<Text>{'No data'}</Text>
		</View>
	);

	handleOnPressArrowButton = (isActive) => {
		this.setState({ isExpand: !isActive }, () => {
			!isActive &&
				setTimeout(() => {
					this.loadData();
				}, 100);
		})
	}
	renderArrowButton(isActive) {
		let content = null;
		if (isActive) {
			content = (
				<Ionicon
					name="ios-arrow-down"
					size={24}
					color={CommonStyle.colorIconSettings}
				/>
			);
		} else {
			content = (
				<Ionicon
					name="ios-arrow-forward"
					size={24}
					color={CommonStyle.colorIconSettings}
				/>
			);
		}

		return (
			<TouchableOpacityOpt
				hitSlop={{
					top: 8,
					left: 8,
					right: 8,
					bottom: 8
				}}
				style={{ width: 20, alignItems: 'center' }}
				timeDelay={ENUM.TIME_DELAY}
				onPress={() => this.handleOnPressArrowButton(isActive)}
			>
				{content}
			</TouchableOpacityOpt>
		);
	}

	renderLeftIcon(section) {
		const { textSearch, isSelected } = this.props;
		const isParent = checkParent(section);
		const { symbol, master_code: masterCode } = section || {};
		const { isExpand: isActive } = this.state;

		const result = [];
		if (isParent) {
			result.push(this.renderArrowButton(isActive));
		}

		result.push(
			<AddCodeDetail
				isSelected={isSelected}
				symbol={symbol}
				isParent={isParent}
				textSearch={textSearch}
				masterCode={masterCode}
			/>
		);

		return result;
	}

	// render row master code by text search
	_header(data) {
		const section = func.getSymbolObj(data.symbol) || data;
		const { textSearch } = this.props;
		return (
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'center',
					width: '100%'
				}}
			>
				<View style={styles.iconAddButton}>
					{this.renderLeftIcon(section)}
				</View>
				<View style={{ paddingLeft: 16, flex: 1 }}>
					<TouchableOpacity
						onPress={() => this._addAndRemoveSymbol(data.symbol)}
					>
						<Row data={data} textSearch={textSearch} />
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	_renderHeader = ({ onChange }) => {
		const { data } = this.props;
		if (!data.symbol) return null;
		return this._header(data);
	};
	// add and remove symbol
	_addAndRemoveSymbol = symbol => {
		Keyboard.dismiss();
		setTimeout(() => {
			this.props.addAndRemoveSymbol &&
				this.props.addAndRemoveSymbol(symbol);
		}, 200);
	};
	// render row list data by master code and text search
	_renderRowContent = ({ item }) => {
		return (
			<TouchableOpacity
				onPress={() => {
					this._addAndRemoveSymbol(item.symbol);
				}}
			>
				{this._header(item)}
			</TouchableOpacity>
		);
	};
	_renderContent = this._renderContent.bind(this);
	_renderContent() {
		const { listData } = this.state;
		if (!Array.isArray(listData)) return null
		if (listData.length === 0) return null;
		return (
			<FlatList
				ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
				data={listData}
				style={{ paddingLeft: 16, paddingTop: 8 }}
				extraData={this.state}
				renderItem={this._renderRowContent}
				keyExtractor={item => item.symbol}
				keyboardShouldPersistTaps="always"
				ListEmptyComponent={this._renderEmpty}
			/>
		);
	}
	//  get list data by master code and text search
	loadData() {
		const { textSearch, data } = this.props;
		const section = func.getSymbolObj(data.symbol) || data;
		cosnt = {
			display_name: displayName,
			symbol,
			class: classItem,
			master_code: masterCode,
			has_child: hasChild,
			security_name: securityName
		} = section;

		const cb = listData => this.callbackSearch(listData);
		let isPointTextSearch = false;
		if (textSearch.includes('.')) {
			classItem.includes(textSearch)
				? (isPointTextSearch = true)
				: (isPointTextSearch = false);
		} else {
			isPointTextSearch = true;
		}
		if (textSearch === null || textSearch === '') {
			isPointTextSearch = false;
		}

		resultSearchNewOrderByMaster({
			masterCode: symbol,
			textSearch,
			isPointTextSearch,
			cb
		});

		// if (changed) {
		// 	if (masterCode === null && classItem === 'future' && !hasChild) {
		// 		this.setState({ isExpand: true }, () => {

		// 		});
		// 	} else {
		// 		this.setState({
		// 			isExpand: false
		// 		});
		// 	}
		// } else {
		// 	this.setState({
		// 		isExpand: false
		// 	});
		// }
	}

	render() {
		return (
			<Collapsible
				listData={this.state.listData}
				isExpand={this.state.isExpand}
				renderHeader={this._renderHeader}
				renderContent={this._renderContent}
			/>
		);
	}
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
	containerHeader: {
		flexDirection: 'row',
		borderBottomColor: '#rgba(0, 0, 0, 0.12);',
		borderBottomWidth: 0.5,
		marginVertical: 10,
		marginHorizontal: 8
	},
	content: {
		marginLeft: 54,
		flexDirection: 'row'
	},
	containerHeaderActive: {
		height: HEIGHT / 14,
		flexDirection: 'row',
		marginTop: HEIGHT / 30
	},
	detailCode: {
		marginLeft: 5
	},
	textStyleContent: {
		fontSize: CommonStyle.fontSizeS,
		fontFamily: 'HelveticaNeue-Medium',
		fontWeight: '500',
		color: '#000000'
	},
	textColorSymbolContent: {
		color: '#000000'
	},
	textColorNameContent: {
		color: '#000000'
	},
	textStyleHeader: {
		fontSize: CommonStyle.fontSizeM,
		fontFamily: 'HelveticaNeue-Medium',
		fontWeight: '500',
		flex: 1,
		color: '#000000'
	},
	textStyleHeaderActive: {
		fontSize: CommonStyle.fontSizeM,
		fontFamily: 'HelveticaNeue-Medium',
		fontWeight: '500',
		flex: 1,
		color: '#359ee4'
	},
	colorHighlight: {
		color: CommonStyle.color.modify,
		opacity: 1
	},
	iconAddButton: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 24
	}
	// iconAddButtonParent: {
	//   paddingRight: 5,
	//   paddingLeft: 17,
	//   paddingVertical: 10,
	//   alignItems: 'center'
	// }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

import React, { Component } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	Platform,
	FlatList,
	TextInput,
	TouchableOpacity
} from 'react-native';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';

import { func, dataStorage } from '../../storage';
import CommonStyle from '~/theme/theme_controller';
import I18n from '../../modules/language';
import { searchResponse } from '../../lib/base/functionUtil';
import * as appActions from '../../app.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import NetworkWarning from '../../component/network_warning/network_warning.1';

import XComponent from '../../component/xComponent/xComponent';
import ProgressBar from '../../modules/_global/ProgressBar';
import ScrollBarUndeline from '~/component/scrollbar_underline/scrollbar_underline.1';
import ENUM from '../../enum';
import RowSearchByMasterCode from '../../component/result_search/rowSearchByMasterCode.1';
import * as Business from '~/business';
import Header from '~/component/headerNavBar';
import styles from '~s/find_watchlist/style/find_watchlist_style';

const {
	SYMBOL_CLASS,
	SYMBOL_CLASS_QUERY,
	SCREEN: { SEARCH_CODE }
} = ENUM;

export const SwapComponent = ({ style, ...props }) => {
	if (Platform.OS === 'ios') {
		return (
			<KeyboardAvoidingView
				behavior={'padding'}
				style={{
					backgroundColor: CommonStyle.backgroundColor,
					width: '100%',
					flex: 1,
					...style
				}}
				{...props}
			/>
		);
	} else {
		return (
			<View
				style={{
					backgroundColor: CommonStyle.backgroundColor,
					width: '100%',
					flex: 1,
					paddingLeft: 16,
					paddingRight: 16,
					...style
				}}
				{...props}
			/>
		);
	}
};

export class SearchCode extends XComponent {
	//  #region REACT AND DEFAULT FUNCTION
	bindAllFunc() {
		this.onNavigatorEvent = this.onNavigatorEvent.bind(this);
		this.callbackSearch = this.callbackSearch.bind(this);
		this.loadData = this.loadData.bind(this);
		this.searchSymbol = this.searchSymbol.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.renderFooter = this.renderFooter.bind(this);
		this.getClassQuery = this.getClassQuery.bind(this);
		this.onSelectSymbolClass = this.onSelectSymbolClass.bind(this);
	}

	init() {
		this.props.navigator.setOnNavigatorEvent &&
			this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
		this.dic = {
			selectedClass: SYMBOL_CLASS.ALL_TYPES,
			timeout: null,
			listSymbolClass: [
				{
					id: SYMBOL_CLASS.ALL_TYPES,
					label: I18n.t(SYMBOL_CLASS.ALL_TYPES),
					action: this.onSelectSymbolClass
				},
				{
					id: SYMBOL_CLASS.EQUITY,
					label: I18n.t(SYMBOL_CLASS.EQUITY),
					action: this.onSelectSymbolClass
				},
				{
					id: SYMBOL_CLASS.ETFS,
					label: I18n.t(SYMBOL_CLASS.ETFS),
					action: this.onSelectSymbolClass
				},
				{
					id: SYMBOL_CLASS.MF,
					label: I18n.t(SYMBOL_CLASS.MF),
					action: this.onSelectSymbolClass
				},
				{
					id: SYMBOL_CLASS.WARRANT,
					label: I18n.t(SYMBOL_CLASS.WARRANT),
					action: this.onSelectSymbolClass
				},
				{
					id: SYMBOL_CLASS.FUTURE,
					label: I18n.t(SYMBOL_CLASS.FUTURE),
					action: this.onSelectSymbolClass
				},
				{
					id: SYMBOL_CLASS.OPTION,
					label: I18n.t(SYMBOL_CLASS.OPTION),
					action: this.onSelectSymbolClass
				}
			],
			userId: func.getUserId(),
			textSearch: '',
			deviceModel: dataStorage.deviceModel,
			perf: new Perf(performanceEnum.show_form_add_code_search)
		};

		this.state = {
			isLoading: false,
			listData: []
		};
	}
	//  #endregion

	componentWillReceiveProps(nextProps) {
		if (
			!_.isEqual(this.props.priceBoardDetail, nextProps.priceBoardDetail)
		) {
			this.callbackSearch(
				this.state.listData,
				nextProps.priceBoardDetail
			);
		}
	}

	getClassQuery() {
		switch (this.dic.selectedClass) {
			case SYMBOL_CLASS.EQUITY:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.EQUITY];
			case SYMBOL_CLASS.ETFS:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ETFS];
			case SYMBOL_CLASS.MF:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.MF];
			case SYMBOL_CLASS.WARRANT:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.WARRANT];
			case SYMBOL_CLASS.FUTURE:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.FUTURE];
			default:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES];
		}
	}

	onSelectSymbolClass(selectedClass) {
		this.dic.selectedClass = selectedClass;
		if (!this.dic.textSearch) {
			this.loadData('');
		} else {
			this.loadData(this.dic.textSearch);
		}
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
		} else {
			switch (event.id) {
				case 'willAppear':
					setCurrentScreen(analyticsEnum.addCodeSearch);
					this.dic.perf &&
						this.dic.perf.incrementCounter(
							performanceEnum.show_form_add_code_search
						);
					this.dic.textSearch = '';
					this.setState({ isLoading: false });
					break;
				case 'didAppear':
					break;
				case 'willDisappear':
					break;
				case 'didDisappear':
					break;
				default:
					break;
			}
		}
	}

	callbackSearch(
		listData = [],
		priceBoardDetail = this.props.priceBoardDetail
	) {
		const obj = {};
		const { value = [] } = priceBoardDetail || {};
		_.forEach(value, ({ symbol }) => {
			obj[symbol] = true;
		});

		const newData = _.map(listData, data => ({
			...data,
			isSelected: obj[data.symbol]
		}));

		this.setState(
			{
				listData: newData,
				isLoading: false
			},
			() => {
				this.dic.perf && this.dic.perf.stop();
			}
		);
	}

	loadData(textSearch) {
		this.dic.perf = new Perf(performanceEnum.add_code_search);
		this.dic.perf && this.dic.perf.start();
		const cb = this.callbackSearch;
		const classQuery = this.getClassQuery();
		searchResponse({ textSearch, cb, classQuery });
	}

	searchSymbol(text = '') {
		this.dic.textSearch = text;
		if (text === '') {
			this.setState({ loadData: [], isLoading: false });
		} else if (text.length === 1) {
			this.setState({ isLoading: true });
		} else {
			this.setState({ isLoading: true });
			this.dic.timeout && clearTimeout(this.dic.timeout);
			this.dic.timeout = setTimeout(() => {
				this.loadData(text);
			}, 700);
		}
	}

	closeModal = this.closeModal.bind(this);
	closeModal() {
		this.props.navigator.dismissModal({
			animated: true,
			animationType: 'slide-down'
		});
	}

	onFocus = this.onFocus.bind(this);
	onFocus() {
		this.dic.textSearch = '';
		this.setState({ listData: [], isLoading: false });
	}

	renderFooter() {
		return (
			<View
				style={{
					width: '100%',
					borderTopWidth: 1,
					borderColor: CommonStyle.fontBorderGray,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			></View>
		);
	}

	renderLoading() {
		if (!this.state.isLoading) return null;
		return (
			<View
				style={{
					flex: 1,
					// backgroundColor: CommonStyle.backgroundColor,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<ProgressBar />
			</View>
		);
	}

	renderEmpty() {
		if (this.state.isLoading) return null;
		if (this.dic.textSearch !== '' && _.isEmpty(this.state.listData)) {
			return (
				<View
					style={{
						flex: 1,
						// backgroundColor: CommonStyle.backgroundColor,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<Text style={{ color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>
						{I18n.t('noData')}
					</Text>
				</View>
			);
		}
		return null;
	}

	renderItem = this.renderItem.bind(this);
	renderItem({ item, index }) {
		addAndRemoveSymbol = () => {
			const newData = JSON.parse(
				JSON.stringify(this.props.priceBoardDetail)
			);
			if (_.isEmpty(newData)) return;
			if (item.isSelected) {
				const newValue = newData.value || [];
				_.remove(newValue, ({ symbol }) => symbol === item.symbol);
				newData.value = newValue;
			} else {
				const value = newData.value || [];
				newData.value = _.concat([{ symbol: item.symbol }], value);
				let currentTime = new Date().getTime();
				newData.value.map(item => {
					item.rank = ++currentTime;
				});
				delete newData.init_time;
				newData.updated_time = currentTime;
				newData.user_id = dataStorage.user_id;
			}
			Business.updateUserPriceboard(
				this.props.priceBoardSelected,
				dataStorage.user_id,
				newData,
				true
			);
		};
		return (
			<RowSearchByMasterCode
				selectedClass={this.dic.selectedClass}
				data={item}
				isSelected={item.isSelected}
				textSearch={this.dic.textSearch}
				nameScreen={SEARCH_CODE}
				addAndRemoveSymbol={addAndRemoveSymbol}
			/>
		);
	}

	renderMainContent() {
		if (
			this.state.isLoading ||
			this.dic.textSearch === '' ||
			_.isEmpty(this.state.listData)
		) {
			return null;
		}

		return (
			<FlatList
				ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
				keyboardShouldPersistTaps={'always'}
				showsVerticalScrollIndicator={true}
				data={this.state.listData}
				style={{ padding: 16, backgroundColor: 'transparent' }}
				renderItem={this.renderItem}
			/>
		);
	}

	renderContent = this.renderContent.bind(this);
	renderContent() {
		return (
			<View
				style={{
					height: 42,
					flexDirection: 'row',
					alignItems: 'center',
					borderRadius: 8,
					marginVertical: 8,
					backgroundColor: CommonStyle.searchInputBgColor2,
					flex: 1
				}}
			>
				<Icon
					name="ios-search"
					size={17}
					color="#8e8e93"
					style={{ paddingLeft: 8 }}
				/>
				<View style={{ flex: 1, paddingHorizontal: 8 }}>
					<TextInput
						// selectionColor={CommonStyle.fontColor}
						testID="SearchInput"
						style={[
							styles.inputStyle,
							{
								fontSize: CommonStyle.fontSizeXS,
								fontFamily: CommonStyle.fontPoppinsRegular,
								lineHeight: Platform.OS === 'ios' ? 0 : 14,
								color: CommonStyle.fontColor
							}
						]}
						underlineColorAndroid="transparent"
						autoFocus={true}
						returnKeyType="search"
						placeholder={I18n.t('findSymbol')}
						placeholderTextColor={
							CommonStyle.searchPlaceHolderColor
						}
						onFocus={this.onFocus}
						onChangeText={this.searchSymbol}
						value={this.dic.textSearch}
					/>
				</View>

				<TouchableOpacity activeOpacity={1} onPress={this.onFocus}>
					<Icon
						testID="iconCancelSearchCode"
						name="ios-close-circle"
						style={CommonStyle.iconCloseLight}
					/>
				</TouchableOpacity>
			</View>
		);
	}

	render() {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColor1
				}}
			>
				<Header
					renderLeftComp={() => null}
					rightTitle={I18n.t('cancel')}
					onRightPress={() => this.closeModal()}
					rightStyles={{ flex: 0 }}
					renderContent={this.renderContent}
					style={{
						paddingTop: 16,
						paddingBottom: 8,
						paddingHorizontal: 16
					}}
				/>

				<NetworkWarning isConnected={this.props.isConnected} />

				<SwapComponent style={{ backgroundColor: 'transparent' }}>
					<View
						style={{
							width: '100%',
							flex: 1
						}}
					>
						<ScrollBarUndeline
							listItem={this.dic.listSymbolClass}
						/>
						{this.renderLoading()}
						{this.renderMainContent()}
						{this.renderEmpty()}
					</View>
				</SwapComponent>
			</View>
		);
	}
}

function mapStateToProps(state, ownProps) {
	const { priceBoardSelected, priceBoard, isLoading } = state.watchlist3;
	return {
		priceBoardDetail: priceBoard[priceBoardSelected] || {},
		isConnected: state.app.isConnected,
		priceBoardSelected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		action: bindActionCreators(appActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchCode);

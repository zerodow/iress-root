import React, { Component } from 'react';
import {
	View, Text, TextInput, ScrollView, TouchableOpacity, Keyboard, PixelRatio,
	KeyboardAvoidingView,
	Platform, Dimensions, ListView, FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FirebaseManager from '../../lib/base/firebase_manager';
import styles from './style/addcode';
import { func, dataStorage } from '../../storage';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language';
import { logAndReport, searchAndSort, searchResponse, logDevice, getDisplayName, isIphoneXorAbove } from '../../lib/base/functionUtil';
import deviceModel from '../../constants/device_model';
import { requestData, getSymbolUrl, addUserWatchList } from '../../api';
import * as appActions from '../../app.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import NetworkWarning from '../../component/network_warning/network_warning';
import XComponent from '../../component/xComponent/xComponent';
import ReviewAccountWarning from '../../component/review_account_warning/review_account_warning'
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import ProgressBar from '../../modules/_global/ProgressBar';
import count from '../../constants/news_count';
import ScrollBarUndeline from '../../component/scrollbar_underline/scrollbar_underline'
import ENUM from '../../enum'
import RowSearchByMasterCode from '../../component/result_search/rowSearchByMasterCode';
import * as Business from '../../business';
import SearchBarTextInput from '~/component/search_bar/search_bar_text_input'
const { SYMBOL_CLASS, SYMBOL_CLASS_QUERY, SCREEN: { SEARCH_CODE } } = ENUM
export class SearchCode extends XComponent {
	//  #region REACT AND DEFAULT FUNCTION
	bindAllFunc() {
		this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
		this.callbackSearch = this.callbackSearch.bind(this)
		this.loadData = this.loadData.bind(this)
		this.searchSymbol = this.searchSymbol.bind(this)
		this.closeModal = this.closeModal.bind(this)
		this.onFocus = this.onFocus.bind(this)
		this.renderFooter = this.renderFooter.bind(this)
		this.getClassQuery = this.getClassQuery.bind(this)
		this.onSelectSymbolClass = this.onSelectSymbolClass.bind(this)
	}

	init() {
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)

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
		}

		this.state = {
			isLoading: false,
			listData: []
		}
	}
	//  #endregion

	getClassQuery() {
		switch (this.dic.selectedClass) {
			case SYMBOL_CLASS.EQUITY:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.EQUITY]
			case SYMBOL_CLASS.ETFS:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ETFS]
			case SYMBOL_CLASS.MF:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.MF]
			case SYMBOL_CLASS.WARRANT:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.WARRANT]
			case SYMBOL_CLASS.FUTURE:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.FUTURE]
			case SYMBOL_CLASS.OPTION:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.OPTION]
			default:
				return SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES]
		}
	}

	onSelectSymbolClass(selectedClass) {
		this.dic.selectedClass = selectedClass
		if (!this.dic.textSearch) {
			this.loadData('')
		} else {
			this.loadData(this.dic.textSearch)
		}
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
		} else {
			switch (event.id) {
				case 'willAppear':
					setCurrentScreen(analyticsEnum.addCodeSearch);
					this.dic.perf && this.dic.perf.incrementCounter(performanceEnum.show_form_add_code_search);
					this.dic.textSearch = '';
					this.setState({ isLoading: false })
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

	callbackSearch(listData = []) {
		this.setState({
			listData,
			isLoading: false
		}, () => {
			this.dic.perf && this.dic.perf.stop();
		});
	}

	loadData(textSearch) {
		this.dic.perf = new Perf(performanceEnum.add_code_search);
		this.dic.perf && this.dic.perf.start();
		const cb = this.callbackSearch
		const classQuery = this.getClassQuery()
		searchResponse({ textSearch, cb, classQuery })
	}

	searchSymbol(text = '') {
		this.dic.textSearch = text
		if (text === '') {
			this.setState({ loadData: [], isLoading: false })
		} else if (text.length === 1) {
			this.setState({ isLoading: true })
		} else {
			this.setState({ isLoading: true })
			this.dic.timeout && clearTimeout(this.dic.timeout);
			this.dic.timeout = setTimeout(() => {
				this.loadData(text);
			}, 700)
		}
	}

	closeModal() {
		this.props.navigator.dismissModal({
			animated: true,
			animationType: 'slide-down'
		})
	}

	onFocus() {
		this.dic.textSearch = '';
		this.setState({ listData: [], isLoading: false })
	}

	renderFooter() {
		return (
			<View style={{ width: '100%', borderTopWidth: 1, borderColor: CommonStyle.fontBorderGray, justifyContent: 'center', alignItems: 'center' }}>
			</View>
		)
	}

	render() {
		const SwapComponent = Platform.OS === 'ios' ? KeyboardAvoidingView : View
		const props = Platform.OS === 'ios'
			? { behavior: 'padding', style: { backgroundColor: CommonStyle.backgroundColor, width: '100%', flex: 1 } }
			: { style: { backgroundColor: CommonStyle.backgroundColor, width: '100%', flex: 1, paddingLeft: 16, paddingRight: 16 } }
		return (
			<View style={{ flex: 1, alignItems: 'center', backgroundColor: CommonStyle.statusBarBgColor, paddingTop: dataStorage.platform === 'ios' ? (isIphoneXorAbove() ? 36 : 16) : 0 }}>
				<SearchBarTextInput
					onChangeText={this.searchSymbol}
					textSearch={this.dic.textSearch}
					onReset={this.onFocus.bind(this)}
					onDismissModal={this.closeModal.bind(this)}
					textRightButton={I18n.t('done')}
					onFocusInput={this.onFocus.bind(this)}

				/>
				{
					!this.props.isConnected ? <NetworkWarning /> : null
				}
				<SwapComponent {...props}>
					<View style={{ backgroundColor: CommonStyle.backgroundColor, width: '100%', flex: 1 }}>
						<ScrollBarUndeline listItem={this.dic.listSymbolClass} />
						{
							this.state.isLoading
								? <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
									<ProgressBar />
								</View>
								: this.state.listData && this.state.listData.length > 0
									? <FlatList
										ItemSeparatorComponent={() => (
											<View style={CommonStyle.separateLine} />
										)}
										ListFooterComponent={() => (
											<View style={CommonStyle.separateLine} />
										)}
										keyboardShouldPersistTaps={'always'}
										showsVerticalScrollIndicator={true}
										data={this.state.listData}
										renderItem={({ item, index }) => (
											<RowSearchByMasterCode
												selectedClass={this.dic.selectedClass}
												data={item}
												textSearch={this.dic.textSearch}
												nameScreen={SEARCH_CODE} />
										)} />
									: this.dic.textSearch === ''
										? null
										: <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor, justifyContent: 'center', alignItems: 'center' }}>
											<Text>{I18n.t('noData', { locale: this.props.setting.lang })}</Text>
										</View>
						}
					</View>
				</SwapComponent>
			</View>
		)
	}
}

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		action: bindActionCreators(appActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchCode);

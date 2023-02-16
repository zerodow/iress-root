import React from 'react';
import {
	View,
	Text,
	TextInput,
	Platform,
	TouchableOpacity,
	KeyboardAvoidingView,
	Keyboard,
	FlatList
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import Highlighter from 'react-native-highlight-words';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import CommonStyle from '~/theme/theme_controller';
import XComponent from '../../component/xComponent/xComponent';
import * as Util from '../../util';
import styles from './style/find_watchlist_style';
import I18n from '../../modules/language';
import { func } from '../../storage';
import NetworkWarning from '../../component/network_warning/network_warning.1';
import SCREEN from '~s/watchlist/screenEnum';
import WatchListActions from '~s/watchlist/reducers';
import Header from '~/component/headerNavBar';
import { Row } from '~s/watchlist/EditWatchList/RowComponent';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import ENUM from '~/enum';
import * as Controller from '~/memory/controller';

export class FindWatchlist extends XComponent {
	//  #region REACT AND DEFAULT FUNCTION
	bindAllFunc() {
		this.closeModal = this.closeModal.bind(this);
		this.getAllPriceboard = this.getAllPriceboard.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.getListPriceboardSearch = this.getListPriceboardSearch.bind(this);
		this.searchSymbol = this.searchSymbol.bind(this);
		this.onSelectPriceBoard = this.onSelectPriceBoard.bind(this);
	}

	init() {
		this.dic = {
			id: Util.getRandomKey(),
			isLogin: Controller.getLoginStatus(),
			textSearch: '',
			listUserPriceBoard: {},
			listStaticPriceboard: {},
			// listPersonalPriceboard: [],
			currentPriceboardId: func.getCurrentPriceboardId(),
			listHistory: []
		};
		this.state = {
			isHistory: true
		};
	}

	componentDidMount() {
		super.componentDidMount();

		this.getAllPriceboard();
		this.getAlertSearchHistory();
		this.setState();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}
	//  #endregion

	//  #region NAVIGATION
	closeModal() {
		Keyboard.dismiss();
		this.props.navigator.dismissModal({
			animated: true,
			animationType: 'slide-down'
		});
	}

	checkWLHistoryExist(dic, watchlist) {
		let exist = false;
		for (i = 0; i < dic.length; i++) {
			if (dic[i].watchlist === watchlist) {
				exist = true;
				break;
			}
		}
		return exist;
	}

	onSelectPriceBoard({ watchlist, watchlist_name: WLName }) {
		this.storeHistorySearch({ watchlist, watchlist_name: WLName });
		func.setCurrentPriceboardId(watchlist);
		this.props.changePriceBoardSelected(watchlist);
		this.props.setScreenActive(SCREEN.WATCHLIST);
		this.props.navigator.dismissModal({
			animated: true,
			animationType: 'slide-down'
		});
	}
	//  #endregion

	//  #region BUSINESS
	getAlertSearchHistory() {
		if (this.props.isConnected) {
			this.dic.listHistory = ManageHistorySearch.getHistorySearchWLPriceboard(
				5
			);
		}
		this.setState({
			isHistory: true
		});
	}

	storeHistorySearch({ watchlist, watchlist_name: WLName }) {
		// Nếu bấm vào history thì ko lưu history search
		if (!this.state.isHistory && this.dic.isLogin) {
			const checkWLExist = this.checkWLHistoryExist(
				this.dic.listHistory,
				watchlist
			);
			if (!checkWLExist) {
				// Lấy ra symbol cần lưu lại history, nếu là thằng con thì lưu thằng cha
				if (
					this.dic.listHistory.length <
					ENUM.NUMBER_HISTORY_SEARCH_WATCHLIST
				) {
					this.dic.listHistory.unshift({
						watchlist,
						watchlist_name: WLName
					});
				} else {
					this.dic.listHistory.pop();
					this.dic.listHistory.unshift({
						watchlist,
						watchlist_name: WLName
					});
				}
			} else {
				// Remove rồi add lên đầu
				if (
					this.dic.listHistory.length <
					ENUM.NUMBER_HISTORY_SEARCH_WATCHLIST
				) {
					this.dic.listHistory = this.dic.listHistory.filter(
						(item) => {
							return watchlist !== item.watchlist;
						}
					);
					this.dic.listHistory.unshift({
						watchlist,
						watchlist_name: WLName
					});
				} else {
					this.dic.listHistory = this.dic.listHistory.filter(
						(item) => {
							return watchlist !== item.watchlist;
						}
					);
					this.dic.listHistory.unshift({
						watchlist,
						watchlist_name: WLName
					});
				}
			}
			this.storeHistorySearchWLPriceboardLocal();
			this.storeHistorySearchWLPriceboardApi();
		}
	}

	storeHistorySearchWLPriceboardLocal() {
		ManageHistorySearch.storeHistorySearchWLPriceboardLocal(
			this.dic.listHistory
		);
	}

	storeHistorySearchWLPriceboardApi() {
		ManageHistorySearch.storeHistorySearchWlPriceboardApi();
	}

	getAllPriceboard() {
		this.dic.listUserPriceBoard = this.props.userPriceBoard;
		this.dic.listStaticPriceboard = this.props.staticPriceBoard;
	}

	getListPriceboardSearchHistory() {
		if (!this.dic.isLogin) return [];
		return this.dic.listHistory;
	}

	getListPriceboardSearch() {
		if (!this.dic.textSearch) {
			return this.getListPriceboardSearchHistory();
		}
		const searchResult = [];
		const addResultFunc = (item) => {
			const { watchlist_name: name } = item || {};
			const nameSearch = _.toUpper(name);
			const textSearch = _.toUpper(this.dic.textSearch);
			if (_.includes(nameSearch, textSearch)) {
				searchResult.push(item);
			}
		};
		_.forEach(this.dic.listUserPriceBoard, addResultFunc);
		_.forEach(this.dic.listStaticPriceboard, addResultFunc);

		return searchResult;
	}
	//  #endregion

	//  #region EVENT ELEMENT
	searchSymbol(txt = '') {
		this.dic.textSearch = txt;
		if (!txt) {
			return this.setState({
				isHistory: true
			});
		}
		return this.setState({
			isHistory: false
		});
	}
	//  #endregion

	renderLeftIcon(isCurrentPriceboard) {
		if (!isCurrentPriceboard || this.state.isHistory) return null;
		return (
			<Icon
				testID={`${this.dic.currentPriceboardId}_added`}
				name="md-checkmark"
				style={{
					color: CommonStyle.fontBlue1,
					fontSize: CommonStyle.fontSizeXXL,
					width: 32,
					marginTop: 3,
					textAlign: 'right',
					opacity: CommonStyle.opacity2
				}}
			/>
		);
	}

	renderTextDisplay(data, isCurrentPriceboard) {
		// this.dic.textSearch
		return (
			<Highlighter
				highlightStyle={{
					color: !this.state.isHistory
						? CommonStyle.fontBlue1
						: CommonStyle.fontColor
				}}
				searchWords={[this.dic.textSearch]}
				textToHighlight={data.watchlist_name}
				style={{
					fontSize: CommonStyle.fontSizeS,
					fontFamily: CommonStyle.fontPoppinsRegular,
					color:
						isCurrentPriceboard && !this.state.isHistory
							? CommonStyle.fontBlue1
							: CommonStyle.fontColor
				}}
			/>
		);
	}

	//  #region RENDER
	renderRow({ item: data }) {
		const isCurrentPriceboard =
			data.watchlist === this.dic.currentPriceboardId;
		return (
			<TouchableOpacity
				style={{ flex: 1 }}
				onPress={() => {
					console.log('DCM renderRow');
					this.onSelectPriceBoard(data);
				}}
				// disabled={isCurrentPriceboard}
			>
				<Row>
					{this.renderTextDisplay(data, isCurrentPriceboard)}
					<View
						style={{
							alignItems: 'flex-end',
							position: 'absolute',
							top: 10,
							right: 16
						}}
					>
						{this.renderLeftIcon(isCurrentPriceboard)}
					</View>
				</Row>
			</TouchableOpacity>
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
					color={CommonStyle.fontColor}
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
						placeholder={I18n.t('findWatchlist')}
						placeholderTextColor={
							CommonStyle.searchPlaceHolderColor
						}
						onChangeText={this.searchSymbol}
						value={this.dic.textSearch}
					/>
				</View>

				<TouchableOpacity
					activeOpacity={1}
					onPress={() => this.searchSymbol('')}
				>
					<Icon
						testID="iconCancelSearchCode"
						name="ios-close-circle"
						style={[CommonStyle.iconCloseLight, { marginRight: 8 }]}
					/>
				</TouchableOpacity>
			</View>
		);
	}

	renderHistoryBar() {
		return this.state.isHistory && this.dic.isLogin ? (
			<View
				style={{
					alignItems: 'center',
					flexDirection: 'row',
					marginVertical: 8,
					paddingLeft: 16,
					width: '100%'
				}}
			>
				<MaterialIcon
					name="history"
					size={24}
					style={{ color: CommonStyle.fontColor, paddingRight: 8 }}
				/>
				<Text style={CommonStyle.textSub}>{I18n.t('History')}</Text>
			</View>
		) : (
			<View style={{ height: 16 }} />
		);
	}

	renderMainContent() {
		const listSearchResult = this.getListPriceboardSearch();
		this.listSearchResult = listSearchResult;
		if (_.isEmpty(listSearchResult)) {
			return (
				<React.Fragment>
					{this.renderHistoryBar()}
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text style={CommonStyle.textNoData}>
							{I18n.t('noData')}
						</Text>
					</View>
				</React.Fragment>
			);
		}
		return (
			<React.Fragment>
				{this.renderHistoryBar()}
				<FlatList
					style={{
						paddingRight: 16,
						paddingLeft: 16,
						paddingBottom: 16,
						backgroundColor: 'transparent'
					}}
					ItemSeparatorComponent={() => (
						<View style={{ height: 8 }} />
					)}
					removeClippedSubviews={false}
					keyboardShouldPersistTaps="always"
					data={listSearchResult}
					renderItem={this.renderRow}
				/>
			</React.Fragment>
		);
	}

	render() {
		const SwapComponent = Util.isIOS() ? KeyboardAvoidingView : View;
		const props = Util.isIOS() ? { behavior: 'padding' } : {};

		return (
			<SwapComponent
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColor1
				}}
				{...props}
			>
				<Header
					renderLeftComp={() => null}
					rightTitle={I18n.t('cancel')}
					onRightPress={this.closeModal}
					rightStyles={{ flex: 0 }}
					renderContent={this.renderContent}
					style={{
						paddingTop: 16,
						paddingBottom: 8,
						paddingHorizontal: 16
					}}
				/>

				<NetworkWarning isConnected={this.props.isConnected} />
				{this.renderMainContent()}
			</SwapComponent>
		);
	}
	//  #endregion
}

function mapStateToProps(state) {
	return {
		userPriceBoard: state.priceBoard.userPriceBoard,
		staticPriceBoard: state.priceBoard.staticPriceBoard,
		setting: state.setting
	};
}

const mapDispatchToProps = (dispatch) => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p)),
	changePriceBoardSelected: (...p) =>
		dispatch.priceBoard.selectPriceBoard(...p)
});

export default connect(mapStateToProps, mapDispatchToProps)(FindWatchlist);

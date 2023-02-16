import React from 'react';
import {
	View,
	Text,
	TextInput,
	Platform,
	PixelRatio,
	TouchableOpacity,
	ListView,
	KeyboardAvoidingView,
	Keyboard
} from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import XComponent from '../../component/xComponent/xComponent';
import config from '../../config';
import Enum from '../../enum';
import * as Util from '../../util';
import styles from './style/find_watchlist_style';
import Icon from 'react-native-vector-icons/Ionicons';
import I18n from '../../modules/language';
import { func } from '../../storage';
import * as ManageNavigation from '../../manage_navigation';
import NetworkWarning from '../../component/network_warning/network_warning';
import * as FunctionUtil from '../../lib/base/functionUtil';
const SCREEN = Enum.SCREEN;
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE;
const LIST_PRICE_BOARD = Enum.LIST_PRICE_BOARD;
const PRICE_LIST_AU = Enum.PRICE_LIST_AU;
const PRICE_LIST_US = Enum.PRICE_LIST_US;
const ANIMATED_TYPE = Enum.ANIMATED_TYPE;
const CURRENT_SCREEN = SCREEN.FIND_WATCHLIST;

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
			textSearch: '',
			listPersonalPriceboard: [],
			currentPriceboardId: func.getCurrentPriceboardId()
		};
	}

	componentDidMount() {
		super.componentDidMount();

		this.getAllPriceboard();
		this.setState();
	}
	//  #endregion

	//  #region NAVIGATION
	closeModal() {
		Keyboard.dismiss();
		ManageNavigation.popAndClose(
			this.props.navigator,
			CURRENT_SCREEN,
			true,
			ANIMATED_TYPE.SLIDE_DOWN
		);
	}

	onSelectPriceBoard(data) {
		func.setCurrentPriceboardId(data.watchlist);
		ManageNavigation.startBacking(SCREEN.TRADE);
		ManageNavigation.popAndClose(
			this.props.navigator,
			CURRENT_SCREEN,
			true
		);
	}
	//  #endregion

	//  #region BUSINESS
	getAllPriceboard() {
		const listPersonalPriceboard = func.getAllPersonalPriceboard();
		listPersonalPriceboard.push(...func.getAllPriceboardAu());
		listPersonalPriceboard.push(...func.getAllPriceboardUs());
		this.dic.listPersonalPriceboard = listPersonalPriceboard;
	}

	getListPriceboardSearch() {
		if (!this.dic.textSearch) return [];
		const searchResult = [];
		this.dic.listPersonalPriceboard.map(item => {
			item.watchlist_name &&
				item.watchlist_name
					.toUpperCase()
					.includes(this.dic.textSearch.toUpperCase()) &&
				searchResult.push(item);
		});
		return searchResult;
	}
	//  #endregion

	//  #region EVENT ELEMENT
	searchSymbol(txt = '') {
		this.dic.textSearch = txt;
		this.setState();
	}
	//  #endregion

	//  #region RENDER
	renderRow(data) {
		const isCurrentPriceboard =
			data.watchlist === this.dic.currentPriceboardId;
		return (
			<View
				style={{
					height: CommonStyle.heightM,
					flex: 1,
					flexDirection: 'row',
					marginLeft: 16,
					alignItems: 'center',
					borderBottomWidth: 1,
					borderBottomColor: CommonStyle.fontBorderGray,
					justifyContent: 'flex-end'
				}}
			>
				<TouchableOpacity
					style={{ flex: 1 }}
					onPress={() => this.onSelectPriceBoard(data)}
					disabled={isCurrentPriceboard}
				>
					<Text
						style={{
							color: isCurrentPriceboard
								? CommonStyle.fontBlue
								: CommonStyle.fontColor
						}}
					>
						{data.watchlist_name}
					</Text>
				</TouchableOpacity>
				<View style={{ alignItems: 'flex-end', paddingHorizontal: 10 }}>
					{isCurrentPriceboard ? (
						<Icon
							testID={`${this.dic.currentPriceboardId}_added`}
							name="md-checkmark"
							style={{
								color: CommonStyle.fontBlue,
								fontSize: CommonStyle.fontSizeXXL,
								width: 32,
								marginTop: 3,
								textAlign: 'right',
								opacity: CommonStyle.opacity2
							}}
						/>
					) : (
						<View />
					)}
				</View>
			</View>
		);
	}

	render() {
		let widthSearch = PixelRatio.getFontScale() > 1 ? '65%' : '75%';
		let widthCancel = PixelRatio.getFontScale() > 1 ? '35%' : '25%';
		let widthTextCancel = '75%';
		let widthInputSearch = '80%';
		const listSearchResult = this.getListPriceboardSearch();
		const ds = new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		});
		const dataSource = ds.cloneWithRows(listSearchResult || []);
		const SwapComponent = Util.isIOS() ? KeyboardAvoidingView : View;
		const props = Util.isIOS() ? { behavior: 'padding' } : {};

		return (
			<SwapComponent
				style={{
					flex: 1,
					backgroundColor: CommonStyle.backgroundColor
				}}
				{...props}
			>
				<View
					style={{
						flex: 1,
						backgroundColor: CommonStyle.colorHeader,
						paddingTop:
							Platform.OS === 'ios'
								? FunctionUtil.isIphoneXorAbove()
									? 38
									: 16
								: 0
					}}
					testID="universalSearch"
				>
					<View style={CommonStyle.colorHeaderFindWatchlist}>
						<View
							style={[
								styles.searchBar2,
								{
									width: widthSearch,
									marginLeft: 8,
									borderRadius: 4,
									backgroundColor:
										CommonStyle.searchInputBgColor
								}
							]}
						>
							<Icon
								name="ios-search"
								style={[
									styles.iconSearch2,
									{ color: CommonStyle.fontColor }
								]}
							/>
							<TextInput
								ref="textInput"
								testID="universalSearchInput"
								// selectionColor={CommonStyle.fontColor}
								style={[
									{
										backgroundColor: 'transparent',
										color: CommonStyle.fontColor,
										fontSize: CommonStyle.fontSizeXS,
										fontFamily:
											CommonStyle.fontPoppinsRegular,
										width: widthInputSearch,
										paddingTop: 0,
										paddingBottom: 0
									}
								]}
								underlineColorAndroid="transparent"
								keyboardType={'default'}
								blurOnSubmit={true}
								autoFocus={true}
								placeholder={I18n.t('findWatchlist')}
								placeholderTextColor={CommonStyle.fontColor}
								onChangeText={this.searchSymbol}
								value={this.dic.textSearch}
							/>
							<Icon
								testID="iconCancelSearchCode"
								name="ios-close-circle"
								style={[CommonStyle.iconCloseLight]}
								onPress={() => this.searchSymbol('')}
							/>
						</View>

						<View
							testID="cancelUniversalSearch"
							style={[
								{ width: widthCancel, justifyContent: 'center' }
							]}
						>
							<TouchableOpacity
								style={{
									width: widthTextCancel,
									paddingVertical: 8
								}}
								testID="universalSearchCancel"
								onPress={this.closeModal}
							>
								<Text
									style={[
										styles.whiteText,
										{
											backgroundColor: 'transparent',
											textAlign: 'right',
											color: CommonStyle.fontColor
										}
									]}
								>
									{I18n.t('cancel', {
										locale: this.props.setting.lang
									})}
								</Text>
							</TouchableOpacity>
						</View>
					</View>
					{this.props.isConnected ? <View /> : <NetworkWarning />}

					<View
						style={{
							flex: 1,
							backgroundColor: CommonStyle.backgroundColor
						}}
					>
						{Util.arrayHasItem(listSearchResult) ? (
							<ListView
								removeClippedSubviews={false}
								keyboardShouldPersistTaps="always"
								dataSource={dataSource}
								renderRow={this.renderRow}
							/>
						) : (
							<View />
						)}
					</View>
				</View>
			</SwapComponent>
		);
	}
	//  #endregion
}

function mapStateToProps(state) {
	return {
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

export default connect(mapStateToProps)(FindWatchlist);

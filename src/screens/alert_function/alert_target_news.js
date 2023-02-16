import React from 'react'
import { Dimensions, FlatList, Image, Keyboard, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
// Util
import * as FunctionUtil from '../../lib/base/functionUtil'
// Storage
import ENUM from '../../enum'
// Image
import checkIcon from '../../img/checkIcon.png'
import unCheckIcon from '../../img/uncheckIcon.png'
// Style
import CommonStyle from '~/theme/theme_controller'
// Component
import XComponent from '../../component/xComponent/xComponent'
import Ionicons from 'react-native-vector-icons/Ionicons'
import I18n from '../../modules/language/'
import Dash from '../../component/dashed/dash'

const { TAG_NEWS_STRING_BY_KEY, TAG_NEWS_KEY_BY_STRING } = ENUM;
const { width, height } = Dimensions.get('window');

class RowTagNew extends XComponent {
	init() {
		this.dic = {};
		this.state = {
			check: this.props.check || false,
			disable: false,
			isSearch: false
		}
	}

	onPress({ keyTagNew, tagNew, check }) {
		this.props.onPress && this.props.onPress({ keyTagNew, tagNew, check })
	}

	componentDidMount() {
		/**
		 * When changing props from parents, this flatlist will re-render each item's row content,
		 * not all the list itself. This provides better performance when making the row items don't
		 * have to be mounted again and again. Therefore, the row component won't execute
		 * componentDidMount() and its state will be remained if there is no change.
		 */
		super.componentDidMount();
		const { tagNew, keyTagNew, check } = this.props
	}

	componentWillReceiveProps(nextProps) {
		return this.setState({
			check: nextProps.check || false
		})
	}

	renderIconCheck() {
		return this.state.check
			? <Image
				style={{ width: 20, height: 20, opacity: this.state.disable ? 0.54 : 1 }}
				source={checkIcon}
			/>
			: <Image
				style={[CommonStyle.btnRadioNewAlert, { opacity: this.state.disable ? 0.54 : 1 }
				]}
				source={unCheckIcon}
			/>
	}

	renderTagNew(tagNews) {
		return <Text
			numberOfLines={2}
			style={{
				width: '90%',
				marginLeft: 8,
				fontFamily: 'HelveticaNeue',
				fontSize: CommonStyle.fontSizeM,
				color: CommonStyle.fontColor
			}}>
			{tagNews}
		</Text>
	}

	render() {
		const { tagNew, keyTagNew, isAllNewsChecked } = this.props;
		const isDashed = tagNew === TAG_NEWS_STRING_BY_KEY['TradingHaltLifted'];
		const isDisabled = isAllNewsChecked && keyTagNew !== 'Everything';
		return (
			<React.Fragment>
				<TouchableOpacity
					onPress={() => {
						this.setState({
							check: !this.state.check
						}, () => {
							this.onPress({ keyTagNew, tagNew, check: this.state.check })
						})
					}}
					key={keyTagNew}
					disabled={isDisabled}
					style={[{
						marginHorizontal: 16,
						paddingVertical: 12,
						borderBottomWidth: isDashed ? 0 : 1,
						borderBottomColor: CommonStyle.fontBorderGray,
						alignItems: 'center',
						flexDirection: 'row',
						opacity: isDisabled ? 0.54 : 1
					}]}>
					{this.renderIconCheck()}
					{this.renderTagNew(tagNew)}
				</TouchableOpacity>

				{
					isDashed
						? <View style={{ marginHorizontal: 16, overflow: 'hidden' }}>
							<Dash
								dashColor={CommonStyle.fontBorderGray}
								dashLength={12}
								dashGap={4}
								width={width - 32}
								height={1} />
						</View>
						: null
				}
			</React.Fragment>
		)
	}
}

export default class TargetNews extends XComponent {
	init() {
		this.dic = {
			textSearch: '',
			dicTagNewsSelected: { ...this.props.dicTagNewsSelected } || { 'Everything': true },
			dicTagNews: TAG_NEWS_STRING_BY_KEY,
			timeoutSearch: null
		};
		this.state = {
			title: `${I18n.t('titleSelectTargetNewsUpper')} (${this.getCountTargetNew()})`,
			listTagNews: Object.keys(TAG_NEWS_STRING_BY_KEY),
			keyboardHeight: 0
		};
		this.dic.isAllNewsChecked = this.dic.dicTagNewsSelected.hasOwnProperty('Everything');
	}

	componentDidMount() {
		super.componentDidMount();
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
	}

	_keyboardDidShow(e) {
		const keyboardHeight = e.endCoordinates.height || 0;
		this.setState({ keyboardHeight })
	}

	_keyboardDidHide() {
		const keyboardHeight = 0;
		this.setState({ keyboardHeight })
	}

	getCountTargetNew() {
		let countTargetNew = Object.keys(this.dic.dicTagNewsSelected).length;
		if (this.dic.dicTagNewsSelected.hasOwnProperty('Everything')) {
			countTargetNew = Object.keys(this.dic.dicTagNews).length
		}
		return countTargetNew
	}

	updateCountTargetNew() {
		const countTargetNew = this.getCountTargetNew();
		this.setState({
			title: `${I18n.t('titleSelectTargetNewsUpper')} (${countTargetNew})`
		})
	}

	onPress({ keyTagNew, tagNew, check }) {
		// keyTagNew là enum gửi lên backend
		// tagNew là enum hiển thị trên frontend
		// this.dic.dicTagNewsSelected chỉ lưu lại dic những tag new nào được chọn, bỏ tích thì xoá
		if (check) {
			// Checked
			if (keyTagNew === 'Everything') {
				this.dic.isAllNewsChecked = true;
			}
			this.dic.dicTagNewsSelected[keyTagNew] = true
		} else {
			// Unchecked
			if (keyTagNew === 'Everything') {
				this.dic.isAllNewsChecked = false;
			}
			delete this.dic.dicTagNewsSelected[keyTagNew]
		}
		this.updateCountTargetNew()
	}

	onCancel() {
		this.props.onCancel && this.props.onCancel()
	}

	onDone() {
		this.props.onDone && this.props.onDone(this.dic.dicTagNewsSelected)
	}

	_onChangeText(text) {
		this.dic.timeoutSearch && clearTimeout(this.dic.timeoutSearch);
		this.dic.timeoutSearch = setTimeout(() => {
			this.search(text)
		}, 300)
	}

	search(text) {
		this.dic.textSearch = text;
		const defaultListTag = Object.keys(TAG_NEWS_STRING_BY_KEY);
		if (text !== undefined && text !== null) {
			if (text === '') {
				this.setState({
					listTagNews: defaultListTag
				})
			} else {
				const newData = defaultListTag.filter(item => {
					const tagNew = TAG_NEWS_STRING_BY_KEY[item].toLowerCase();
					const textSearch = text.toLowerCase();
					return tagNew.indexOf(textSearch) > -1;
				});
				this.setState({
					listTagNews: newData
				})
			}
		}
	}

	renderBackButton() {
		const backIcon = Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back';
		return <View
			testID="cancelTargetNews"
			style={[{ flex: 1, justifyContent: 'flex-start', paddingLeft: 8 }]}
		>
			<TouchableOpacity
				style={{}}
				testID="AlertTargetNewsBackBtn"
				onPress={this.onCancel}>
				<Ionicons color={CommonStyle.btnColor} size={30} name={backIcon} />
			</TouchableOpacity>
		</View>
	}

	renderTitle() {
		return <View style={{ flex: 4, justifyContent: 'center', alignItems: 'center' }}>
			<Text style={{
				fontFamily: 'HelveticaNeue-Medium',
				fontSize: CommonStyle.fontSizeM,
				color: CommonStyle.fontColor
			}}>{this.state.title}</Text>
		</View>
	}

	renderDone() {
		const disabled = Object.keys(this.dic.dicTagNewsSelected).length <= 0;
		return <TouchableOpacity
			disabled={disabled}
			style={[{
				flex: 1,
				paddingVertical: 8,
				paddingRight: 8,
				justifyContent: 'flex-end',
				alignItems: 'center',
				opacity: disabled ? 0.54 : 1
			}]}
			onPress={this.onDone}>
			<Text style={CommonStyle.whiteText}>{I18n.t('done')}</Text>
		</TouchableOpacity>
	}

	renderStatusBar() {
		return <View style={[
			CommonStyle.colorHeaderFindWatchlist,
			{
				paddingTop: Platform.OS === 'ios'
					? FunctionUtil.isIphoneXorAbove()
						? 38
						: 16
					: 0,
				height: FunctionUtil.isIphoneXorAbove()
					? 48 + 38
					: 48 + 16,
				marginTop: 0
			}]}>
			{this.renderBackButton()}
			{this.renderTitle()}
			{this.renderDone()}
		</View>
	}

	renderSearch() {
		return <TouchableOpacity
			style={{
				borderRadius: 5,
				width: '100%',
				height: 46,
				paddingVertical: 8,
				borderTopWidth: 1,
				borderTopColor: CommonStyle.fontBorderGray,
				borderBottomWidth: 1,
				borderBottomColor: CommonStyle.fontBorderGray
			}}>
			<View style={{
				marginHorizontal: 16,
				borderRadius: 5,
				borderWidth: 1,
				borderColor: CommonStyle.fontBorderGray,
				height: 30,
				alignItems: 'center',
				flexDirection: 'row'
			}}>
				<Ionicons name='ios-search' style={[CommonStyle.iconSearch, { marginHorizontal: 8 }]} />
				<TextInput
					ref={ref => (this.quickFilter = ref)}
					placeholder={I18n.t('quickFilter')}
					placeholderTextColor="#8e8e93"
					underlineColorAndroid="rgba(0,0,0,0)"
					numberOfLines={1}
					onChangeText={value => {
						this._onChangeText(value);
					}}
					// selectionColor={CommonStyle.fontColor}
					style={[{ paddingVertical: 0, width: '90%', height: 30, color: CommonStyle.fontColor }]}
					onSubmitEditing={this.login} />
			</View>
		</TouchableOpacity>
	}

	renderData() {
		if (this.dic.textSearch && this.state.listTagNews.length <= 0) return this.renderNoData();
		return this.renderListTag();
	}

	renderNoData() {
		return <View style={{
			flex: 1,
			backgroundColor: CommonStyle.backgroundColor,
			justifyContent: 'center',
			alignItems: 'center'
		}}>
			<Text style={{ color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>{I18n.t('noData')}</Text>
			{
				Platform.OS === 'android'
					? null
					: <View style={{ height: this.state.keyboardHeight, backgroundColor: 'transparent' }} />
			}
		</View>
	}

	renderListTag() {
		return <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
			<FlatList
				keyboardShouldPersistTaps={'always'}
				showsVerticalScrollIndicator={true}
				data={this.state.listTagNews}
				extraData={[this.state.listTagNews, this.dic.isAllNewsChecked]}
				renderItem={({ item, index }) => (
					this.renderItem(item, index)
				)} />
			{
				Platform.OS === 'android'
					? null
					: <View style={{ height: this.state.keyboardHeight, backgroundColor: 'transparent' }} />
			}
		</View>
	}

	renderItem(item) {
		const tagNew = this.dic.dicTagNews[item];
		return <RowTagNew
			key={item}
			onPress={this.onPress}
			tagNew={tagNew}
			check={this.dic.dicTagNewsSelected[item]}
			keyTagNew={item}
			isAllNewsChecked={this.dic.isAllNewsChecked} />
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
				{this.renderStatusBar()}
				{this.renderSearch()}
				{this.renderData()}
			</View>
		)
	}
}

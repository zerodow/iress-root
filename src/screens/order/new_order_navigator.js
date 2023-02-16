import React, { Component } from 'react'
import { View, Text, Platform, Dimensions, TouchableOpacity } from 'react-native';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import PropTypes from 'prop-types';
import { iconsMap as IconsMap } from '../../utils/AppIcons';
import { isIphoneXorAbove } from './../../lib/base/functionUtil';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Util from '../../util';
import * as Emitter from '@lib/vietnam-emitter';
import Enum from '../../enum';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Controller from '../../memory/controller'
import * as PureFunc from '~/utils/pure_func'
import Config from '../../config';
import I18n from '../../modules/language/';
import PickerCustom from './new_picker';
import ModalPicker from './../modal_picker/modal_picker';
import CustomButton from '../../component/custom_button/custom_button_watchlist'

const ICON_NAME = Enum.ICON_NAME;
const { width, height } = Dimensions.get('window');

export default class NewOrderNavigator extends Component {
	//  #region DEFINE PROPERTY
	static propTypes = {
		subTitle: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		selectedAccount: PropTypes.func.isRequired,
		listData: PropTypes.array.isRequired
	}

	//  #endregion

	constructor(props) {
		super(props);
		// this.props = Util.cloneFn(props);

		this.showModalPicker = this.showModalPicker.bind(this);
		this.selectedItem = this.selectedItem.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onLoading = this.onLoading.bind(this)
		this.onRefresh = this.onRefresh.bind(this)
		this.updateCurrentItem = this.updateCurrentItem.bind(this);

		this.state = { modalVisible: false, isLoadingPrice: false };
		this.currentItem = this.props.subTitle;
		this.listData = this.props.listData;
		this.id = Util.getRandomKey()

		this.props.updateCurrentItem && this.props.updateCurrentItem(this.updateCurrentItem);
		this.subLoadingPrice()
	}

	componentWillUnmount() {
		Emitter.deleteByIdEvent(this.id)
	}

	subLoadingPrice() {
		Emitter.addListener(
			this.props.channelLoadingOrder,
			this.id,
			this.onLoading
		);
	}

	onLoading(isLoadingPrice) {
		this.setState({
			isLoadingPrice
		})
	}

	selectedItem(item) {
		// this.setState({ modalVisible: false });
		this.currentItem = item;
		this.props.selectedAccount && this.props.selectedAccount(item);
		this.props.navigator && this.props.navigator.dismissModal({
			animated: true, // does the pop have transition animation or does it happen immediately (optional)
			animationType: 'none' // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
		});
	}

	showModalPicker() {
		// this.setState({ modalVisible: true });
		this.refChangeAccountView && this.refChangeAccountView.measure((x, y, w, h, pX, pY) => {
			this.props.navigator.showModal({
				screen: 'equix.PickerBottomV2',
				animated: false,
				animationType: 'none',
				navigatorStyle: {
					...CommonStyle.navigatorModalSpecialNoHeader,
					modalPresentationStyle: 'overCurrentContext'
				},
				passProps: {
					listItem: this.listData,
					title: I18n.t('titleSelectAlertType'),
					textBtnCancel: I18n.t('cancel'),
					onCancel: this.onClose,
					onSelect: this.selectedItem,
					onPressBackdrop: this.onClose,
					top: pY + h,
					height: h,
					value: this.currentItem,
					modalStyle: {
						marginRight: 0
					},
					pickerContentWrapper: {
						justifyContent: 'center'
					}
				}
			})
		})
	}

	onClose() {
		// this.setState({ modalVisible: false });
		this.props.navigator && this.props.navigator.dismissModal({
			animated: true, // does the pop have transition animation or does it happen immediately (optional)
			animationType: 'none' // 'fade' (for both) / 'slide-horizontal' (for android) does the pop have different transition animation (optional)
		});
		this.props.selectedAccount && this.props.selectedAccount(null);
	}

	componentWillUpdateProps(nextProps) {
		// this.props = Util.cloneFn(nextProps);
		this.setState({ modalVisible: false });
	}

	updateCurrentItem(value, listData) {
		this.currentItem = value;
		this.listData = Util.cloneFn(listData) || this.listData;
		this.setState({});
	}

	renderNavbarContent() {
		return (
			<View
				style={[
					{
						flexDirection: 'row',
						alignItems: 'center',
						position: 'absolute',
						top: Platform.OS === 'ios' ? isIphoneXorAbove() ? 38 : 16 : 0,
						right: 0,
						bottom: 0,
						left: 0
					}]}>
				<View style={{
					flexDirection: 'row',
					alignItems: 'flex-start'
				}}>
					{this.renderBackButton()}
					{this.renderTitle()}
				</View>
				{/* {this.renderRightIcon()} */}
			</View>
		);
	}

	renderDrawerIcon() {
		return <View
			testID="cancelAlertSearch"
			style={[{ marginHorizontal: 16 }]}
		>
			<TouchableOpacity
				style={{}}
				testID="AlertSearchDrawer"
				onPress={this.onClickDrawer}
			>
				<Icon color={CommonStyle.btnColor} size={30} name={'md-menu'} />
			</TouchableOpacity>
		</View>
	}

	onClickDrawer = () => {
		this.props.navigator.toggleDrawer({
			side: 'left',
			animated: true
		});
	}

	renderBackButton() {
		return (
			<TouchableOpacityOpt
				timeDelay={Enum.TIME_DELAY}
				hitSlop={{
					top: 16,
					left: 16,
					bottom: 16,
					right: 16
				}}
				style={{ paddingLeft: 16, justifyContent: 'flex-start', paddingRight: 20 }}
				onPress={this.backBtnFunc.bind(this)}
			>
				<Icon color={CommonStyle.fontColor} size={32} name={'ios-arrow-back'} />
			</TouchableOpacityOpt>
		);
	}

	backBtnFunc() {
		this.props.isNotShowMenu ? this.props.onCancelSearch() : this.props.backToSearch();
	}

	renderTitle() {
		return (
			<View style={{ flex: 4 }}>
				<Text
					style={{
						textAlign: 'left',
						fontSize: CommonStyle.font25,
						fontFamily: CommonStyle.fontPoppinsBold,
						color: CommonStyle.fontColor
					}}>
					{this.props.title}
				</Text>
				<View
					renderToHardwareTextureAndroid={true}
					ref={ref => this.refChangeAccountView = ref}
					style={{
						alignItems: 'center',
						flexDirection: 'row',
						paddingRight: 50
					}}>
					{
						this.state.modalVisible
							? <View />
							: (<Text
								ellipsizeMode={'middle'}
								numberOfLines={1}
								onPress={this.showModalPicker}
								style={CommonStyle.subTitle1}>
								{`${this.currentItem}`}
							</Text>)
					}
					{
						this.state.modalVisible
							? <View />
							: (<TouchableOpacityOpt
								timeDelay={Enum.TIME_DELAY}
								hitSlop={{
									top: 16,
									left: 16,
									bottom: 16,
									right: 16
								}}
							>
								<Icon
									name={ICON_NAME.MD_ARROW_DROPDOWN.IOS}
									size={20}
									color={CommonStyle.fontColor}
									onPress={this.showModalPicker}
									style={{ opacity: 0.4 }}
								/>
							</TouchableOpacityOpt>)
					}
				</View>
			</View>
		);
	}

	onRefresh() {
		this.props.c2r && this.props.c2r()
	}

	renderRightIcon() {
		const isStreaming = Controller.isPriceStreaming()
		return isStreaming
			? <View style={{ width: 48 }} />
			: <View
				style={[{ width: 48, marginRight: 16, alignItems: 'flex-end' }]}
			>
				{
					this.state.isLoadingPrice
						? <CustomButton
							style={{ paddingVertical: 6, alignItems: 'center', justifyContent: 'center' }}
							iconStyle={{ height: 32, width: 32, right: -14 }} />
						: <TouchableOpacity
							style={{}}
							testID="OrderSearchC2R"
							onPress={this.onRefresh}
						>
							<Icon
								color={CommonStyle.btnColor}
								size={30}
								name={'ios-refresh'} />
						</TouchableOpacity>
				}
			</View>
	}

	render() {
		return (<View style={{ flex: 1 }}>
			<View style={[
				// CommonStyle.navBarCustom,
				{
					flex: 1,
					flexDirection: 'row',
					marginTop: Platform.OS === 'ios' ? CommonStyle.marginSize - 4 : 0,
					alignItems: 'center',
					paddingLeft: CommonStyle.paddingDistance2,
					backgroundColor: CommonStyle.fontNearAlabaster,
					shadowColor: 'rgba(76,0,0,0)',
					shadowOffset: {
						width: 0,
						height: 0.5
					}
				},
				{
					paddingTop: Platform.OS === 'ios'
						? isIphoneXorAbove()
							? 38
							: 16
						: 0,
					// height: null,
					marginTop: 0,
					backgroundColor: CommonStyle.ColorTabNews,
					borderBottomRightRadius: CommonStyle.borderBottomRightRadius

				}]}>
				{this.renderNavbarContent()}
				<ModalPicker
					testID={`ModalPicker_modal`}
					listItem={this.listData || []}
					onSelected={this.selectedItem}
					selectedItem={this.currentItem}
					visible={this.state.modalVisible}
					title={I18n.t('selectAccount')}
					name='Account'
					onClose={this.onClose} />
			</View>
		</View>
		);
		// return (
		// 	<View style={[
		// 		CommonStyle.navBarCustom,
		// 		{
		// 			paddingTop: Platform.OS === 'ios'
		// 				? isIphoneXorAbove()
		// 					? 38
		// 					: 16
		// 				: 0,
		// 			height: isIphoneXorAbove()
		// 				? 48 + 38
		// 				: 48 + 16,
		// 			marginTop: 0
		// 		}]}>
		// 		{this.renderNavbarContent()}
		// 		<ModalPicker
		// 			testID={`ModalPicker_modal`}
		// 			listItem={this.listData || []}
		// 			onSelected={this.selectedItem}
		// 			selectedItem={this.currentItem}
		// 			visible={this.state.modalVisible}
		// 			title={I18n.t('selectAccount')}
		// 			name='Account'
		// 			onClose={this.onClose} />
		// 	</View>
	}
}

import React, { Component } from 'react';
import { View, Text, Dimensions, TouchableWithoutFeedback, TextInput, TouchableOpacity, Keyboard, PixelRatio, Platform, findNodeHandle, UIManager } from 'react-native';
import styles from './style/order';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { roundFloat, formatNumberNew2, logAndReport, formatNumberNew, checkPropsStateShouldUpdate } from '../../lib/base/functionUtil';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { dataStorage } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as pickerActions from './picker.actions';
import ModalPicker from './../modal_picker/modal_price_picker';
import { iconsMap } from '../../utils/AppIcons';
import Flag from '../../component/flags/flag'
import { Navigation } from 'react-native-navigation';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';

import * as Business from '../../business';
import * as Util from '../../util';
import I18n from '../../modules/language';
import Enum from '~/enum'
import { TYPE_PICKER } from './order'
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window');

const HEIGHT_PADDING = 16

export class PickerCustom extends Component {
	constructor(props) {
		super(props);
		this.state = {
			measurements: {},
			modalVisible: null,
			name: this.props.name || '',
			data: [],
			errorText: this.props.errorText || '',
			selectedValue: this.props.selectedValue || '',
			disabled: this.props.disabled || false
		}
		this.isFormatPrice = false;
		this.name = this.props.name;
		this.reMeasure = this.reMeasure.bind(this)
		this.props.scrollCallback && this.props.scrollCallback(this.reMeasure)
	}

	componentWillMount() {
		let data = this.props.data || [];
		let newData = [];
		data.forEach(element => {
			element && newData.push(element);
		});
		this.setState({ data: newData });
	}

	_onFocus(name) {
		if (this.props.name === 'Limit Price' || this.props.name === 'Stop Price' || this.props.name === 'Trailing Amount') {
			this.isFormatPrice = false
		}
	}

	formatPrice(price) {
		if (this.props.name === 'Limit Price' || this.props.name === 'Stop Price' || this.props.name === 'Trailing Amount') {
			this.setState({ selectedValue: formatNumberNew2(price, PRICE_DECIMAL.PRICE) }, () => {
				this.isFormatPrice = true
				dataStorage.isNewOrderChangeTextInput = false
			});
		}
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps && (nextProps.name !== this.state.name || nextProps.data !== this.state.data || nextProps.errorText !== this.state.errorText ||
			nextProps.selectedValue !== this.state.selectedValue || nextProps.disabled !== this.state.disabled)) {
			if (!dataStorage.formatLimitPrice && !dataStorage.formatStopPrice && this.isFormatPrice && (nextProps.name === 'Limit Price' || nextProps.name === 'Stop Price' || nextProps.name === 'Trailing Amount')) {
				this.setState({
					name: nextProps.name,
					data: nextProps.data,
					errorText: nextProps.errorText,
					disabled: nextProps.disabled
				}, () => {
					this.isFormatPrice = false
				});
			} else {
				this.setState({
					name: nextProps.name,
					data: nextProps.data,
					errorText: nextProps.errorText,
					selectedValue: (nextProps.name !== 'Volume' && nextProps.name !== 'Search' &&
						nextProps.name !== 'Condition' && nextProps.name !== 'Duration' &&
						nextProps.name !== 'Exchange' && nextProps.name !== 'OrderType' &&
						nextProps.name === this.name) ? (nextProps.name === 'Limit Price' ? dataStorage.formatLimitPrice : dataStorage.formatStopPrice) ? nextProps.selectedValue : formatNumberNew2(nextProps.selectedValue, PRICE_DECIMAL.PRICE) : nextProps.selectedValue,
					disabled: nextProps.disabled
				}, () => {
					if (nextProps.name === 'Limit Price') {
						dataStorage.formatLimitPrice = false;
					} else {
						dataStorage.formatStopPrice = false;
					}
				});
			}
		}
	}
	onValueChange(value) {
		try {
			if (value === '0') {
				value = this.state.data[0];
			}
			if (value === '--' && this.props.name !== 'Condition') {
				value = this.state.selectedValue;
			}
			if (this.state.name === 'Volume') {
				value = value.toString().replace(/,/g, '')
				value = parseFloat(value);
			}
			this.setState({ modalVisible: false }, () => {
				this.props.onValueChange && this.props.onValueChange(value)
				this.onClose()
			});
		} catch (error) {
			logAndReport('onValueChange picker exception', error, 'onValueChange picker');
		}
	}

	onShowModalPicker() {
		if (this.props.openSearch) {
			this.props.openSearch();
			return;
		}
		Keyboard.dismiss();
		this.handleShowModal()
	}

	onClose() {
		Navigation.dismissModal({
			animated: false,
			animationType: 'fade'
		})
	}

	shouldComponentUpdate(nextProps, nextState) {
		const listProps = ['selectedValue', 'isLoading'];
		const listState = ['modalVisible', 'name', 'data', 'disabled', 'errorText', 'selectedValue'];
		let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
		return check;
	}

	reMeasure() {
		this.meaSure()
	}

	meaSure = () => {
		this.view && this.view.measure((fx, fy, width, height, px, py) => {
			const topOrigin = py + height
			const len = (this.state.data && this.state.data.length) || 0
			const HEIGHT_MODAL = 48 * len
			if (HEIGHT_DEVICE - (py + height - HEIGHT_PADDING) < HEIGHT_MODAL) {
				this.topModal = topOrigin - HEIGHT_MODAL - height - HEIGHT_PADDING / 2;
			} else {
				this.topModal = topOrigin
			}
		})
	}
	handleShowModal = () => {
		this.props.getTop && this.props.getTop(this.props.type).then(({ top, height }) => {
			Navigation.showModal({
				screen: 'equix.PickerBottomV2',
				animated: false,
				animationType: 'none',
				navigatorStyle: {
					...CommonStyle.navigatorModalSpecialNoHeader,
					modalPresentationStyle: 'overCurrentContext'
				},
				passProps: {
					listItem: this.state.data,
					title: I18n.t('titleSelectTrigger'),
					textBtnCancel: I18n.t('cancel'),
					onCancel: this.onClose.bind(this),
					onSelect: this.onValueChange.bind(this),
					onPressBackdrop: this.onClose.bind(this),
					top: top,
					height: height,
					value: this.state.selectedValue,
					checkSelected: this.props.checkSelected

				}
			})
		})
	}
	render() {
		let iconPicker;
		let content = null;
		let value = this.state.selectedValue + ''
		let flagIcon = this.props.flagIcon
		if (this.props.editable) {
			content = (
				<TextInput
					onFocus={() => this._onFocus(this.props.name)}
					onBlur={() => this.formatPrice(this.state.selectedValue)}
					testID={`${this.props.testID}_textInput`}
					disabled={this.state.disabled}
					keyboardType='numeric'
					underlineColorAndroid='transparent'
					maxLength={15}
					value={value}
					style={[styles.selectedText, { color: this.state.visible ? '#10a8b2' : this.state.disabled ? CommonStyle.btnDisableBg : CommonStyle.fontColorButtonSwitch, textAlign: 'right' }]}
					onChangeText={this.props.onChangeText} />
			)
			// : (
			//     <View style={{ marginHorizontal: 16 }}>
			//       <Text testID={`${this.props.testID}_textInputDisable`} numberOfLines={1} style={[styles.selectedText, { color: this.state.visible ? '#10a8b2' : 'black', opacity: 0.3, top: 10 * CommonStyle.fontRatio }]}>{value}</Text>
			//     </View>
			//   );
			iconPicker = !this.state.disabled ? (
				<TouchableOpacityOpt timeDelay={Enum.TIME_DELAY} disabled={this.props.excuting} testID={`${this.props.testID}-showModalButton`} onPress={this.onShowModalPicker.bind(this, this.state.name)} style={{ marginLeft: 8 }}>
					{/* <Ionicons name='md-arrow-dropup' style={styles.iconPickerUp} /> */}
					<Ionicons name='md-arrow-dropdown' style={styles.iconPickerDown} />
				</TouchableOpacityOpt>
			) : (
					<View testID={`${this.props.testID}-showModalButton`} style={{ marginLeft: 8 }} >
						{/* <Ionicons name='md-arrow-dropup' style={[styles.iconPickerUp, { opacity: 0.3 }]} /> */}
						<Ionicons name='md-arrow-dropdown' style={[styles.iconPickerDown, { opacity: 0.3 }]} />
					</View>
				);
		} else {
			content = !this.state.disabled
				? (
					<TouchableOpacityOpt timeDelay={Enum.TIME_DELAY} disabled={this.props.excuting} style={{ flexDirection: 'row' }} onPress={this.onShowModalPicker.bind(this, this.state.name)}
					>
						{
							this.props.isHalt ? <Text style={[{ color: 'red', paddingLeft: Util.getValByPlatform(6, 16) }]}>! </Text> : <View></View>
						}
						<Text
							testID={`${this.props.testID}_text`}
							numberOfLines={1}
							style={[
								{
									color: this.state.visible
										? '#10a8b2'
										: CommonStyle.colorProduct,
									// top: 12 * CommonStyle.fontRatio,
									fontFamily: CommonStyle.fontPoppinsRegular,
									fontSize: CommonStyle.fontSizeXS
								},
								this.props.disableCapitalize
									? {}
									: { textTransform: this.props.textTransform || 'capitalize' }
							]}>{this.state.selectedValue}</Text>

					</TouchableOpacityOpt>
				)
				: (
					<TouchableOpacityOpt timeDelay={Enum.TIME_DELAY} disabled={true}>
						<Text
							testID={`${this.props.testID}_textDisable`}
							numberOfLines={1}
							style={[
								styles.selectedText4,
								{
									color: this.state.visible
										? '#10a8b2'
										: CommonStyle.fontColor,
									opacity: 0.3,
									top: 10 * CommonStyle.fontRatio,
									textAlign: 'right',
									paddingLeft: Util.getValByPlatform(6, 16)
								},
								this.props.disableCapitalize
									? {}
									: { textTransform: 'capitalize' }
							]}>{this.state.selectedValue}</Text>
					</TouchableOpacityOpt>
				)
			iconPicker = !this.state.disabled ? (
				<TouchableOpacityOpt timeDelay={Enum.TIME_DELAY} disabled={this.props.excuting} onPress={this.onShowModalPicker.bind(this, this.state.name)} style={{ marginLeft: 8 }}
				>
					<Ionicons testID={`${this.props.testID}-showModalButton`} name='md-arrow-dropdown' style={[styles.iconPicker]}
						onPress={this.onShowModalPicker.bind(this, this.state.name)} />
				</TouchableOpacityOpt>
			) : (<View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
				<Ionicons testID={`${this.props.testID}-showModalButton`} name='md-arrow-dropdown' style={[styles.iconPicker, { opacity: 0.3 }]} />
			</View>)
		}
		return (
			<View style={{ width: '100%' }}>
				<View onPress={() => Keyboard.dismiss()}
					testID={this.props.testID}
					ref={ref => this.view = ref}
					onLayout={() => this.meaSure()}
					style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 }}>
					{
						this.props.floatingLabel
							? (
								<Text testID={`${this.props.testID}-label`} style={[CommonStyle.textNewOrder, { fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor }]}>
									{this.props.floatingLabel}
								</Text>
							)
							: null
					}
					{
						(this.props.openSearch ||
							this.props.name === 'Condition' ||
							this.props.name === 'Exchange' ||
							this.props.name === 'Duration') ||
							this.props.name === 'OrderType'
							? <TouchableOpacityOpt timeDelay={Enum.TIME_DELAY} disabled={this.props.excuting}
								onPress={() => {
									this.props.openSearch && this.props.openSearch();
									!this.props.openSearch && this.onShowModalPicker();
								}} style={[styles.pickerContainer, { width: 216, height: 32, borderRadius: 15.5, borderWidth: 1, borderColor: CommonStyle.backgroundNewSearchBar, justifyContent: 'flex-end', paddingRight: 16 }]}>
								<View
									style={{ paddingLeft: 16, width: '80%', alignItems: 'flex-end' }}>
									{content}
								</View>
								{
									this.props.name === 'Search' && flagIcon !== '' ? <Flag style={{ marginLeft: 8 }} type={'flat'} code={flagIcon} size={18} /> : null
								}
								{(this.props.name === 'Limit Price' || this.props.name === 'Stop Price' || this.props.name === 'Volume' || this.props.name === 'Trailing Percent' || this.props.name === 'Trailing Amount') ? null : iconPicker}
							</TouchableOpacityOpt>
							: <View style={[
								styles.pickerContainer,
								{
									width: '50%',
									height: 32,
									borderWidth: 0.5,
									justifyContent: 'flex-end',
									borderRadius: 15.5,
									borderColor: CommonStyle.backgroundNewSearchBar
								}]}>
								{content}
							</View>
					}
				</View>
				{/* <ModalPicker testID={`${this.props.testID}_modal`}
					top={this.topModal}
					ratio={this.props.ratio}
					listItem={this.state.data}
					disableCapitalize={this.props.disableCapitalize}
					onSelected={this.onValueChange.bind(this)}
					selectedItem={this.state.selectedValue}
					visible={this.state.modalVisible}
					title={`${I18n.t('select')} ${this.props.floatingLabel}`}
					name={this.state.name}
					textTransform={this.props.textTransform}
					onClose={this.onClose.bind(this)}
					topHeight={this.props.topHeight}
				/> */}

			</View >
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		picker: state.picker
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(pickerActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(PickerCustom);

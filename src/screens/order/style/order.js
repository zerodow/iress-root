import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = {
		lastTradeContainer: {
			paddingVertical: 7,
			marginBottom: 16,
			width: '100%',
			backgroundColor: '#e6e6e6'
		},
		header: {
			backgroundColor: 'white',
			flexDirection: 'row',
			paddingLeft: 16,
			paddingRight: 16,
			height: 40,
			alignItems: 'center',
			justifyContent: 'center',
			width: '100%',
			marginBottom: -12
		},
		textMainNormalWhite: {
			...CommonStyle.textButtonColor,
			opacity: CommonStyle.opacity1
		},
		textKey: {
			...CommonStyle.textSub,
			fontSize: CommonStyle.fontSizeS
		},
		textValue: {
			...CommonStyle.textSubBlack,
			fontSize: CommonStyle.fontSizeM,
			fontWeight: '300'
		},
		headerContent: {
			height: 24,
			borderRadius: CommonStyle.borderRadius,
			backgroundColor: '#f8f8f8',
			width: '95%',
			alignItems: 'center',
			justifyContent: 'center'
		},
		loadingScreen: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: CommonStyle.backgroundColor,
			opacity: 1
		},
		rowExpand: {
			paddingLeft: 16,
			paddingRight: 16,
			paddingBottom: 10,
			width: '100%',
			flexDirection: 'row'
		},
		rowExpandWithBackground: {
			paddingLeft: 16,
			paddingRight: 16,
			paddingBottom: 10,
			width: '100%',
			flexDirection: 'row',
			backgroundColor: '#e6e6e6'
		},
		rowOfValue: {
			justifyContent: 'space-between',
			flexDirection: 'row',
			width: '100%'
		},
		expandLine: {
			flex: 1,
			// flexDirection: 'row',
			paddingVertical: 4
		},
		rowFooter: {
			backgroundColor: 'white',
			position: 'absolute',
			bottom: 0,
			left: 0,
			right: 0,
			paddingLeft: 16,
			paddingRight: 16,
			width: '100%',
			justifyContent: 'center'
		},
		midFooter: {
			borderLeftWidth: 2,
			borderRightWidth: 2,
			borderColor: 'rgba(97,97,97,0.12)',
			justifyContent: 'center',
			alignItems: 'center',
			flex: 1,
			paddingBottom: 3
		},
		columFooter: {
			justifyContent: 'center',
			alignItems: 'center',
			flex: 1,
			paddingBottom: 3
		},
		buttonExpand: {
			backgroundColor: 'white',
			flexDirection: 'row',
			// alignItems: 'center',
			justifyContent: 'center',
			width: '100%',
			paddingHorizontal: CommonStyle.paddingSize,
			paddingTop: CommonStyle.paddingSize,
			paddingBottom: 8
		},
		buttonSellBuy: {
			width: width - 32,
			// height: 36,
			paddingVertical: 8,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: CommonStyle.borderRadius,
			marginTop: 16,
			marginBottom: 8
		},
		selectedText: {
			backgroundColor: 'transparent',
			fontSize: CommonStyle.fontSizeS - 2,
			fontFamily: CommonStyle.fontMedium,
			opacity: CommonStyle.opacity1,
			width: '98%',
			height: 40 * CommonStyle.fontRatio,
			paddingHorizontal: 16
		},
		selectedText4: {
			backgroundColor: 'transparent',
			fontSize: CommonStyle.fontSizeM,
			fontFamily: CommonStyle.fontMedium,
			// opacity: CommonStyle.opacity1,
			// width: '100%',
			height: 40 * CommonStyle.fontRatio
		},
		selectedText2: {
			fontSize: CommonStyle.fontSizeM,
			fontFamily: CommonStyle.fontMedium,
			opacity: CommonStyle.opacity1,
			paddingRight: CommonStyle.paddingDistance2,
			width: '70%',
			height: 40 * CommonStyle.fontRatio
		},
		selectedText3: {
			fontSize: CommonStyle.fontSizeS,
			fontFamily: CommonStyle.fontLight,
			color: CommonStyle.fontColor,
			textAlign: 'right',
			height: 40,
			lineHeight: dataStorage.platform === 'ios' ? 38 : 30,
			opacity: CommonStyle.opacity2,
			width: '30%'
		},
		iconPicker: {
			width: 8 * CommonStyle.fontRatio,
			height: 16 * CommonStyle.fontRatio,
			fontSize: CommonStyle.iconSizeS * CommonStyle.fontRatio,
			lineHeight: 16 * CommonStyle.fontRatio,
			top: 1,
			textAlign: 'center',
			opacity: CommonStyle.opacity2,
			backgroundColor: 'transparent',
			color: CommonStyle.colorProduct
		},
		iconPickerUp: {
			width: 8 * CommonStyle.fontRatio,
			height: 16 * CommonStyle.fontRatio,
			fontSize: CommonStyle.iconSizeS * CommonStyle.fontRatio,
			lineHeight: 16 * CommonStyle.fontRatio,
			textAlign: 'center',
			top: 2,
			opacity: CommonStyle.opacity2,
			backgroundColor: 'transparent'
		},
		iconPickerDown: {
			width: 8 * CommonStyle.fontRatio,
			height: 16 * CommonStyle.fontRatio,
			fontSize: CommonStyle.iconSizeS * CommonStyle.fontRatio,
			lineHeight: 16 * CommonStyle.fontRatio,
			textAlign: 'center',
			top: 1,
			opacity: CommonStyle.opacity2,
			backgroundColor: 'transparent'
		},
		pickerContainer: {
			flexDirection: 'row',
			width: '100%',
			height: 26 * CommonStyle.fontRatio,
			alignItems: 'center',
			justifyContent: 'center'
		},
		rowPickerContainer: {
			width: '100%',
			paddingHorizontal: CommonStyle.paddingSize,
			flexDirection: 'row'
		},
		warningContainer: {
			width: '100%',
			height: 24,
			backgroundColor: 'rgba(254, 174, 0, 0.5)',
			alignItems: 'center',
			justifyContent: 'center'
		},
		errorContainer: {
			width: '100%',
			height: 24,
			backgroundColor: '#df0000',
			opacity: 0.8,
			alignItems: 'center',
			justifyContent: 'center'
		},
		searchBarContainer2: {
			height: 40,
			width: '100%',
			flexDirection: 'row',
			marginTop: CommonStyle.marginSize - 4,
			alignItems: 'center',
			paddingLeft: CommonStyle.paddingDistance2,
			backgroundColor: config.colorVersion,
			shadowColor: 'rgba(76,0,0,0)',
			shadowOffset: {
				width: 0,
				height: 0.5
			}
		},
		searchBar2: {
			backgroundColor: 'rgba(254, 254, 254, 0.2)',
			flex: 1,
			borderRadius: 4,
			height: 32,
			alignItems: 'center',
			flexDirection: 'row'
		},
		iconSearch2: {
			width: Platform.OS === 'ios' ? '10%' : '12%',
			color: 'rgba(255, 255, 255, 0.54)',
			fontSize: CommonStyle.iconSizeS,
			paddingRight: CommonStyle.paddingDistance2,
			paddingLeft: CommonStyle.paddingDistance2
		},
		iconRight2: {
			color: 'rgba(255, 255, 255, 0.7)',
			fontSize: CommonStyle.iconSizeS,
			width: '10%',
			textAlign: 'right',
			paddingRight: CommonStyle.paddingDistance2
		},
		inputStyle: {
			backgroundColor: 'transparent',
			width: Platform.OS === 'ios' ? '80%' : '78%',
			color: 'rgba(255, 255, 255, 087)',
			fontSize: CommonStyle.fontSizeS,
			fontFamily: CommonStyle.fontFamily,
			lineHeight: 12,
			height: 40
		},
		whiteText: {
			color: '#FFFFFF',
			fontSize: CommonStyle.fontSizeM,
			fontFamily: CommonStyle.fontFamily
		},
		buttonCancel: {
			flex: 2,
			justifyContent: 'center',
			alignItems: 'center'
		},
		buttonCancelClone: {
			justifyContent: 'center',
			alignItems: 'center',
			paddingLeft: 16.5
		},
		rowContainer: {
			backgroundColor: 'white',
			flexDirection: 'row',
			// height: CommonStyle.heightM,
			paddingVertical: 6,
			borderBottomWidth: 1,
			borderColor: '#0000001e',
			alignItems: 'center',
			marginHorizontal: 16
		},
		codeStyle: {
			fontSize: CommonStyle.fontSizeM,
			color: CommonStyle.fontColor,
			opacity: CommonStyle.opacity1,
			fontFamily: CommonStyle.fontFamily
		},
		companyStyle: {
			fontSize: CommonStyle.fontSizeS,
			color: CommonStyle.fontColor,
			opacity: CommonStyle.opacity2,
			fontFamily: CommonStyle.fontFamily
		},
		dot: {
			backgroundColor: 'grey',
			width: 5,
			height: 5,
			borderRadius: 2.5,
			marginLeft: 2,
			marginRight: 2
		},
		activeDot: {
			borderColor: 'grey',
			borderWidth: 1,
			backgroundColor: 'white',
			width: 5,
			height: 5,
			borderRadius: 2.5,
			marginLeft: 2,
			marginRight: 2
		},
		pagination: {
			flexDirection: 'row',
			justifyContent: 'center',
			width: '100%',
			marginBottom: 2
		},
		boldTitle: {
			width: '100%',
			paddingTop: 15,
			paddingBottom: 15,
			textAlign: 'center'
		},
		summary: {
			width: '100%',
			paddingBottom: 10,
			paddingTop: 10,
			paddingLeft: 16,
			paddingRight: 16,
			marginBottom: 10
		},
		confirmContent: {
			...this.summary,
			backgroundColor: '#e6e6e6'
		},
		dateInstructionModal: {
			container: {
				alignItems: 'center',
				backgroundColor: CommonStyle.backgroundColorNearDark,
				borderRadius: 8,
				marginHorizontal: 16,
				paddingTop: 32,
				paddingHorizontal: 24
			},
			instructionText: {
				container: {
					fontSize: CommonStyle.font17,
					color: CommonStyle.fontColor,
					textAlign: 'center',
					paddingHorizontal: CommonStyle.paddingDistance2
				},
				commonTextStyle: {
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontColor,
					fontSize: CommonStyle.fontSizeS,
					textAlign: 'center'
				}
			},
			buttonConfirm: {
				container: {
					textAlign: 'center',
					paddingHorizontal: CommonStyle.paddingDistance2,
					flexDirection: 'row',
					justifyContent: 'center',
					paddingVertical: 32
				},
				button: {
					container: {
						paddingTop: CommonStyle.paddingDistance1,
						paddingHorizontal: 130
					},
					text: {
						color: CommonStyle.fontApple,
						textAlign: 'center',
						fontSize: CommonStyle.font17,
						fontWeight: '500',
						width: '100%'
					}
				}
			}
		}
	};

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

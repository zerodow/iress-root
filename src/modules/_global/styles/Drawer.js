import { StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { func, dataStorage } from '../../../storage';

const { width, height } = Dimensions.get('window');

// const colors = ['#04A9B2', '#87D3D8', '#2C82BE', '#53A8E2', '#76DDFB', '#DBECF8', '#D2335C', '#FF9948', '#9DBF16']

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		mainAccount: {
			height: (width * 0.75 - 32) * 0.25,
			width: (width * 0.75 - 32) * 0.25,
			borderRadius: (width * 0.75 - 32) * 0.25 / 2,
			margin: CommonStyle.marginSize,
			marginLeft: 0,
			alignItems: 'center',
			justifyContent: 'center'
		},
		subAccount: {
			height: (width * 0.4 - 30) * 0.4,
			width: (width * 0.4 - 30) * 0.4,
			marginLeft: (width * 0.4 - 23) * 0.4 / 2,
			marginTop: 16,
			borderRadius: (width * 0.4 - 25) * 0.4 / 2,
			alignItems: 'center',
			justifyContent: 'center'
		},
		subAccount1: {
			height: (width * 0.4 - 30) * 0.4,
			width: (width * 0.4 - 30) * 0.4,
			borderRadius: (width * 0.4 - 25) * 0.4 / 2,
			alignItems: 'center',
			justifyContent: 'center'
		},
		mainShortCutName: {
			fontSize: CommonStyle.fontSizeXXL,
			fontFamily: CommonStyle.fontMedium,
			color: '#FFF'
		},
		subShortCutName: {
			fontSize: CommonStyle.fontSizeXL,
			fontFamily: CommonStyle.fontMedium,
			color: '#FFF'
		},
		iconLeft: {
			fontSize: CommonStyle.fontSizeXL,
			opacity: 0.87,
			width: 30,
			textAlign: 'center',
			color: CommonStyle.fontColor
		},
		iconSelected: {
			fontSize: CommonStyle.fontSizeXL,
			width: 30,
			textAlign: 'center',
			color: CommonStyle.btnOrderPositionBgColor
		},
		iconRight: {
			fontSize: CommonStyle.fontSizeXL,
			width: 25,
			textAlign: 'center',
			color: '#B9B9B9',
			position: 'absolute',
			right: 15
		},
		textRight: {
			color: CommonStyle.fontColor,
			opacity: CommonStyle.opacity1,
			fontSize: CommonStyle.fontSizeS,
			fontFamily: CommonStyle.fontMedium,
			paddingLeft: CommonStyle.paddingSize * 2
		},
		textRightDisabled: {
			color: CommonStyle.fontDisable,
			fontSize: CommonStyle.fontSizeS,
			fontFamily: CommonStyle.fontMedium,
			paddingLeft: CommonStyle.paddingSize * 2
		},
		textRightSelected: {
			color: '#10a8b2',
			opacity: CommonStyle.opacity1,
			fontSize: CommonStyle.fontSizeS,
			fontFamily: CommonStyle.fontMedium,
			paddingLeft: CommonStyle.paddingSize * 2
		},
		textLeft: {
			color: '#212121',
			fontWeight: 'bold',
			fontSize: CommonStyle.font13,
			paddingLeft: 15
		},
		rowContainer: {
			width: '100%',
			padding: CommonStyle.paddingSize,
			borderBottomWidth: 1,
			borderColor: '#0000001e'
		},
		rowContainerIOS: {
			width: '100%',
			paddingHorizontal: CommonStyle.paddingSize,
			borderBottomWidth: 1,
			borderColor: CommonStyle.seperateLineColor
		},
		midRowContainer: {
			width: '100%',
			height: height * 0.76 / 13,
			paddingVertical: 6,
			flexDirection: 'row',
			alignItems: 'center'
		},
		botRowContainer: {
			width: '100%',
			height: height * 0.76 / 13,
			paddingVertical: 6,
			flexDirection: 'row',
			alignItems: 'center'
		},
		userName: {
			color: 'white',
			width: '100%',
			fontWeight: 'bold',
			fontSize: CommonStyle.fontSizeS,
			fontFamily: CommonStyle.fontFamily,
			paddingHorizontal: 16
		},
		email: {
			color: 'white',
			fontSize: CommonStyle.fontSizeS,
			fontFamily: CommonStyle.fontFamily
		}
	});

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

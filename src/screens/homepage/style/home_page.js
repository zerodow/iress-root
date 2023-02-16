import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		headerTitle: {
			fontSize: CommonStyle.fontSizeXL,
			fontFamily: 'HelveticaNeue-Medium',
			textAlign: 'center',
			fontWeight: '500',
			color: '#efefef'
		},
		headerContent: {
			fontSize: CommonStyle.fontSizeM,
			fontFamily: 'HelveticaNeue',
			textAlign: 'left',
			color: '#efefef',
			marginHorizontal: 48,
			marginTop: 8
		},
		errorTxt: {
			textAlign: 'center',
			color: '#FFFFFF',
			fontSize: CommonStyle.fontSizeXS,
			fontFamily: 'HelveticaNeue-Light',
			marginHorizontal: 8,
			marginVertical: 8
		},
		wrapperErrorTxt: {
			backgroundColor: 'red',
			marginHorizontal: 48,
			borderRadius: 4
		},
		sendCodeButton: {
			borderRadius: 5,
			height: 48,
			backgroundColor: '#10a8b2',
			paddingHorizontal: 8,
			justifyContent: 'center',
			alignItems: 'center'
		},
		textBlue: {
			fontSize: CommonStyle.fontSizeS,
			color: CommonStyle.fontBlue,
			fontFamily: 'HelveticaNeue-Medium'
		},
		textWhite: {
			fontSize: CommonStyle.fontSizeS,
			color: CommonStyle.fontWhite,
			fontFamily: 'HelveticaNeue-Medium'
		},
		wrapperFlexEnd: {
			flex: 1,
			justifyContent: 'flex-end'
		},
		headerText: {
			color: '#efefef',
			textAlign: 'center',
			fontSize: CommonStyle.font22,
			fontFamily: 'HelveticaNeue'
		},
		textRequest: {
			color: '#efefef',
			textAlign: 'left',
			fontSize: CommonStyle.fontSizeL,
			fontFamily: 'HelveticaNeue',
			marginHorizontal: 48,
			marginTop: 8
		},
		textRemind: {
			color: '#efefef',
			textAlign: 'left',
			fontSize: CommonStyle.fontSizeL,
			fontFamily: 'HelveticaNeue',
			marginHorizontal: 48,
			marginTop: 8
		},
		wrapperText: {
			height: 20,
			justifyContent: 'flex-end'
		},
		homePageContainer: {
			flex: 1
		},
		homePageTopContent: {
			flex: 0.45
		},
		homePageContent: {
			flex: 0.1
		},
		homePageBotContent: {
			flex: 0.45,
			justifyContent: 'flex-end'
		},
		homePageWelcomeText: {
			textAlign: 'center',
			fontSize: CommonStyle.font30,
			fontFamily: 'HelveticaNeue-Medium',
			color: '#FFFFFF'
		},
		homePageDescription: {
			marginHorizontal: 16
		},
		homePageDescriptionText: {
			textAlign: 'center',
			fontFamily: 'HelveticaNeue-Medium',
			fontSize: CommonStyle.fontSizeXL,
			color: '#FFFFFF'
		},
		homePageRegister: {
			borderRadius: 5,
			height: 48,
			backgroundColor: '#10a8b2',
			marginHorizontal: 32,
			justifyContent: 'center',
			alignItems: 'center'
		},
		homePageRegisterText: {
			fontSize: CommonStyle.fontSizeXL,
			fontFamily: 'HelveticaNeue-Medium',
			color: '#FFFFFF',
			textAlign: 'center'
		},
		homePageGuestText: {
			textAlign: 'center',
			fontSize: CommonStyle.fontSizeL,
			fontFamily: 'HelveticaNeue-Medium',
			color: '#efefef'
		},
		homePageSignIn: {
			// flex: 1,
			backgroundColor: '#000000'
		},
		rightIcon: {
			height: 26,
			// width: '8%',
			width: 30,
			alignItems: 'flex-end',
			justifyContent: 'center',
			borderBottomColor: 'gray',
			borderBottomWidth: 1,
			paddingRight: 4
		},
		dialogInput: {
			width: '92%',
			paddingHorizontal: 4,
			height: 26,
			paddingVertical: 0,
			borderBottomColor: 'gray',
			borderBottomWidth: 1,
			color: 'rgba(0, 0, 0, 0.87)',
			fontFamily: CommonStyle.fontFamily,
			fontSize: CommonStyle.fontSizeXL
		},
		dialogInputClone: {
			flex: 1,
			paddingHorizontal: 4,
			height: 26,
			paddingVertical: 0,
			borderBottomColor: 'gray',
			borderBottomWidth: 1,
			color: 'rgba(0, 0, 0, 0.87)',
			fontFamily: CommonStyle.fontFamily,
			fontSize: CommonStyle.fontSizeXL
		},
		errorContainer: {
			marginHorizontal: 32,
			justifyContent: 'center'
		},
		forgotPasswordText: {
			fontSize: CommonStyle.fontSizeL,
			fontFamily: 'HelveticaNeue-Medium',
			color: '#efefef',
			textAlign: 'right',
			marginHorizontal: 32,
			opacity: 0.78
		}
	});

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

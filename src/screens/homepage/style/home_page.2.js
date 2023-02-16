import { StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

const styles = {};

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		headerTitle: {
			fontSize: CommonStyle.fontSizeXL,
			fontFamily: CommonStyle.fontPoppinsRegular,
			textAlign: 'center',
			fontWeight: '500',
			color: CommonStyle.authenticationVersion2.colorWhite
		},
		headerContent: {
			fontSize: CommonStyle.fontSizeM,
			fontFamily: CommonStyle.fontPoppinsRegular,
			textAlign: 'center',
			color: CommonStyle.authenticationVersion2.colorWhite,
			marginHorizontal: 48,
			marginTop: 8,
			marginBottom: 5
		},
		errorTxt: {
			textAlign: 'center',
			color: CommonStyle.fontWhite,
			fontSize: CommonStyle.fontSizeXS,
			fontFamily: CommonStyle.fontPoppinsRegular,
			marginHorizontal: 8,
			marginVertical: 8
		},
		wrapperErrorTxt: {
			backgroundColor: 'red',
			marginHorizontal: 48,
			borderRadius: 4
		},
		sendCodeButton: {
			borderRadius: 18,
			height: 36,
			backgroundColor: CommonStyle.authenticationVersion2.colorBlue,
			paddingHorizontal: 8,
			justifyContent: 'center',
			alignItems: 'center'
		},
		textBlue: {
			fontSize: CommonStyle.fontSizeS,
			color: CommonStyle.authenticationVersion2.colorBlue,
			fontFamily: CommonStyle.fontPoppinsRegular
		},
		textWhite: {
			fontSize: CommonStyle.fontSizeS,
			color: CommonStyle.fontWhite,
			fontFamily: CommonStyle.fontPoppinsRegular
		},
		wrapperFlexEnd: {
			flex: 1,
			justifyContent: 'flex-end'
		},
		headerText: {
			color: CommonStyle.authenticationVersion2.colorWhite,
			textAlign: 'center',
			fontSize: CommonStyle.font22,
			fontFamily: CommonStyle.fontPoppinsRegular
		},
		textRequest: {
			color: CommonStyle.authenticationVersion2.colorWhite,
			textAlign: 'left',
			fontSize: CommonStyle.fontSizeL,
			fontFamily: CommonStyle.fontPoppinsRegular,
			marginHorizontal: 48,
			marginTop: 8
		},
		textRemind: {
			color: CommonStyle.authenticationVersion2.colorWhite,
			textAlign: 'left',
			fontSize: CommonStyle.fontSizeL,
			fontFamily: CommonStyle.fontPoppinsRegular,
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
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.fontWhite
		},
		homePageDescription: {
			marginHorizontal: 16
		},
		homePageDescriptionText: {
			textAlign: 'center',
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeM,
			color: CommonStyle.fontWhite
		},
		homePageRegisterContainer: {
			// backgroundColor: '#000000'
		},
		homePageRegister: {
			marginBottom: 56,
			marginHorizontal: 32,
			borderRadius: 26,
			borderWidth: 1,
			borderColor: CommonStyle.authenticationVersion2.colorBlue,
			backgroundColor: 'transparent',
			height: 52,
			justifyContent: 'center',
			alignItems: 'center'
		},
		homePageRegisterText: {
			fontSize: CommonStyle.fontSizeM,
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.fontWhite,
			textAlign: 'center'
		},
		homePageGuestText: {
			textAlign: 'center',
			fontSize: CommonStyle.fontSizeS,
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.authenticationVersion2.colorWhite
		},
		homePageSignIn: {
			borderRadius: 26,
			height: 52,
			backgroundColor: CommonStyle.authenticationVersion2.colorBlue,
			marginHorizontal: 32,
			justifyContent: 'center',
			alignItems: 'center'
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
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeM
		},
		dialogInputClone: {
			flex: 1,
			paddingHorizontal: 4,
			height: 26,
			paddingVertical: 0,
			borderBottomColor: 'gray',
			borderBottomWidth: 1,
			color: 'rgba(0, 0, 0, 0.87)',
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeM
		},
		errorContainer: {
			marginHorizontal: 32,
			justifyContent: 'center'
		},
		forgotPasswordText: {
			fontSize: CommonStyle.fontSizeL,
			fontFamily: CommonStyle.fontPoppinsRegular,
			color: CommonStyle.authenticationVersion2.colorWhite,
			textAlign: 'right',
			marginHorizontal: 32,
			opacity: 0.78
		},
		signInScreenButtons: {
			flex: 0.5,
			height: 52,
			justifyContent: 'center',
			alignItems: 'center'
		},
		signInScreenMainButtons: {
			marginHorizontal: 48,
			borderRadius: 26,
			borderWidth: 1,
			borderColor: CommonStyle.authenticationVersion2.colorBlue,
			height: 52,
			justifyContent: 'center',
			alignItems: 'center'
		}
	});

	PureFunc.assignKeepRef(styles, newStyle);
}

getNewestStyle();
register(getNewestStyle);

export default styles;

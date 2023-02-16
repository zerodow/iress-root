import style from './style'
import config from './config'
import { PixelRatio, Dimensions, Platform } from 'react-native';
import { dataStorage } from './storage';

const { width, height } = Dimensions.get('window');

export default {
    constStyle: style,
    fontWhite: style.fontWhite,
    hugoText: {
        opacity: style.opacity1,
        fontSize: CommonStyle.font32,
        fontFamily: style.fontFamily,
        color: style.fontColor
    },
    fontLargeNormal: {
        fontSize: style.fontSizeL,
        fontFamily: style.fontFamily,
        color: style.fontColor
    },
    fontLargeNormal1: {
        fontSize: style.fontSizeL,
        fontFamily: style.fontFamily,
        color: style.fontColor,
        opacity: style.opacity1
    },
    fontLargeMedium: {
        fontSize: style.fontSizeL,
        fontFamily: style.fontMedium
    },
    textButtonColor: {
        fontSize: style.fontSizeM,
        color: 'white',
        fontFamily: style.fontFamily
    },
    textButtonColorS: {
        fontSize: style.fontSizeS,
        color: 'white',
        fontFamily: style.fontFamily
    },
    borderBottomMarginLeft: {
        borderStyle: 'solid',
        marginLeft: 16,
        paddingRight: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#0000001e'

    },
    borderBottomPaddingHorizontal: {
        borderStyle: 'solid',
        marginHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#0000001e'
    },
    tagLabel: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeXS - 1,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF'
    },
    textGiant: {
        opacity: style.opacity1,
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeXL,
        color: style.fontColor
    },
    textMain: {
        opacity: style.opacity1,
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM,
        color: style.fontColor
    },
    textTitleDialog: {
        opacity: style.opacity1,
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM + 1,
        color: style.fontColor,
        fontWeight: '500'
    },
    textDescDialog: {
        opacity: style.opacity1,
        fontFamily: style.fontFamily,
        fontSize: style.font13,
        color: style.fontColor
    },
    textMain2: {
        opacity: style.opacity1,
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM - 1,
        color: style.fontColor
    },
    textMainLightNoColor: {
        opacity: style.opacity1,
        fontFamily: style.fontLight,
        fontSize: style.fontSizeM
    },
    textMainLight: {
        opacity: style.opacity1,
        fontFamily: style.fontLight,
        fontSize: style.fontSizeM,
        color: style.fontColor
    },
    textMainRed: {
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM,
        color: style.fontRed
    },
    textMainWhiteOpacity: {
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM,
        color: 'white',
        opacity: 0.7
    },
    textMainWhite: {
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM,
        color: 'white'
    },
    textMainNormal: {
        opacity: style.opacity1,
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeM,
        color: style.fontColor
    },
    textMainNormalNoColorOpacity: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeM
    },
    textMainNormalDisabled: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeM,
        color: '0000001e'
    },
    textMainNormalNoColor: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeM
    },
    textMainNormalWhite: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeM,
        color: 'white'
    },
    textSubLightWhite: {
        fontFamily: style.fontLight,
        fontSize: style.fontSizeS,
        color: 'white'
    },
    textMainNoColor: {
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM
    },
    textMainLightMedium: {
        fontFamily: style.fontLight,
        fontSize: style.fontSizeM,
        fontWeight: '300'
    },
    textMainLightOpacity: {
        fontFamily: style.fontLight,
        fontSize: style.fontSizeM,
        opacity: style.opacity2,
        color: '#000000dd'
    },
    textSub: {
        opacity: style.opacity2,
        fontFamily: style.fontLight,
        fontSize: style.fontSizeS,
        color: style.fontColor
    },
    textSubBold: {
        opacity: style.opacity2,
        fontFamily: style.fontBold,
        fontSize: style.fontSizeS,
        color: style.fontColor
    },
    textSubNormal: {
        opacity: style.opacity2,
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeS,
        color: style.fontColor
    },
    textSubNormalBlack: {
        opacity: style.opacity1,
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeS,
        color: style.fontColor
    },
    textSubBlack: {
        opacity: style.opacity1,
        fontFamily: style.fontLight,
        fontSize: style.fontSizeS,
        color: style.fontColor
    },
    textSubWhite: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeS,
        color: 'white'
    },
    textSubRed: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeS,
        color: style.fontRed
    },
    textSubYellow: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeS,
        color: style.fontYellow
    },
    textSubNoColor: {
        fontFamily: style.fontLight,
        fontSize: style.fontSizeS
    },
    textSubNormalNoColor: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeS
    },
    textSubMedium: {
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeS,
        opacity: style.opacity1,
        color: style.fontColor
    },
    textSubMediumWhite: {
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeS,
        color: 'white'
    },
    textSubGreen: {
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeS,
        color: style.fontBlue
    },
    textMainHeader: {
        opacity: style.opacity1,
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeXS,
        color: style.fontColor
    },
    textMainHeaderOpacity2: {
        opacity: style.opacity2,
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeXS,
        color: style.fontColor
    },
    textSubHeader: {
        opacity: style.opacity2,
        fontFamily: style.fontFamily,
        fontSize: style.fontTiny,
        color: style.fontColor
    },
    textSubHeaderNoColor: {
        fontFamily: style.fontFamily,
        fontSize: style.fontTiny
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderColor: '#0000001e'
    },
    borderTop: {
        borderTopWidth: 1,
        borderColor: '#0000001e'
    },
    borderAbove: {
        borderTopWidth: 1,
        borderColor: '#0000001e',
        marginLeft: 16,
        marginRight: 16
    },
    borderBelow: {
        height: 1,
        backgroundColor: '#0000001e',
        marginLeft: 16,
        marginRight: 16
    },
    borderBelow2: {
        borderBottomWidth: 1,
        borderBottomColor: '#0000001e',
        marginHorizontal: 16
    },
    progressBarWhite: {
        backgroundColor: 'white',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressBarWhiteHeight: {
        backgroundColor: 'white',
        height: 48,
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressBarBlue: {
        backgroundColor: style.fontBlue,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textFloatingLabel: {
        opacity: style.opacity2,
        fontFamily: style.fontLight,
        fontSize: style.fontSizeXS,
        color: style.fontColor
    },
    label: {
        // opacity: style.opacity2,
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM,
        color: 'black',
        fontWeight: '700'
    },
    labelFromMenu: {
        // opacity: style.opacity2,
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeM,
        color: 'black',
        fontWeight: '700'
    },
    textFloatingLabel2: {
        opacity: style.opacity2,
        fontFamily: style.fontLight,
        fontSize: style.fontSizeXS,
        color: style.fontColor,
        // marginTop: -14,
        marginRight: 16
    },
    textFloatingLabelWhite: {
        opacity: style.opacity2,
        fontFamily: style.fontLight,
        fontSize: style.fontSizeXS,
        color: 'white'
    },
    textExtra: {
        fontFamily: style.fontLight,
        fontSize: style.fontSizeXS,
        color: style.fontColor
    },
    textExtraNoColor: {
        fontFamily: style.fontLight,
        fontSize: style.fontSizeXS
    },
    textExtraOpacity: {
        opacity: style.opacity1,
        fontFamily: style.fontLight,
        fontSize: style.fontSizeXS,
        color: style.fontColor
    },
    textTinyMedium: {
        opacity: style.opacity1,
        fontFamily: style.fontMedium,
        fontSize: style.fontSizeXS,
        color: style.fontColor
    },
    textError: {
        fontFamily: style.fontLight,
        fontSize: style.fontSizeXS,
        color: style.fontRed
    },
    textError2: {
        textAlign: 'center',
        fontFamily: style.fontLight,
        fontSize: style.fontSizeS - 1,
        color: style.fontRed
    },
    textFilter: {
        fontFamily: style.fontFamily,
        fontSize: style.font13,
        color: style.fontBlue,
        letterSpacing: -0.1
    },
    giantText: {
        opacity: style.opacity1,
        fontFamily: style.fontFamily,
        fontSize: style.fontSizeXL,
        color: style.fontColor
    },
    searchBarContainer: {
        height: 44,
        paddingLeft: style.paddingDistance2,
        paddingRight: style.paddingDistance2,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: '#0000001e',
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    searchBar: {
        borderWidth: 1,
        borderColor: '#0000001e',
        height: 30,
        borderRadius: style.borderRadius,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconSearch: {
        color: '#8e8e93',
        fontSize: style.iconSizeS,
        paddingRight: style.paddingDistance2
    },
    searchPlaceHolder: {
        color: '#8e8e93',
        fontSize: style.fontSizeS,
        fontFamily: style.fontFamily
    },
    searchPlaceHolderMedium: {
        color: '#8e8e93',
        fontSize: style.fontSizeS,
        fontFamily: style.fontMedium
    },
    navigatorStyle: {
        navBarBackgroundColor: config.background.navigation,
        navBarTranslucent: false,
        drawUnderNavBar: true,
        navBarHideOnScroll: false,
        navBarTextColor: config.color.navigation,
        navBarTextFontFamily: 'HelveticaNeue-Medium',
        navBarTextFontSize: 18,
        navBarTransparent: true,
        navBarButtonColor: config.button.navigation,
        statusBarColor: config.background.statusBar,
        statusBarTextColorScheme: 'light',
        drawUnderTabBar: false,
        navBarNoBorder: true,
        tabBarHidden: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
    },
    navigatorNoTabStyle: {
        statusBarColor: config.background.statusBar,
        navBarBackgroundColor: config.background.navigation,
        navBarTranslucent: false,
        navBarHideOnScroll: false,
        drawUnderNavBar: false,
        navBarTextColor: config.color.navigation,
        navBarTextFontSize: 18,
        navBarButtonColor: config.button.navigation,
        statusBarTextColorScheme: 'light',
        drawUnderTabBar: false,
        tabBarHidden: true,
        navBarNoBorder: true,
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
    },
    navigatorSpecial: {
        statusBarColor: config.background.statusBar,
        navBarBackgroundColor: config.background.navigation,
        navBarTranslucent: false,
        navBarHidden: true,
        navBarHideOnScroll: false,
        drawUnderNavBar: false,
        navBarTextColor: config.color.navigation,
        navBarTextFontSize: 18,
        navBarButtonColor: config.button.navigation,
        statusBarTextColorScheme: 'light',
        drawUnderTabBar: false,
        tabBarHidden: true,
        navBarNoBorder: true,
        disabledButtonColor: '#10a8b2',
        navBarSubtitleColor: 'white',
        navBarSubtitleFontFamily: 'HelveticaNeue'
    },
    retryButton: {
        width: 100,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: style.borderRadius,
        marginTop: 16,
        backgroundColor: config.colorVersion
    },
    retryContainer: {
        height: 100,
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: {
            width: 0,
            height: 5
        },
        shadowOpacity: 1,
        shadowRadius: 20
    },
    circleSearch: {
        zIndex: 50,
        width: 56,
        height: 56,
        borderRadius: 28,
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#19bdc8',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 1,
        shadowRadius: 3
    },
    circleOption: {
        width: 42,
        height: 42,
        borderRadius: 21,
        position: 'absolute',
        bottom: 16,
        right: 23,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 1,
        shadowRadius: 2
    },
    searchBarContainer2: {
        height: 48,
        width: width,
        flexDirection: 'row',
        marginTop: Platform.OS === 'ios' ? style.marginSize - 4 : 0,
        alignItems: 'center',
        paddingLeft: style.paddingDistance2,
        backgroundColor: config.colorVersion,
        shadowColor: 'rgba(76,0,0,0)',
        shadowOffset: {
            width: 0,
            height: 0.5
        }
    },
    searchBarContainerClone: {
        height: 48,
        // width: width,
        paddingHorizontal: 16,
        flexDirection: 'row',
        marginTop: Platform.OS === 'ios' ? style.marginSize - 4 : 0,
        alignItems: 'center',
        // paddingLeft: style.paddingDistance2,
        backgroundColor: config.colorVersion,
        shadowColor: 'rgba(76,0,0,0)',
        shadowOffset: {
            width: 0,
            height: 0.5
        }
    },
    textPin: {
        fontSize: style.font13,
        fontFamily: style.fontFamily,
        color: '#eb413c'
    },
    smallBadge: {
        width: (PixelRatio.getFontScale() > 1) ? 24 : 16,
        height: (PixelRatio.getFontScale() > 1) ? 24 : 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#df0000'
    },
    largeBadge: {
        width: (PixelRatio.getFontScale() > 1) ? 28 : 20,
        height: (PixelRatio.getFontScale() > 1) ? 28 : 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#df0000'
    }
}

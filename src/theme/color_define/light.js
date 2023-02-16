import { Platform, PixelRatio, Dimensions } from 'react-native';
import config from '../../config';
import * as Controller from '../../memory/controller';
import ENUM from '~/enum';
import logoLogin from '~/img/background_mobile/logo_shadow.png';
import icons from './icons/icons_dark';
import background from '../../img/background_mobile/ios82.png'
import backgroundAndroid from '../../img/background_mobile/android.png'

const { WIDTH_DRAWER } = ENUM;
const { width, height: HEIGHT_DEVICE } = Dimensions.get('window');

const isIphoneXorAbove =
  Platform.OS === 'ios' &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  (HEIGHT_DEVICE >= 812 || width >= 812);
const isIphone = Platform.OS === 'ios';
let marginTop = 0;
if (isIphone && isIphoneXorAbove) marginTop = 46;
if (isIphone && !isIphoneXorAbove) marginTop = 16;
const heightTabbar = isIphoneXorAbove ? 88 : 68;

// const WIDTH_DRAWER = width * 0.85;
let fontSizeStandard = 17;
function getFontSizeSetting() {
  if (Controller.getFontSize) {
    fontSizeStandard = Controller.getFontSize();
  }
}
function getDarkTheme() {
  const images = {
    logo: logoLogin,
    bgBusy: Platform.OS === 'ios' ? background : backgroundAndroid
  };
  //  font family
  const fontRobotoMono = 'Roboto Mono';
  const fontBold = 'HelveticaNeue-Bold';
  const fontFamily = 'HelveticaNeue';
  const fontLight = 'HelveticaNeue-Light';
  const fontMedium = 'HelveticaNeue-Medium';
  const fontbold = 'HelveticaNeue-Bold';
  const fontBuySellWL = 'HelveticaNeue-Bold';

  const fontPoppinsBold = 'PoppinsLatin-Bold';
  const fontPoppinsRegular = 'PoppinsLatin-Regular';
  const fontPoppinsItalic = 'PoppinsLatin-Italic';
  const fontPoppinsLight = 'PoppinsLatin-Light';
  const fontPoppinsMedium = 'PoppinsLatin-Medium';

  //  font size
  getFontSizeSetting();
  const paddingSizeStandard = 16;
  const paddingSizeOrders = 14;
  const paddingSize = paddingSizeStandard;
  const marginSize = paddingSizeStandard;
  const paddingDistance1 = paddingSizeStandard - 4;
  const paddingDistance2 = paddingSizeStandard / 2;
  const paddingDistance32 = 2 * paddingSizeStandard;
  const fontMin = fontSizeStandard - 8;
  const font10 = fontSizeStandard - 6;
  const font11 = fontSizeStandard - 5;
  const font13 = fontSizeStandard - 3;
  const font15 = fontSizeStandard - 1;
  const font17 = fontSizeStandard + 1;
  const font19 = fontSizeStandard + 3;
  const font21 = fontSizeStandard + 5;
  const font22 = fontSizeStandard + 6;
  const font23 = fontSizeStandard + 7;
  const font25 = fontSizeStandard + 9;
  const font30 = fontSizeStandard + 14;
  const font32 = fontSizeStandard + 16;
  const font42 = fontSizeStandard + 26;
  const font7 = fontSizeStandard - 9;
  const font6 = fontSizeStandard - 10;
  const fontTiny = fontSizeStandard - 7;
  const fontSizeXS = fontSizeStandard - 4;
  const fontSizeXS1 = fontSizeStandard - 5;
  const fontSizeTen = fontSizeStandard - 6; // a
  const fontSizeS = fontSizeStandard - 2;
  const fontSizeM = fontSizeStandard;
  const fontSizeL = fontSizeStandard + 2;
  const fontSizeXL = fontSizeStandard + 4;
  const fontSizeXXL = fontSizeStandard + 8;
  const font12 = fontSizeStandard - 6;
  const font16 = fontSizeStandard - 5;

  //  height
  const heightL = 56;
  const heightM = 48;
  const heightS = 40;

  //  opacity
  const opacity = 1;
  const opacity1 = 0.87;
  const opacity2 = Platform.OS === 'ios' ? 0.78 : 0.54;
  const opacity3 = 0.7;
  const opacity4 = 0.54;
  const opacity5 = 0.4;
  const opacity6 = 0.5;
  //  font ratio
  const fontRatio = 1;

  //  font fontColor
  const color = {
    bg: 'rgb(38, 43, 62)',
    dusk: 'rgb(58, 66, 94)',
    dusk_tabbar: 'rgb(58, 66, 94)',
    dark: 'rgb(23, 27, 41)',
    sell: 'rgb(253, 55, 84)',
    sell2: 'rgb(253, 55, 84)',
    buy: 'rgb(48, 255, 143)',
    success: 'rgb(48, 255, 143)',
    modify: 'rgb(87, 225, 241)',
    warning: 'rgb(247, 181, 0)',
    process: 'rgb(247, 181, 0)',
    error: 'rgb(253, 55, 84)',
    network: 'rgb(253, 55, 84)',
    sellOpa: 'rgba(253, 55, 84, 0.6)',
    buyOpa: 'rgba(95, 255, 169, 0.6)',
    lightWhite: 'rgb(197, 203, 206)',
    shadow: '#000000',
    turquoiseBlue: 'rgb(87, 225, 241)',
    turquoiseBlueHex: '#57e1f1',
    disabled: 'rgba(58, 66, 94,0.25)',
    bgAccount: '#171B29',
    bgDrawer: '#171B29',
    icon: '#ffffff',
    select: 'rgb(87, 225, 241)',
    unselect: 'rgb(58, 66, 94)',
    textSell: 'rgb(23, 27, 41)',
    textBuy: 'rgb(23, 27, 41)',
    backBuy: '#00ff81',
    backSell: '#fd3754',
    backSellBorder: 'transparent',
    quantityIcon: 'rgba(255, 255, 255, 0.5)',
    sellOrderButtonLoading: 'rgb(58, 66, 94)',
    buyOrderButtonLoading: 'rgb(58, 66, 94)',
    buyBTText: '#2D2323',
    dropdown_marketActivities: 'rgb(23, 27, 41)',
    btnReviewOrderBuy: 'rgb(48, 255, 143)',
    btnReviewOrderSell: 'rgb(253, 55, 84)',
    borderAddWLSelected: 'rgb(87, 225, 241)',
    fontdusk_disable: 'rgb(58, 66, 94)',
    tab_disable: 'rgb(58, 66, 94)'
  };
  const iconMoveColor = 'rgb(216, 216, 216)';
  const iconAddSymbol = 'rgba(253,253,253,0.5)';
  const statusBarModal = 'rgba(38, 43, 62, 0.87)';
  const lineColor = 'rgba(58, 66, 94,0.2)';
  const bgCircleDrawer = 'rgb(23, 27, 41)';
  const headerDrawerBgColor = 'rgb(77, 204, 220)';
  const orderStateTagJungleGreen = '#26a59a';
  const orderStateTagGoldenBell = '#ec870e';
  const orderStateTagDodgeBlue = '#2096f3';
  const orderStateTagRadicalRed = '#ff4a68';
  const fontRiverBed = '#485465';
  const fontRed = '#df0000';
  const fontRed1 = '#fd3754';
  const fontChestnutRose = '#cd5c5c';
  const fontTorchRed = '#ff1643';
  const fontShadowRed = 'rgb(253, 55, 84)';
  const fontShadowRedOpacity = 'rgba(253, 55, 84, 0.5)';
  const fontPink = '#f28bb0';
  const fontShadow = '#0000001e';
  const fontGreen = '#00b800';
  const fontGreen1 = '#00ff81';
  const fontOceanGreen = 'rgb(95,255,169)';
  const fontOceanRed = 'rgb(253, 55, 84)';
  const fontOceanGreenOpacity = 'rgba(95,255,169, 0.5)';
  const fontShadowGreen = 'rgba(95,255,169,0.7)';
  const fontBlue = '#10a8b2';
  const fontBlue1 = '#57e1f1';
  const fontBlue2 = '#4dccdc';
  const fontYellow = '#F8BE5C';
  const fontViolet = '#3f51b5';
  const fontWhite = '#ffffff';
  const fontGray = '#8c8c8c';
  const fontGray1 = 'rgba(128, 128, 128, 0.2)';
  const fontGray2 = 'rgba(128, 128, 128, 0.4)';
  const fontLink = '#359ee4';
  const fontApple = '#007aff';
  const fontDisable = '#808080';
  const fontDisable1 = 'rgba(0,0,0,0.3)';
  const fontOrange = '#ff9500';
  const fontDark = '#1e1e1e';
  const fontDefaultColor = 'rgb(38,43,62)';
  const fontDark2 = '#171b29';
  const fontColorBorderNew = 'rgb(54,60,78)';
  const fontColorButtonSwitch = 'rgb(87,225,241)';
  const fontColorSwitchTrue = 'rgb(58,66,94)';
  const fontDark3 = '#3a425e';
  const fontColorModal = 'rgb(23,27,41)';
  const fontNewRed = 'rgb(253,55,84)';
  const fontDefaultColorOpacity = 'rgba(38,43,62,0.85)';

  const fontBorderGray = '#333333';
  const fontBorderNewsUi = 'rgb(54, 60, 78)';
  const fontBorder = '#3A425E';
  const fontBlack = '#000000';
  const fontSilver = '#bbb';
  const fontAzureRadiance = '#007aff';
  const fontDeepGray = '#808080';
  const fontDeepBlack = '#0000001e';
  const fontGridChartColor = '#0000001e';
  const fontTransparent = 'transparent';
  const fontAlabaster = '#F8F8F8';
  const fontNearAlabaster = '#f9f9f9';
  const fontElephant = '#10364C';
  const fontShark = '#2C2F33';
  const fontIconLeft = '#00000087';
  const fontNearDark1 = 'rgba(0, 0, 0, 0.87)';
  const fontNearDark2 = 'rgba(0, 0, 0, 0.54)';
  const fontNearDark3 = '#bbb';
  const fontNearLight1 = 'rgba(255, 255, 255, 0.87)';
  const fontNearLight2 = 'rgba(255, 255, 255, 0.54)';
  const fontNearLight3 = 'rgba(255, 255, 255, 0.2)';
  const fontNearLight4 = 'rgba(255, 255, 255, 0.7)';
  const fontNearLight5 = '#171b2f';
  const fontNearLight6 = 'rgba(255, 255, 255, 0.5)';
  const fontNearLight7 = 'rgba(255, 255, 255, 0.25)';
  const hightLightColorDown = 'rgb(253, 55, 84)';
  const hightLightColorDownPercent = 'rgb(253, 55, 84)';
  const hightLightColorUp = 'rgb(48,255,143)';
  const hightLightColorUpPersent = '#2FDC85';
  const lightGreenBlue = 'rgba(95,255,169,0.3)';
  const reddishPink = 'rgba(253, 55, 84,0.3)';
  const fontRegentStBlue = '#96b9dd';
  const fontJava = '#19bdc8';
  const fontMandy = 'rgba(233, 0, 0, 0.7)';
  const fontEmerald = 'rgba(95,255,169,0.7)';
  const fontManatee = '#8E8E93';
  const fontColor = fontWhite;
  const fontButton = fontBlue;
  const fontButtonV4 = fontWhite;
  const fontTextChart = fontNearLight4;
  const fontGridChart = fontGridChartColor;
  const fontTimeUpdate = fontDark;
  const markerColorChart = fontElephant;
  const backgroundTintChart = fontNearAlabaster;
  const fontColor2 = fontNearLight1;
  const highlightColorChart = fontNearLight2;
  const fillColorChart = fontRegentStBlue;
  const zeroLine = fontRed;
  const newsActive = fontNearLight2;
  const newsInactive = fontNearLight3;
  const newsTextColor = fontBlack;
  const todayChangeUpTextColor = color.buy;
  const todayChangeDownTextColor = color.sell;
  const todayChangeEqualTextColor = fontWhite;
  const lastTradeBgColor = fontDark;
  const noneValue = fontWhite;
  const circleBtnBg = fontJava;
  const btnBuyBg = fontEmerald;
  const btnSellBg = fontMandy;
  const btnOrderBuyColor = fontShadowGreen;
  const btnOrderSellColor = fontShadowRed;
  const gridColorHorizontal = fontGray1;
  const gridColorVertical = fontGray2;
  const seperateLineColor = fontBorderGray;
  const marketTextColor = fontNearDark1;
  const addIconColor = fontShadowGreen;
  const addIconColorRed = fontShadowRed;
  const borderTextBox = fontNearLight2;
  const borderTextBoxGray = 'rgba(0, 0, 0, 0.12)';
  const opacityCos = opacity3;
  const drawerTopBgColor = fontDark;
  const statusBarBgColor = fontDark;
  const statusBarColor = 'rgba(0, 0, 0, 1)';
  const statusBarColorNearBlack = 'rgba(0, 0, 0, 0.3)';
  const statusBarBtnColor = fontBlue;
  const btnDisableBgColor = fontShadow;
  const btnOrderPositionBgColor = fontJava;
  const btnClosePositionBgColor = fontTorchRed;
  const btnTabActive = fontJava;
  const btnTabInActive = fontBlack;
  const btnDisable = fontNearLight2;
  const btnCancelBg = fontRed;
  const buttonGroupActive = fontWhite;
  const buttonGroup = fontBlue;
  const colorHeader = fontDark;
  const fontHeader = fontBlue;
  const fontTextNavbar = fontWhite;
  const colorHeaderNews = colorHeader;
  const btnColor = fontBlue;
  const btnTabActiveBgColor = fontBlue;
  const newBtnTabActiveBgColor = fontBlue;
  const btnTabInactiveBgColor = fontBlack;
  const newBtnTabInactiveBgColor = fontBlack;
  const borderTabColor = fontBlue;
  const textActiveColor = fontWhite;
  const textInactiveColor = fontBlue;
  const textTabActiveColor = fontWhite;
  const textTabInActiveColor = fontBlue;
  const opacityPrice = opacity;
  const yAxisTextColor = '#ffffffde';
  const colorTag1 = 'rgba(255, 255, 255, 0.45)';
  const colorTag2 = '#10a8b2';
  const colorProduct = 'rgb(87, 225, 241)';
  const btnWhatsNew = '#10a8b2';
  const bgColorConfirmOrder = fontBlack;
  const btnDisableBg = fontDisable;
  const btnSellModify = fontShadowRed;
  const colorBgSettings = fontDark;
  const colorIconSettings = 'rgba(255, 255, 255, 0.5)';
  const colorHeaderAll = 'rgba(30, 30, 30, 0.87)';
  const colorChangePinBg = fontBlack;
  const btnOrderDisableBg = fontDisable;
  const textAndroidActiveColor = fontWhite;
  const textAndroidInactiveColor = fontBlue;
  const colorBgNewAlert = '#010101';
  const colorDragIcons = 'rgba(255, 255, 255, 0.54)';
  const colorbtnConfirm = '#10a8b2';
  const fontBorderRadius = 'rgba(255, 255, 255, 0.54)';
  const timePickerColor = '#197bc8';
  const colorTextTimepicker = fontWhite;
  const bgQuietHours = fontBorderGray;
  const colorSelect = fontDark;
  const colorTextDate = timePickerColor;
  const colorGTD = fontBlack;
  const statusBarMode = 'light-content';
  const statusBarTextScheme = 'light';
  const searchInputBgColor = fontBorderGray;
  const searchInputBgColor2 = '#3a425e';
  const fontHeaderPin = fontWhite;
  const companyNameColor = 'rgba(0, 0, 0, 0.3)';
  const fontBidAsk = fontNearLight2;
  const fontSearchBar = fontDark;
  const fontCompany = fontNearLight2;
  const fontBgChart = 'rgba(255, 255, 255, 0.3)';
  const fontBgBtnClose = colorDragIcons;
  const fontSettingChart = fontNearLight2;
  const backgroundColorNews = 'rgb(38, 43, 62)';
  const ColorTabNews = 'rgb(23, 27, 41)';
  const backgroundNewSearchBar = 'rgb(58, 66, 94)';
  const colorTradePrice = 'rgb(253, 55, 84)';
  const colorEdge = 'rgb(31, 37, 59)';
  const disableBtnSellBorderColor = 'rgba(253,55,84, 0.7)';
  const disableBtnBuyBorderColor = 'rgba(95, 255, 169, 0.7)';
  const borderColorTopButtonConfrim = 'rgba(58, 66, 94,0.5)';
  const fonttextsellAmend = 'rgba(255, 255, 255, 0.7)';
  //  font fontColor

  const colorTopBorder = fontShadow;
  const fontIconInfor = fontSilver;
  // icon
  const iconSizeS = 18;
  const iconSizeM = 24;

  // border
  const borderColor = '#0000001e';
  const borderRadius = 2;
  const borderWidthThin = 1;
  const borderBottomColor = '#fff';
  const borderBottomGray = 'rgb(151, 151, 151)';
  const borderTopColor = '#fff';
  const borderRightColor = '#fff';
  const borderLeftColor = '#fff';

  // text align
  const textAlignCenter = 'center';

  const backgroundColor = color.dark;
  const backgroundColor1 = '#262b3e';
  const backgroundColor2 = color.dark;
  const backgroundColorPopup = 'rgba(38, 43, 62,0.7)';
  const backgroundColorNearDark = '#171B29';
  const text = {
    color: '#c5cbce'
  };

  const input = {
    backgroundColor: 'transparent',
    color: '#c5cbce'
  };

  const header = {
    backgroundColor: '#10a8b2',
    color: '#fff'
  };

  const colorNotify = {
    error: 'rgb(253, 55, 84)',
    warning: 'rgb(247, 181, 0)'
  };
  //  #region Button
  const btnRect = {
    borderRadius,
    opacity,
    borderWidth: 0
  };
  //  #endregion

  const border = {
    borderColor: fontBorderGray
  };

  const classBackgroundColor = {
    EQ: '#4ccd4c',
    FU: '#1d7cad',
    ET: '#f37022',
    WA: '#4c6a97',
    OP: '#128d98',
    EQT: 'rgb(8, 108, 225)',
    FUT: 'rgb(16, 255, 255)',
    ETF: 'rgb(148, 0, 211)',
    MF: 'rgb(181, 48, 59)',
    WAR: 'rgb(255, 224, 0)',
    OPT: 'rgb(174, 226, 57)',
    IND: 'rgb(250,100,0)',
    FX: 'rgb(109,212,0)'
  };

  const placeholderTextColor = 'rgba(87, 225, 241, 0.5)';

  const upColor = 'rgba(95,255,169,0.6)';
  const downColor = 'rgba(253,55,84,0.6)';

  const backgroundBid = 'rgba(48,255,143,0.2)';
  const backgroundAsk = 'rgba(253,55,84,0.2)';

  const borderBottomRightRadius = 0;
  const lineColor2 = 'rgba(255,255,255,0.05)';

  const borderColorActive = 'rgba(87, 225, 241, 0.7)';
  let style = {
    images,
    icons,
    UP_COLOR: [95, 255, 169],
    DOWN_COLOR: [253, 55, 84],
    backgroundColor2,
    fontDark2,
    font6,
    borderColorActive,
    backgroundBid,
    backgroundAsk,
    fontNearLight4,
    lineColor2,
    iconAddSymbol,
    fontSizeTen,
    fontNearLight7,
    backgroundColorPopup,
    fontNearLight3,
    iconMoveColor,
    statusBarModal,
    borderColorTopButtonConfrim,
    heightTabbar,
    fontButtonV4,
    borderBottomRightRadius,
    colorNotify,
    lightGreenBlue,
    reddishPink,
    lineColor,
    fontBorder,
    opacity6,
    fontDefaultColorOpacity,
    hightLightColorDownPercent,
    hightLightColorDown,
    fontBlue2,
    paddingDistance32,
    fontNearLight6,
    fontNearLight5,
    backgroundColorNearDark,
    hightLightColorUpPersent,
    hightLightColorUp,
    color,
    colorEdge,
    disableBtnBuyBorderColor,
    disableBtnSellBorderColor,
    colorTradePrice,
    bgCircleDrawer,
    backgroundNewSearchBar,
    opacity5,
    ColorTabNews,
    fontBorderNewsUi,
    colorProduct,
    backgroundColorNews,
    fontIconInfor,
    colorTopBorder,
    fontCompany,
    fontSearchBar,
    fontBidAsk,
    orderStateTagJungleGreen,
    orderStateTagGoldenBell,
    orderStateTagDodgeBlue,
    orderStateTagRadicalRed,
    statusBarTextScheme,
    searchInputBgColor,
    searchInputBgColor2,
    statusBarMode,
    btnColor,
    drawerTopBgColor,
    classBackgroundColor,
    colorGTD,
    colorTextDate,
    colorTextTimepicker,
    colorSelect,
    bgQuietHours,
    fontBorderRadius,
    fontNearDark2,
    fontDark3,
    fontNearDark3,
    colorbtnConfirm,
    colorBgNewAlert,
    colorDragIcons,
    textAndroidActiveColor,
    textAndroidInactiveColor,
    btnOrderDisableBg,
    colorChangePinBg,
    colorHeaderAll,
    colorIconSettings,
    colorBgSettings,
    btnSellModify,
    btnDisableBg,
    bgColorConfirmOrder,
    btnWhatsNew,
    colorTag1,
    colorTag2,
    yAxisTextColor,
    opacityPrice,
    textActiveColor,
    textInactiveColor,
    textTabActiveColor,
    textTabInActiveColor,
    btnTabActiveBgColor,
    newBtnTabActiveBgColor,
    newBtnTabInactiveBgColor,
    borderTabColor,
    btnTabInactiveBgColor,
    colorHeaderNews,
    fontHeader,
    fontTextNavbar,
    colorHeader,
    buttonGroup,
    buttonGroupActive,
    btnCancelBg,
    btnOrderBuyColor,
    btnOrderSellColor,
    btnDisable,
    btnTabInActive,
    btnTabActive,
    btnOrderPositionBgColor,
    btnClosePositionBgColor,
    btnBuyBg,
    btnSellBg,
    btnDisableBgColor,
    statusBarBtnColor,
    statusBarBgColor,
    statusBarColor,
    opacityCos,
    borderTextBox,
    borderTextBoxGray,
    lastTradeBgColor,
    noneValue,
    todayChangeUpTextColor,
    todayChangeDownTextColor,
    todayChangeEqualTextColor,
    fontNearLight2,
    fontGray2,
    addIconColorRed,
    fontShadowRed,
    fontShadowRedOpacity,
    addIconColor,
    fontShadowGreen,
    marketTextColor,
    seperateLineColor,
    gridColorHorizontal,
    gridColorVertical,
    circleBtnBg,
    newsTextColor,
    newsActive,
    newsInactive,
    fontShadow,
    fontPink,
    opacity3,
    zeroLine,
    fillColorChart,
    backgroundTintChart,
    fontColor2,
    highlightColorChart,
    markerColorChart,
    fontTimeUpdate,
    fontTransparent,
    fontTextChart,
    fontGridChart,
    fontButton,
    fontDeepBlack,
    fontDeepGray,
    fontAzureRadiance,
    fontSilver,
    fontBlack,
    fontDisable1,
    fontOrange,
    fontDark,
    fontDefaultColor,
    fontColorBorderNew,
    fontColorButtonSwitch,
    fontColorSwitchTrue,
    fontColorModal,
    fontNewRed,
    fontBorderGray,
    btnRect,
    backgroundColor,
    backgroundColor1,
    text,
    input,
    header,
    paddingSizeOrders,
    paddingSize,
    marginSize,
    paddingDistance1,
    paddingDistance2,
    heightL,
    heightM,
    heightS,
    opacity,
    opacity1,
    opacity2,
    opacity4,
    fontMin,
    font16,
    font12,
    font10,
    font11,
    font13,
    font15,
    font17,
    font19,
    font21,
    font22,
    font23,
    font25,
    font30,
    font32,
    font42,
    font7,
    fontTiny,
    fontSizeXS,
    fontSizeXS1,
    fontSizeS,
    fontSizeM,
    fontSizeL,
    fontSizeXL,
    fontSizeXXL,
    fontRatio,
    fontBold,
    fontFamily,
    fontLight,
    fontMedium,
    fontbold,
    fontColor,
    fontRed,
    fontRed1,
    fontChestnutRose,
    fontGreen,
    fontGreen1,
    fontOceanGreen,
    fontOceanRed,
    fontOceanGreenOpacity,
    fontBlue,
    fontBlue1,
    fontYellow,
    fontViolet,
    fontWhite,
    fontGray,
    fontLink,
    fontApple,
    fontDisable,
    iconSizeS,
    iconSizeM,
    borderColor,
    borderRadius,
    borderWidthThin,
    borderBottomColor,
    borderBottomGray,
    borderTopColor,
    borderRightColor,
    borderLeftColor,
    textAlignCenter,
    timePickerColor,
    fontBuySellWL,
    fontHeaderPin,
    companyNameColor,
    fontSettingChart,
    fontBgBtnClose,
    fontBgChart,
    fontRobotoMono,
    fontPoppinsBold,
    fontPoppinsItalic,
    fontPoppinsRegular,
    fontPoppinsLight,
    fontPoppinsMedium,
    upColor,
    downColor,
    placeholderTextColor,
    fonttextsellAmend
  };
  const statusBarTextColor = 'light';
  style = {
    ...style,
    constStyle: style,
    fontWhite: style.fontWhite,
    rowContainerIOS: {
      width: '100%',
      paddingHorizontal: paddingSize,
      borderBottomWidth: 1,
      borderColor: seperateLineColor
    },
    searchBarContainerCnote: {
      height: 44,
      paddingLeft: paddingDistance2,
      paddingRight: paddingDistance2,
      borderBottomWidth: 1,
      borderColor: fontBorderGray,
      backgroundColor,
      justifyContent: 'center'
    },
    iconLeft: {
      fontSize: fontSizeXL,
      opacity: 0.87,
      width: 30,
      textAlign: 'center',
      color: fontColor
    },
    iconTabBar: {
      opacity: 0.87,
      textAlign: 'center',
      color: fontWhite
    },
    iconDrawer: {
      fontSize: fontSizeXL,
      textAlign: 'center',
      color: fontColor
    },
    iconDrawerSelected: {
      fontSize: fontSizeXL,
      textAlign: 'center',
      color: btnOrderPositionBgColor
    },
    iconSelected: {
      fontSize: fontSizeXL,
      textAlign: 'center',
      color: btnOrderPositionBgColor
    },
    iconTabBarSelected: {
      opacity: 0.87,
      textAlign: 'center',
      color: btnOrderPositionBgColor
    },
    iconTabBarDisabled: {
      opacity: 0.4,
      textAlign: 'center',
      color: fontWhite
    },
    textRight: {
      color: fontColor,
      opacity: opacity1,
      fontSize: fontSizeS,
      fontFamily: fontMedium,
      paddingLeft: paddingSize * 2
    },
    textMenuDrawer: {
      color: fontColor,
      fontSize: fontSizeS,
      fontFamily: fontPoppinsRegular,
      paddingLeft: paddingSize
    },
    textTabBar: {
      color: fontWhite,
      opacity: opacity1,
      fontSize: fontMin,
      fontFamily: fontPoppinsRegular,
      letterSpacing: -0.27
    },
    textRightSelected: {
      color: fontBlue,
      opacity: opacity1,
      fontSize: fontSizeS,
      fontFamily: fontMedium,
      paddingLeft: paddingSize * 2
    },
    textMenuDisabled: {
      color: fontDisable,
      opacity: 0.6,
      fontSize: fontSizeS,
      fontFamily: fontPoppinsRegular,
      paddingLeft: paddingSize
    },
    drawerBodyContainer: {
      width: '100%',
      flex: 1,
      paddingLeft: 30
    },
    accountHeaderDrawerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    textAccountHeaderDrawer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'center'
    },
    textMenuDrawerSelected: {
      color: fontBlue,
      opacity: opacity1,
      fontSize: fontSizeS,
      fontFamily: fontPoppinsRegular,
      paddingLeft: paddingSize
    },
    textTabBarSelected: {
      color: fontBlue,
      opacity: opacity1,
      fontSize: fontMin,
      fontFamily: fontPoppinsRegular,
      letterSpacing: -0.27
    },
    textTabBarDisabled: {
      color: fontColor,
      opacity: 0.4,
      fontSize: fontMin,
      fontFamily: fontPoppinsRegular,
      letterSpacing: -0.27
    },
    headerContent: {
      transform: [{ translateY: 0 }],
      paddingVertical: 3,
      borderRadius: borderRadius,
      backgroundColor: fontTimeUpdate,
      width: '95%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    text14: {
      fontFamily: 'HelveticaNeue',
      fontSize: fontSizeS,
      color: fontWhite,
      opacity: 0.87
    },
    text16: {
      fontFamily: 'HelveticaNeue',
      fontSize: fontSizeM,
      color: fontWhite,
      opacity: 0.87
    },
    text18: {
      fontFamily: 'HelveticaNeue',
      fontSize: fontSizeL,
      color: fontWhite,
      opacity: 0.87
    },
    chartOption: {
      height: 48,
      marginBottom: 16,
      marginRight: 88,
      paddingLeft: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#3A425D',
      borderTopRightRadius: 24,
      borderBottomRightRadius: 24,
      paddingRight: style.paddingSize
    },
    rowSearch: {
      backgroundColor: fontBlack,
      flexDirection: 'row',
      // height: CommonStyle.heightM,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderColor: fontBorderGray,
      alignItems: 'center',
      marginHorizontal: 16
    },
    rowCnote: {
      borderRadius: 8,
      backgroundColor,
      marginBottom: 8,
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      flexDirection: 'row'
    },
    position: {
      backgroundColor: backgroundColorNearDark,
      marginHorizontal: 16,
      marginBottom: 8,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-between',
      // height: 72,
      paddingVertical: 8,
      paddingHorizontal: paddingDistance2,
      // borderWidth: 1,
      // borderTopColor: fontBorderGray,
      borderRadius: 8
      // height: 48
    },
    transaction: {
      backgroundColor: backgroundColorNearDark,
      marginLeft: 32,
      marginRight: 16,
      marginBottom: 8,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'space-between',
      // height: 72,
      paddingVertical: 8,
      paddingHorizontal: paddingDistance2,
      // borderWidth: 1,
      // borderTopColor: fontBorderGray,
      borderRadius: 8
      // height: 48
    },
    positionExpand: {
      backgroundColor: backgroundColorNearDark,
      marginVertical: 4,
      marginHorizontal: 16,
      alignItems: 'center',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingVertical: 8,
      // borderTopWidth: 1,
      paddingHorizontal: paddingDistance2,
      borderRadius: 8
    },
    hugoText: {
      opacity: style.opacity1,
      fontSize: font32,
      fontFamily: style.fontFamily,
      color: style.fontColor
    },
    fontMarketDepthGreen: {
      backgroundColor: lightGreenBlue
    },
    fontMarketDepthRed: {
      backgroundColor: reddishPink
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
      color: fontBlack,
      fontFamily: fontPoppinsBold
    },
    textButtonColorS: {
      fontSize: style.fontSizeS,
      color: fontBlack,
      fontFamily: fontPoppinsRegular,
      opacity: 0.6
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
      fontFamily: fontPoppinsRegular,
      fontSize: style.fontSizeXS - 1,
      textAlign: 'center',
      color: '#000000',
      paddingVertical: 4,
      letterSpacing: 0
    },
    textGiant: {
      opacity: style.opacity1,
      fontFamily: style.fontMedium,
      fontSize: style.fontSizeXL,
      color: style.fontColor
    },
    textMain: {
      // opacity: style.opacity,
      fontFamily: style.fontPoppinsBold,
      fontSize: style.fontSizeS,
      color: fontWhite
    },
    textTitleDialog: {
      opacity: style.opacity1,
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textDescDialog: {
      opacity: style.opacity1,
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.font14,
      color: style.fontColor
    },
    textMain2: {
      opacity: style.opacity,
      fontFamily: style.fontMedium,
      fontSize: style.fontSizeM - 1,
      color: style.fontColor
    },
    textMain3: {
      // opacity: style.opacity,
      fontFamily: style.fontPoppinsMedium,
      fontSize: style.fontSizeS,
      color: fontWhite
    },
    textMainLightNoColor: {
      opacity: style.opacity1,
      fontFamily: style.fontPoppinsLight,
      fontSize: style.fontSizeS
    },
    textMainLight: {
      // opacity: style.opacity1,
      fontFamily: style.fontPoppinsLight,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textMainLight2: {
      // opacity: style.opacity1,
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeXS,
      color: style.fontNearLight5
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
      // opacity: style.opacity1,
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textMainNormalNoColorOpacity: {
      fontFamily: style.fontPoppinsBold,
      fontSize: style.fontSizeS
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
    textMainNormalNoColorClone: {
      fontFamily: style.fontPoppinsBold,
      fontSize: style.fontSizeS
    },
    textMainNormalWhite: {
      fontFamily: style.fontFamily,
      fontSize: style.fontSizeM,
      color: 'white'
    },
    textSubLightWhite: {
      fontFamily: style.fontLight,
      fontSize: style.fontSizeS,
      color: fontWhite
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
      fontFamily: fontPoppinsRegular,
      fontSize: style.fontSizeM - 5,
      opacity: style.opacity5,
      color: fontColor
    },
    textSub: {
      // opacity: style.opacity1,
      fontFamily: fontPoppinsMedium,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textSub2: {
      opacity: style.opacity1,
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeXS,
      color: style.fontColor
    },
    textSub1: {
      opacity: style.opacity1,
      fontFamily: style.fontLight,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textSubOrigin: {
      fontFamily: style.fontLight,
      fontSize: style.fontSizeS,
      color: fontWhite
    },
    textSubDark: {
      fontFamily: fontPoppinsRegular,
      fontSize: style.fontSizeS,
      color: 'rgba(255, 255, 255, 1) '
    },
    textSubBold: {
      opacity: style.opacity2,
      fontFamily: style.fontBold,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textSubBold1: {
      opacity: style.opacity1,
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
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textSubBlack: {
      opacity: style.opacity1,
      fontFamily: fontPoppinsRegular,
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
      color: style.fontRed,
      textAlign: 'center'
    },
    textSubYellow: {
      fontFamily: style.fontFamily,
      fontSize: style.fontSizeS,
      color: style.fontYellow
    },
    textSubNoColor: {
      fontFamily: fontPoppinsBold,
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
      color: style.fontColor,
      lineHeight: style.fontSizeM
    },
    textSubMediumWhite: {
      fontFamily: style.fontMedium,
      fontSize: style.fontSizeS,
      color: fontBlack
    },
    textSubGreen: {
      fontFamily: style.fontFamily,
      fontSize: style.fontSizeS,
      color: fontBlue
    },
    textMainHeader: {
      opacity: 0.5,
      fontFamily: fontPoppinsBold,
      fontSize: style.fontSizeXS,
      color: fontWhite
    },
    textMainLabel: {
      fontFamily: fontPoppinsBold,
      fontSize: style.fontSizeXS,
      color: fontWhite
    },
    textMainHeaderNoOpacity: {
      fontFamily: style.fontFamily,
      fontSize: style.fontSizeXS,
      color: fontNearLight4
    },
    textMainHeaderOpacity2: {
      opacity: style.opacity2,
      fontFamily: style.fontFamily,
      fontSize: style.fontSizeXS,
      color: style.fontColor
    },
    textSubHeader: {
      opacity: 0.4,
      fontFamily: fontPoppinsRegular,
      fontSize: style.fontTiny,
      color: fontWhite
    },
    textSubHeaderNoColor: {
      fontFamily: style.fontFamily,
      fontSize: style.fontTiny
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderColor: colorHeaderNews
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
      backgroundColor: fontBorderGray,
      marginLeft: 16,
      marginRight: 16
    },
    borderBelow2: {
      borderBottomWidth: 1,
      borderBottomColor: '#0000001e',
      marginHorizontal: 16
    },
    progressBarWhite: {
      backgroundColor,
      flex: 1,
      height: HEIGHT_DEVICE,
      justifyContent: 'center',
      alignItems: 'center'
    },
    progressBarWhiteHeight: {
      backgroundColor,
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
    textFloatingLabel1: {
      opacity: 0.5,
      fontFamily: fontPoppinsRegular,
      fontSize: style.font10 - 1,
      color: fontNearLight1
    },
    textFloatingLabel3: {
      opacity: 0.4,
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: style.fontColor
    },
    label: {
      // opacity: style.opacity2,
      fontFamily: style.fontMedium,
      fontSize: style.fontSizeM,
      color: fontColor,
      fontWeight: '700'
    },
    labelFromMenu: {
      // opacity: style.opacity2,
      fontFamily: style.fontMedium,
      fontSize: style.fontSizeM,
      color: fontColor,
      fontWeight: '700'
    },
    textFloatingLabel2: {
      opacity: 0.4,
      fontFamily: style.fontLight,
      fontSize: fontSizeXS,
      color: style.fontColor,
      // marginTop: -14,
      marginRight: 16,
      marginTop: 10,
      marginBottom: 4
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
      fontFamily: fontPoppinsRegular,
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
      fontFamily: style.fontPoppinsLight,
      fontSize: style.fontSizeXS,
      color: style.fontNewRed
    },
    textFilter: {
      fontFamily: fontPoppinsRegular,
      fontSize: style.font13,
      color: style.fontWhite,
      letterSpacing: -0.1
    },
    textFilterSelected: {
      fontFamily: fontPoppinsBold,
      fontSize: style.font13,
      color: style.fontWhite,
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
      borderColor: fontBorderGray,
      backgroundColor: fontBlack,
      justifyContent: 'center'
    },
    searchBar: {
      borderWidth: 1,
      borderColor: fontBorderGray,
      height: 30,
      borderRadius: style.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconSearch: {
      color: fontManatee,
      fontSize: style.iconSizeS,
      paddingRight: style.paddingDistance2
    },
    searchPlaceHolder: {
      color: fontWhite,
      fontSize: style.fontSizeS,
      fontFamily: style.fontFamily
    },
    searchPlaceHolderMedium: {
      color: fontWhite,
      fontSize: style.fontSizeS,
      fontFamily: style.fontMedium
    },
    searchPlaceHolderColor: fontNearLight6,
    navigatorStyleCommon: {
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarHidden: true,
      statusBarColor: statusBarColorNearBlack,
      screenBackgroundColor: 'transparent'
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
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarNoBorder: true,
      navBarSubtitleColor: 'white',
      navBarSubtitleFontFamily: 'HelveticaNeue',
      screenBackgroundColor: backgroundColor
    },
    navigatorNoTabStyle: {
      statusBarColor: fontDark,
      navBarBackgroundColor: fontDark,
      navBarTranslucent: false,
      navBarHideOnScroll: false,
      drawUnderNavBar: false,
      navBarTextColor: fontBlue,
      navBarTextFontSize: 18,
      navBarButtonColor: fontBlue,
      statusBarTextColorScheme: 'light',
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarNoBorder: true,
      navBarSubtitleColor: 'white',
      navBarSubtitleFontFamily: 'HelveticaNeue',
      screenBackgroundColor: backgroundColor
    },
    navigatorSpecial: {
      statusBarColor: fontDark2,
      statusBarTextColorScheme: statusBarTextScheme,
      navBarBackgroundColor: fontDark,
      navBarBackgroundColor2: fontDark2,
      navBarBackgroundColor3: fontDark3,
      navBarTranslucent: false,
      navBarHideOnScroll: false,
      drawUnderNavBar: false,
      navBarTextColor: fontWhite,
      navBarTextFontSize: 18,
      navBarButtonColor: fontBlue,
      navBarButtonColor1: fontWhite,
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarHidden: true,
      // navBarNoBorder: true,
      disabledButtonColor: fontBlue,
      navBarSubtitleColor: fontWhite,
      navBarSubtitleFontFamily: 'HelveticaNeue',
      screenBackgroundColor: backgroundColor
    },
    navigatorSpecial1: {
      statusBarColor: bgCircleDrawer,
      statusBarTextColorScheme: statusBarTextScheme,
      navBarBackgroundColor: fontDark,
      navBarBackgroundColor2: fontDark2,
      navBarBackgroundColor3: fontDark3,
      navBarTranslucent: false,
      navBarHideOnScroll: false,
      drawUnderNavBar: false,
      navBarTextColor: fontWhite,
      navBarTextFontSize: 18,
      navBarButtonColor: fontBlue,
      navBarButtonColor1: fontWhite,
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarHidden: true,
      navBarNoBorder: true,
      disabledButtonColor: fontBlue,
      navBarSubtitleColor: fontWhite,
      navBarSubtitleFontFamily: 'HelveticaNeue',
      screenBackgroundColor: backgroundColor
    },

    navigatorSpecialNoHeader: {
      statusBarColor: fontDark2,
      statusBarTextColorScheme: statusBarTextScheme,
      navBarTextFontSize: 18,
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarHidden: true,
      disabledButtonColor: fontBlue,
      screenBackgroundColor: backgroundColor
    },
    navigatorModalSpecialNoHeader: {
      statusBarColor: fontDark2,
      statusBarTextColorScheme: statusBarTextScheme,
      drawUnderNavBar: true,
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarHidden: true,
      screenBackgroundColor: 'transparent'
    },
    navigatorStyleTab: {
      statusBarColor: fontDark2,
      statusBarTextColorScheme: statusBarTextScheme,
      screenBackgroundColor: backgroundColor,
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarHidden: true
    },
    navigatorNoHeader: {
      statusBarColor: fontDark,
      navBarTextColor: fontWhite,
      navBarBackgroundColor: fontDark,
      navBarButtonColor: fontBlue,
      statusBarTextColorScheme: 'dark',
      navBarHidden: true,
      tabBarHidden: true,
      tabBarTranslucent: true,
      drawUnderTabBar: true,
      navBarHideOnScroll: false,
      navBarTextFontSize: 18,
      drawUnderNavBar: true,
      navBarNoBorder: true,
      screenBackgroundColor: backgroundColor
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
    wrapperCircleSearch: {
      zIndex: 50,
      width: 56 + 16 + 2,
      height: 56 + 16,
      borderRadius: 28,
      position: 'absolute',
      bottom: 0,
      right: 0
    },
    circleSearch: {
      zIndex: 50,
      width: 56,
      height: 56,
      borderRadius: 28,
      position: 'absolute',
      bottom: 16,
      right: 16,
      backgroundColor: fontNearAlabaster,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 3
    },
    circleOption: {
      width: 42,
      height: 42,
      borderRadius: 21,
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
      backgroundColor: fontDark,
      shadowColor: 'rgba(76,0,0,0)',
      shadowOffset: {
        width: 0,
        height: 0.5
      }
    },
    searchBarContainerClone: {
      height: 48,
      paddingHorizontal: 16,
      flexDirection: 'row',
      marginTop: Platform.OS === 'ios' ? style.marginSize - 4 : 0,
      alignItems: 'center',
      backgroundColor: statusBarBgColor,
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
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: color.sell
    },
    largeBadge: {
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: color.sell,
      paddingHorizontal: 4
    },
    btnRectDisable: {
      ...btnRect,
      backgroundColor: btnDisable
    },
    btnRectBuy: {
      ...btnRect,
      backgroundColor: fontGreen
    },
    btnRectSell: {
      ...btnRect,
      backgroundColor: fontRed
    },
    btnRectActive: {
      // ...btnRect,
      borderColor: fontBlue,
      borderWidth: 1,
      backgroundColor: fontBlue
    },
    btnRectInActive: {
      // ...btnRect,
      borderColor: fontButton,
      borderWidth: 1,
      backgroundColor: backgroundColor
    },
    btnRectBlue: {
      ...btnRect,
      backgroundColor: fontBlue
    },
    btnRectRed: {
      ...btnRect,
      backgroundColor: fontRed
    },
    btnTabRectLeft: {
      ...btnRect,
      borderRadius: 0,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4
    },
    btnTabRectRight: {
      ...btnRect,
      borderRadius: 0,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4
    },
    btnTabRectMiddle: {
      ...btnRect,
      borderRadius: 0
    },
    iconModal: {
      color: fontBlack
    },
    textMainOrigin: {
      fontFamily: style.fontMedium,
      fontSize: style.fontSizeM,
      color: style.fontColor,
      opacity: opacity
    },
    themeScreen: {
      flex: 1,
      backgroundColor,
      paddingHorizontal: 16,
      paddingTop: 1.5
    },
    themeRowContent: {
      paddingVertical: 14.5,
      paddingLeft: 16,
      flexDirection: 'row'
    },
    themeTxtContent: {
      color: fontColor,
      fontSize: fontSizeS,
      fontFamily: fontPoppinsRegular
    },
    headerBorder: {
      backgroundColor,
      paddingHorizontal: paddingSizeOrders,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      paddingVertical: 6,
      // height: CommonStyle.heightM,
      width: '100%'
    },
    textSymbolName: {
      fontFamily: fontPoppinsBold,
      fontSize: style.fontSizeL,
      color: style.fontColor
    },
    textVolume: {
      opacity: style.opacity1,
      fontFamily: style.fontLight,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textNoData: {
      fontFamily: fontPoppinsRegular,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textCnote: {
      fontFamily: fontPoppinsRegular,
      color: fontColor,
      opacity: 0.7,
      fontSize: fontSizeM - 3,
      fontWeight: '300'
    },
    textSymbolCnote: {
      fontSize: font15,
      fontWeight: '500',
      fontFamily: fontPoppinsBold,
      // textAlign: 'right',
      paddingLeft: 16,
      color: fontColor,
      opacity: opacity
    },
    whiteText: {
      color: fontBlue,
      fontSize: fontSizeM,
      fontFamily: fontFamily
    },
    whiteText1: {
      color: fontWhite,
      fontSize: fontSizeM,
      fontFamily: fontFamily
    },
    textCurrencies: {
      fontFamily: 'HelveticaNeue-Medium',
      fontSize: fontSizeM,
      color: fontColor,
      opacity: 1
    },
    textNameInsights: {
      opacity: style.opacity,
      fontFamily: style.fontFamily,
      fontSize: style.fontSizeM,
      color: style.fontColor
    },
    whiteTextHeader: {
      color: fontColor,
      fontFamily: fontMedium,
      fontSize: fontSizeM
    },
    headerInsights: {
      width: '100%',
      paddingVertical: 12,
      backgroundColor: colorHeader,
      alignItems: 'center',
      flexDirection: 'row',
      paddingLeft: paddingSize,
      paddingRight: 20
    },
    textHeaderInsights: {
      color: fontColor,
      opacity: opacity,
      fontFamily: fontMedium,
      fontSize: fontSizeXL,
      shadowColor: '#0000007f',
      shadowOffset: {
        width: 0,
        height: 1
      }
    },
    textTimeInsights: {
      color: fontColor,
      opacity: opacity1,
      fontFamily: fontFamily,
      fontSize: fontSizeS
    },
    chartContainer: {
      flex: 1,
      shadowColor: '#00000054',
      shadowOffset: {
        width: 0,
        height: 0
      },
      borderRadius: borderRadius,
      shadowOpacity: 1,
      shadowRadius: 2,
      // marginHorizontal: 16,
      // paddingRight: 16,
      backgroundColor: backgroundColor
    },
    headerContentInsights: {
      width: '100%',
      // height: CommonStyle.heightS,
      paddingVertical: 4,
      backgroundColor: colorHeaderAll,
      // alignItems: 'center',
      // flexDirection: 'row',
      paddingHorizontal: paddingSize
    },
    footerInsights: {
      width: '100%',
      height: heightM,
      backgroundColor: colorHeaderAll,
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: paddingSize
    },
    chartDescriptionInsights: {
      color: fontWhite,
      fontSize: font13,
      opacity: opacity1
    },
    colChart2_2: {
      width: '50%',
      paddingLeft: 8,
      color: fontWhite
    },
    colChart2_3: {
      width: '38%',
      textAlign: 'right',
      color: fontWhite
    },
    iconPickerInsights: {
      color: fontColor,
      opacity: opacity2,
      right: 5,
      // top: -5,
      width: 24,
      height: 24,
      textAlign: 'right',
      position: 'absolute'
    },
    filterField: {
      width: (width - 48) / 2,
      alignItems: 'center',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: fontBorderGray
    },
    separator: {
      marginTop: 14,
      height: 1,
      width: '100%',
      borderBottomWidth: 1,
      borderColor: fontBorderGray
    },
    noteChart: {
      fontSize: font11,
      color: fontWhite
    },
    legendText: {
      color: fontNearLight1,
      fontSize: font10,
      fontFamily: fontFamily
    },
    headerContentTransaction: {
      // height: CommonStyle.heightS,
      paddingVertical: 7,
      width: '100%',
      backgroundColor: colorHeaderAll,
      paddingHorizontal: 16
      // alignItems: 'center',
      // flexDirection: 'row'
    },
    footerContainerTransaction: {
      height: heightM,
      width: width,
      backgroundColor: colorHeaderAll,
      paddingHorizontal: 16,
      alignItems: 'center',
      flexDirection: 'row'
    },
    textFloatingLabelInsights: {
      opacity: style.opacity1,
      fontFamily: style.fontLight,
      fontSize: style.fontSizeXS,
      color: style.fontColor
    },
    textNormal: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeS,
      color: fontColor,
      opacity: opacity1
    },
    textNormalTime: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeS,
      color: fontColor,
      opacity: opacity
    },
    leftButton: {
      fontFamily: 'HelveticaNeue',
      fontSize: fontSizeM,
      textAlign: 'left',
      color: fontWhite
    },
    filterTitle: {
      flex: 2,
      alignItems: 'center',
      color: fontWhite
    },
    filterRightButton: {
      flex: 1,
      alignItems: 'flex-end',
      color: fontWhite
    },
    rightButton: {
      fontFamily: 'HelveticaNeue',
      fontSize: fontSizeM,
      textAlign: 'right',
      color: fontWhite
    },
    textNormalUser: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: fontColor,
      opacity: 0.78
    },
    rowContainer: {
      width: '100%',
      backgroundColor,
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: fontBorderGray,
      paddingHorizontal: paddingSize,
      paddingVertical: 6,
      alignItems: 'center'
    },
    modalWrapper: {
      flex: 1,
      width: width,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)'
    },
    inputText: {
      fontSize: fontSizeM - 3,
      color: fontColor,
      opacity: opacity,
      fontFamily: fontPoppinsRegular,
      width: '100%',
      marginBottom: 10
    },
    codeStyle: {
      fontSize: fontSizeM,
      color: fontColor,
      opacity: opacity,
      fontFamily: fontFamily
    },
    companyStyle: {
      fontSize: fontSizeS,
      color: fontColor,
      opacity: opacity1,
      fontFamily: fontFamily
    },
    iconAdd: {
      width: '15%',
      color: fontColor,
      fontSize: iconSizeM,
      opacity: opacity1
    },
    iconCheck: {
      width: '15%',
      color: '#00c752',
      fontSize: iconSizeM - 4
    },
    colorHeaderFindWatchlist: {
      height: 48,
      width: width,
      flexDirection: 'row',
      marginTop: Platform.OS === 'ios' ? style.marginSize - 4 : 0,
      alignItems: 'center',
      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
      borderBottomWidth: 1,
      paddingLeft: style.paddingDistance2,
      backgroundColor: fontDark,
      shadowColor: 'rgba(76,0,0,0)',
      shadowOffset: {
        width: 0,
        height: 0.5
      }
    },
    historyBar: {
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: bgColorConfirmOrder,
      borderBottomColor: 'rgba(0, 0, 0, 0.12)',
      borderBottomWidth: 0,
      borderTopColor: 'rgba(0, 0, 0, 0.12)',
      borderTopWidth: 1,
      paddingLeft: 16,
      border
    },
    navBarCustom: {
      height: 48,
      width,
      flexDirection: 'row',
      marginTop: Platform.OS === 'ios' ? style.marginSize - 4 : 0,
      alignItems: 'center',
      paddingLeft: paddingDistance2,
      backgroundColor: fontDark,
      shadowColor: 'rgba(76,0,0,0)',
      shadowOffset: {
        width: 0,
        height: 0.5
      }
    },
    subTitle: {
      fontFamily: fontFamily,
      color: fontColor,
      fontSize: fontSizeS,
      // opacity: opacity1,
      marginRight: 10,
      marginTop: -3,
      maxWidth: '90%',
      textAlign: 'center'
    },
    mainTitleNav: {
      fontFamily: fontPoppinsBold,
      fontSize: fontSizeXXL,
      color: fontColor
    },
    subTitleNav: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: fontNearLight2,
      paddingBottom: paddingDistance2
    },
    subTitle1: {
      fontFamily: fontPoppinsRegular,
      color: fontColor,
      fontSize: fontSizeXS,
      opacity: 0.4,
      marginRight: 10,
      maxWidth: '90%',
      textAlign: 'left'
    },
    containerAppInfo: {
      flex: 1,
      backgroundColor:
        Platform.OS === 'ios'
          ? backgroundColorNews
          : backgroundColorNews
    },
    logo: {
      alignItems: 'center',
      paddingTop: 24,
      backgroundColor: backgroundColorNews,
      width: '100%',
      borderBottomRightRadius: borderBottomRightRadius,
      zIndex: 2
    },
    content: {
      backgroundColor: ColorTabNews,
      width: '100%',
      borderBottomRightRadius: borderBottomRightRadius,
      paddingBottom: 8,
      paddingTop: 16
    },
    textLink: {
      color: fontColor,
      opacity: opacity,
      fontSize: fontSizeM,
      // width: '25%',
      paddingRight: 16
    },
    textwebsite: {
      opacity: style.opacity,
      fontFamily: style.fontLight,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textRate: {
      opacity: style.opacity,
      fontFamily: style.fontFamily,
      fontSize: style.fontSizeM,
      color: style.fontColor
    },
    colorWhatsNew: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: fontBorderNewsUi
    },
    textHeaderWhatsNew: {
      fontFamily: style.fontMedium,
      fontSize: style.fontSizeS,
      opacity: style.opacity,
      color: style.fontColor
    },
    textWhatsNew: {
      opacity: style.opacity,
      fontFamily: style.fontFamily,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    containerFromMenu: {
      flex: 1,
      backgroundColor: backgroundColor
    },
    containerTerm: {
      flex: 1,
      backgroundColor: backgroundColor
    },
    confirmContent: {
      width: '100%',
      paddingBottom: 10,
      paddingTop: 10,
      paddingLeft: 16,
      paddingRight: 16,
      marginBottom: 10
    },
    textNewOrder: {
      opacity: style.opacity1,
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeXS,
      color: style.fontColor
    },
    headerLeft: {
      backgroundColor,
      width: '50%',
      justifyContent: 'flex-end',
      flexDirection: 'row',
      borderRightWidth: 0.5,
      borderRightColor: 'transparent'
    },
    headerRight: {
      backgroundColor,
      width: '50%',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      borderLeftWidth: 0,
      borderLeftColor: 'transparent'
    },
    sectContentText: {
      fontFamily: fontPoppinsRegular,
      color: fontColor,
      opacity: 0.5,
      fontSize: fontSizeS,
      flex: 1
    },
    sectContentText1: {
      color: fontColor,
      opacity: opacity,
      fontSize: fontSizeM
    },
    sectContent: {
      flexDirection: 'row',
      paddingVertical: 14,
      alignItems: 'center',
      paddingLeft: 16,
      paddingRight: 16,
      minHeight: 30
    },
    sectContent1: {
      flexDirection: 'row',
      paddingVertical: 14,
      alignItems: 'center',
      paddingLeft: 40,
      paddingRight: 16,
      minHeight: 30
    },
    sectBackground: {
      backgroundColor: fontDefaultColor,
      width: '100%'
    },
    sectSeparator: {
      height: 1,
      backgroundColor: fontBorderGray
    },
    langSelected: {
      // opacity: opacity1,
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeS,
      fontWeight: '300',
      color: fontColor
    },
    pinView: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      height: 50,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.12)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.12)'
    },
    iconModal1: {
      backgroundColor: 'transparent',
      color: fontBlack,
      right: -5,
      top: 2
    },
    addAlertIconLeft: {
      color: fontRed1,
      fontSize: iconSizeM,
      // width: '10%',
      textAlign: 'left',
      marginRight: paddingDistance2
    },
    addAlertIconRight: {
      color: colorIconSettings,
      fontSize: fontSizeXXL,
      width: '10%',
      textAlign: 'right',
      opacity: opacity2
    },
    searchBar2: {
      backgroundColor: 'rgba(254, 254, 254, 0.2)',
      borderRadius: borderRadius,
      height: 32,
      alignItems: 'center',
      flexDirection: 'row'
    },
    searchBarLight: {
      backgroundColor: fontBorderGray,
      borderRadius: borderRadius,
      height: 32,
      alignItems: 'center',
      flexDirection: 'row'
    },
    iconSearch2: {
      color: 'rgba(255, 255, 255, 0.54)',
      fontSize: iconSizeS,
      paddingRight: paddingDistance2,
      paddingLeft: paddingDistance2
    },
    iconSearchDark: {
      color: fontWhite,
      fontSize: iconSizeM,
      paddingRight: paddingDistance2,
      paddingLeft: paddingDistance2
    },
    iconRight2: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: iconSizeS,
      width: '10%',
      textAlign: 'right',
      paddingRight: paddingDistance2
    },
    iconSearchLight: {
      color: '#8e8e93',
      fontSize: iconSizeS,
      paddingRight: paddingDistance2,
      paddingLeft: paddingDistance2
    },
    iconCloseLight: {
      color: fontWhite,
      fontSize: iconSizeS,
      // backgroundColor: 'yellow',
      width: 18,
      height: 18,
      borderRadius: 9
    },
    textInputSearchLight: {
      backgroundColor: 'transparent',
      color: fontWhite,
      fontSize: fontSizeS,
      fontFamily: fontFamily,
      paddingTop: 0,
      paddingBottom: 0
    },
    buttonCancel: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row'
    },
    iconPickerUp: {
      width: 8 * fontRatio,
      height: 16 * fontRatio,
      fontSize: iconSizeS * fontRatio,
      lineHeight: 16 * fontRatio,
      textAlign: 'center',
      // top: 2,
      opacity: opacity2,
      backgroundColor: 'transparent',
      color: '#ffffff'
    },
    iconPickerUp2: {
      width: 8 * fontRatio,
      height: 16 * fontRatio,
      fontSize: iconSizeS * fontRatio,
      lineHeight: 16 * fontRatio,
      textAlign: 'center',
      top: 2,
      backgroundColor: 'transparent',
      color: '#ffffff'
    },
    iconPickerDown: {
      width: 8 * fontRatio,
      height: 16 * fontRatio,
      fontSize: iconSizeS * fontRatio,
      lineHeight: 16 * fontRatio,
      textAlign: 'center',
      top: 1,
      backgroundColor: 'transparent',
      color: colorProduct,
      fontWeight: '500'
    },
    iconPickerDown2: {
      width: 8 * fontRatio,
      height: 16 * fontRatio,
      fontSize: iconSizeS * fontRatio,
      lineHeight: 16 * fontRatio,
      textAlign: 'center',
      top: 1,
      backgroundColor: 'transparent',
      color: colorProduct,
      fontWeight: '500'
    },
    pickerContainer: {
      flexDirection: 'row',
      width: '100%',
      height: 26 * fontRatio,
      alignItems: 'center',
      justifyContent: 'center'
    },
    selectedText: {
      backgroundColor: 'transparent',
      fontSize: fontSizeXS,
      fontFamily: fontPoppinsRegular,
      color: colorProduct,
      textAlign: 'right',
      justifyContent: 'flex-end',
      width: '98%',
      height: 40,
      paddingHorizontal: 16
    },
    containerHeader: {
      backgroundColor: fontBlack,
      flexDirection: 'row',
      borderBottomColor: fontBorderGray,
      borderBottomWidth: 1,
      paddingVertical: 10,
      marginHorizontal: 8
    },
    separateLine: {
      height: 1,
      backgroundColor: fontBorderGray,
      marginHorizontal: 8,
      opacity: 0.7
    },
    footerAvoidQuickButton: {
      height: heightTabbar,
      borderTopWidth: 1,
      borderTopColor: fontBorderGray,
      marginRight: 16,
      marginLeft: 16
    },
    containerHeaderNoBoder: {
      backgroundColor: colorEdge,
      flexDirection: 'row',
      paddingVertical: 10,
      marginHorizontal: 8
    },
    textStyleHeader: {
      fontSize: fontSizeM,
      fontFamily: 'HelveticaNeue-Medium',
      fontWeight: '500',
      flex: 1,
      color: fontWhite
    },
    textStyleContent: {
      fontSize: fontSizeS,
      fontFamily: 'HelveticaNeue-Medium',
      fontWeight: '500',
      color: fontWhite,
      marginTop: 5
    },
    textStyleContent1: {
      fontSize: fontSizeS,
      fontFamily: 'HelveticaNeue-Medium',
      fontWeight: '500',
      color: fontWhite
    },
    dragHandler: {
      alignSelf: 'stretch',
      height: 40,
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: colorBgNewAlert,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20
    },
    dragHandlerNewOrder: {
      width: '100%',
      flexDirection: 'row',
      alignSelf: 'stretch',
      alignItems: 'center',
      paddingLeft: 16,
      justifyContent: 'center',
      backgroundColor: backgroundColor,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20
    },
    dragIcons: {
      marginTop: 8,
      width: 36,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: color.lightWhite
    },
    closeIcon: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: color.dusk,
      justifyContent: 'center',
      alignItems: 'center'
    },
    c2rIcon: {
      width: 24,
      height: 24,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center'
    },
    dragIconsVisible: {
      marginTop: 8,
      width: 36,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: 'transparent'
    },
    textAlert: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: fontNearLight6
    },
    companyAlert: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: fontColor,
      opacity: opacity6
    },
    textSubNumber: {
      opacity: style.opacity,
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textnumberNewAlert: {
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeXS,
      color: fontNearLight1
    },
    btnRadioNewAlert: {
      width: 19,
      height: 19,
      borderRadius: 9.5,
      borderWidth: 1,
      borderColor: fontBorderRadius
    },
    rowQuickButton: {
      marginTop: 8,
      flexDirection: 'row',
      alignItems: 'center'
    },
    styleChartNodataWrapper: {
      flex: 1,
      backgroundColor,
      justifyContent: 'center',
      alignItems: 'center'
    },
    styleChartNodataText: {
      color: fontColor,
      fontSize: fontSizeS,
      marginTop: 9
    },
    textQuickButton: {
      backgroundColor: 'transparent',
      color: fontWhite,
      marginRight: 8
    },
    textAuctionHeader: {
      fontSize: fontSizeXS,
      opacity: 0.87,
      fontFamily: 'HelveticaNeue',
      color: fontWhite
    },
    textAuctionBottom: {
      fontSize: fontSizeS,
      opacity: 0.87,
      color: fontWhite
    },
    styleViewAuction: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 16
    },
    fontText: {
      color: 'white'
    },
    iconColapsible: {
      color: 'rgba(0, 0, 0, 0.54)',
      fontSize: iconSizeM
    },
    buttonExpand: {
      backgroundColor: fontWhite,
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      paddingTop: paddingSize,
      paddingBottom: 8,
      paddingHorizontal: paddingSize
    },
    DragBar: {
      flexDirection: 'row',
      marginTop: Platform.OS === 'ios' ? 4 : 0,
      shadowColor: fontColor,
      shadowOffset: {
        width: 0,
        height: -4
      },
      shadowOpacity: 0.1,
      borderTopWidth: Platform.select({ ios: 0, android: 0.2 }),
      borderTopColor: fontBlack,
      elevation: 0.4,
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      height: 32
    },
    closeIconSlide: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#ececec',
      justifyContent: 'center',
      alignItems: 'center'
    },
    textFontSize: {
      color: fontBlack,
      fontSize: fontSizeM,
      fontFamily: fontFamily
    },
    dialogContent2: {
      width: 334,
      backgroundColor: fontDefaultColor,
      borderRadius: 12,
      height: 260
    },
    dialogTitle: {
      paddingTop: 32,
      paddingHorizontal: 20,
      paddingBottom: 8
    },
    dialogTitleText: {
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeM,
      color: style.fontWhite,
      textAlign: 'center'
    },
    dialogSubTitle: {
      paddingHorizontal: 20,
      paddingBottom: 16
    },
    dialogSubTitleText: {
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeXS,
      color: style.fontWhite,
      textAlign: 'center'
    },
    dialogBody: {
      flexDirection: 'row',
      marginHorizontal: 16,
      backgroundColor: style.fontColorSwitchTrue,
      paddingHorizontal: 4,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center'
    },
    dialogInput: {
      width: 286,
      paddingHorizontal: 20,
      marginHorizontal: 4,
      height: 48,
      fontFamily: style.fontPoppinsRegular,
      fontSize: style.fontSizeM,
      color: style.fontWhite
    },
    rightIcon: {
      height: Platform.OS === 'ios' ? 32 : 42,
      justifyContent: 'center',
      alignItems: 'center',
      paddingRight: 20
    },
    errorContainer: {
      height: 32,
      width: '100%',
      paddingHorizontal: paddingSize,
      justifyContent: 'center',
      alignItems: 'center'
    },
    dialogFooter: {
      flexDirection: 'row',
      height: 39,
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      marginTop: 16
    },
    dialogAction: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      alignContent: 'center'
    },
    dialogActionText: {
      fontSize: fontSizeS,
      textAlign: 'center',
      fontFamily: fontPoppinsRegular,
      color: fontColorButtonSwitch
    },
    arrowBackColor: fontBlue,
    scrollBarIndicatorStyle: 'white',
    authenticationVersion2: {
      colorBlue: '#5bb7c2',
      colorWhite: '#efefef',
      colorGrey: '#9b9b9b'
    },
    pinVersion2: {
      pinBox: {
        alignItems: 'center',
        width: 40,
        height: 48,
        marginRight: 6,
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: '#3a425e'
      },
      pinBoxText: {
        fontSize: fontSizeM,
        color: fontWhite,
        fontFamily: fontPoppinsRegular
      },
      pinBackgroundColor: '#3a425e',
      errorText: {
        fontSize: fontSizeS,
        fontFamily: fontPoppinsRegular,
        color: '#eb413c'
      },
      forgotPinText: {
        color: '#5bb7c2',
        fontSize: fontSizeS,
        fontFamily: fontPoppinsRegular
      },
      enterPinTitleText: {
        textAlign: 'center',
        color: fontWhite,
        fontSize: fontSizeXXL,
        fontFamily: fontPoppinsBold
      },
      changePinBackgroundColor: '#262b3e',
      pinTitleBackgroundColor: '#171c29'
    },
    headerDrawer: {
      width: WIDTH_DRAWER,
      backgroundColor: headerDrawerBgColor,
      borderBottomRightRadius: borderBottomRightRadius,
      paddingTop: 36,
      paddingLeft: 36,
      overflow: 'hidden',
      paddingBottom: 24
    },
    headerDrawerAndroid: {
      width: WIDTH_DRAWER,
      backgroundColor: headerDrawerBgColor,
      borderBottomRightRadius: borderBottomRightRadius,
      paddingTop: 36,
      paddingLeft: 36,
      overflow: 'hidden',
      paddingBottom: 24
    },
    warningDrawer: {
      paddingVertical: 4,
      zIndex: -1,
      justifyContent: 'flex-end',
      alignItems: 'center'
    },
    textWarningDrawer: {
      fontFamily: 'HelveticaNeue',
      fontSize: fontSizeS,
      fontWeight: '300',
      textAlign: 'center',
      color: '#e21100',
      opacity: 0
    },
    textMainHeaderDrawer: {
      color: fontBlack,
      fontSize: fontSizeS,
      fontFamily: fontPoppinsRegular
    },
    textSubHeaderDrawer: {
      color: fontBlack,
      opacity: 0.5,
      fontSize: fontSizeXS,
      fontFamily: fontPoppinsRegular
    },
    subTitleHeaderNavBar: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeL,
      color: fontColor
    },
    timeUpdatedTitleHeaderNavBar: {
      fontFamily: fontPoppinsItalic,
      fontSize: fontMin,
      color: fontColor,
      opacity: 0.3
    },
    headerContainer: {
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: color.dusk
    },
    rowHeader: {
      // height: 72,
      marginHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: color.dark
    },
    textDataMain: {
      fontFamily: fontPoppinsBold,
      fontSize: style.fontSizeS,
      color: style.fontColor
    },
    textDataSub: {
      fontFamily: fontPoppinsRegular,
      fontSize: style.fontSizeXS,
      color: style.fontColor
    },
    textSubSell: {
      fontFamily: fontPoppinsRegular,
      fontSize: style.fontSizeXS,
      color: color.sell
    },
    textSubBuy: {
      fontFamily: fontPoppinsRegular,
      fontSize: style.fontSizeXS,
      color: color.buy
    },
    iconHeader: {
      fontSize: style.fontSizeXXL,
      color: fontWhite
    },
    customDate: {},
    textFloatingLabel: {
      opacity: 0.5,
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeTen,
      color: fontWhite
    },
    iconCustomDate: {
      fontSize: style.font17,
      color: color.modify
    },
    textCompany: {
      opacity: 0.5,
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: fontWhite
    },
    textMainPriceFlashing: {
      fontFamily: fontPoppinsBold,
      fontSize: fontSizeL
      // color: color.buy
    },
    textMainPointFlashing: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeS
      // color: color.sell
    },
    textSubPointFlashing: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS
      // color: color.sell
    },
    orderDetailButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    buttonBuySell: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100,
      height: 30,
      paddingVertical: 6
    },
    textButtonBuySell: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: fontBlack
    },
    blockDataContainer: {
      width: '50%',
      paddingVertical: 4
    },
    textFloatingLabelBlockData: {
      opacity: 0.4,
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: fontWhite
    },
    textSubData: {
      fontFamily: fontPoppinsRegular,
      fontSize: fontSizeXS,
      color: 'rgba(255, 255, 255, 0.4)'
    },
    specialTextBlockData: {
      fontFamily: fontPoppinsBold,
      fontSize: fontSizeS,
      color: color.dark
    },
    specialBlockContainer: {
      height: 20,
      borderRadius: 4,
      paddingHorizontal: 8,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start'
    },
    rightTextBold: {
      fontFamily: fontPoppinsBold,
      fontSize: fontSizeS,
      color: fontWhite
    },
    accountInfo: {
      fontSize: fontSizeS,
      color: fontColor,
      opacity: opacity1,
      fontFamily: fontPoppinsRegular
    },
    subTitleHeader: {
      fontSize: fontSizeXS,
      color: fontColor,
      opacity: opacity5,
      fontFamily: fontPoppinsRegular,
      paddingLeft: 32
    },
    dragIconContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      paddingTop: 6,
      paddingBottom: 8,
      zIndex: 99
    },
    dragIcon: {
      width: 33,
      height: 4,
      borderRadius: 2.5,
      zIndex: 99,
      backgroundColor: color.lightWhite
    },
    titlePanel: {
      fontSize: style.fontSizeM,
      color: fontColor,
      fontFamily: fontPoppinsBold
    },
    timeUpdated: {
      fontFamily: fontPoppinsItalic,
      fontSize: fontMin,
      color: fontColor,
      opacity: 0.3
    },
    titleInput: {
      fontSize: fontSizeXS,
      color: fontNearLight6,
      fontFamily: fontPoppinsRegular
    },
    textNumberOfKeyBoard: {
      fontSize: fontSizeXXL,
      color: fontColor,
      fontFamily: fontPoppinsRegular
    },
    layoutRowWrapperBasic: {
      flexDirection: 'row'
    },
    layoutRowWrapperAdvance: {
      flexDirection: 'column'
    },
    layoutChildAdvance: {
      flex: 0,
      width: '100%'
    },
    layoutChildBasic: {
      flex: 0,
      width: '50%'
    }
  };
  return style;
}

export default getDarkTheme;

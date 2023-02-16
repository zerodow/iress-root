import { Platform, PixelRatio } from 'react-native';
import { dataStorage } from './storage';
const fontSizeStandard = 16;
const paddingSizeStandard = 16;
const paddingSizeOrders = 14
const fontWeightStandard = 400;

export default {
  // margin padding
  paddingSizeOrders: paddingSizeOrders,
  paddingSize: paddingSizeStandard,
  marginSize: paddingSizeStandard,
  paddingDistance1: paddingSizeStandard - 4,
  paddingDistance2: paddingSizeStandard / 2,

  // height
  heightL: 56,
  heightM: 48,
  heightS: 40,

  // opacity
  opacity1: 0.87,
  opacity2: Platform.OS === 'ios' ? 0.78 : 0.54,

  // fontSize
  fontMin: fontSizeStandard - 8,
  font10: fontSizeStandard - 6,
  font11: fontSizeStandard - 5,
  font13: fontSizeStandard - 3,
  font15: fontSizeStandard - 1,
  fontTiny: fontSizeStandard - 7,
  fontSizeXS: fontSizeStandard - 4,
  fontSizeS: fontSizeStandard - 2,
  fontSizeM: fontSizeStandard,
  fontSizeL: fontSizeStandard + 2,
  fontSizeXL: fontSizeStandard + 4,
  fontSizeXXL: fontSizeStandard + 8,

  // font ratio
  fontRatio: PixelRatio.getFontScale() > 1.4 ? 1 : PixelRatio.getFontScale(),

  // fontFamily
  fontBold: 'HelveticaNeue-Bold',
  fontFamily: 'HelveticaNeue',
  fontLight: 'HelveticaNeue-Light',
  fontMedium: 'HelveticaNeue-Medium',
  fontbold: 'HelveticaNeue-Bold',
  // fontSanFrancisco: '',

  // fontColor
  fontColor: 'black',
  fontRed: '#df0000',
  fontGreen: '#00b800',
  fontBlue: '#10a8b2',
  fontYellow: '#F8BE5C',
  fontViolet: '#3f51b5',
  fontWhite: '#fff',
  fontGray: '#8c8c8c',
  fontLink: '#197bc8',
  fontApple: '#007aff',
  fontDisable: '#808080',

  // icon
  iconSizeS: 18,
  iconSizeM: 24,

  // border
  borderColor: '#0000001e',
  borderRadius: 2,
  borderWidthThin: 1,
  // text align
  textAlignCenter: 'center'
};

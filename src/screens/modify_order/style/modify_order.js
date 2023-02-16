import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
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
    summary: {
      width: '100%',
      paddingBottom: 10,
      paddingTop: 10,
      paddingLeft: 16,
      paddingRight: 16,
      marginBottom: 10
    },
    headerContent: {
      height: 24,
      borderRadius: CommonStyle.borderRadius,
      backgroundColor: '#f8f8f8',
      width: '95%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonExpand: {
      backgroundColor: 'white',
      flexDirection: 'row',
      // alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingTop: CommonStyle.paddingSize,
      paddingBottom: 8,
      paddingHorizontal: CommonStyle.paddingSize
    },
    rowExpand: {
      backgroundColor: 'white',
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 10,
      width: '100%',
      flexDirection: 'row'
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
      // height: 48,
      paddingLeft: 16,
      paddingRight: 16,
      width: '100%',
      justifyContent: 'center'
    },
    midFooter: {
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderColor: '#979797',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      paddingBottom: 6
    },
    columFooter: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      paddingBottom: 6
    },
    buttonSellBuy: {
      width: width - 32,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 30,
      paddingVertical: 4,
      paddingHorizontal: 8
    },
    pickerContainer: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      height: 26
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
    iconPickerUp: {
      width: 16 * CommonStyle.fontRatio,
      height: 13 * CommonStyle.fontRatio,
      fontSize: CommonStyle.iconSizeS * CommonStyle.fontRatio,
      lineHeight: 16 * CommonStyle.fontRatio,
      textAlign: 'center',
      top: 3 * CommonStyle.fontRatio,
      opacity: CommonStyle.opacity2,
      backgroundColor: 'transparent'
    },
    iconPickerDown: {
      width: 16 * CommonStyle.fontRatio,
      height: 13 * CommonStyle.fontRatio,
      fontSize: CommonStyle.iconSizeS * CommonStyle.fontRatio,
      lineHeight: 16 * CommonStyle.fontRatio,
      textAlign: 'center',
      top: 3 * CommonStyle.fontRatio,
      opacity: CommonStyle.opacity2,
      backgroundColor: 'transparent'
    }
  })

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

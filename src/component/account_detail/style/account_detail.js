import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    header: {
      backgroundColor: config.colorVersion,
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize,
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '100%',
      marginTop: 16
    },
    subHeader: {
      backgroundColor: 'rgba(10, 167, 177, 0.3)',
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize,
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '100%',
      marginBottom: 8
    },
    content: {
      paddingLeft: CommonStyle.paddingSize,
      width: '100%'
    },
    contentEdit: {
      paddingHorizontal: CommonStyle.paddingSize,
      width: '100%'
    },
    rowContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: CommonStyle.paddingSize,
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '100%'
    },
    rowCheckVertical: {
      backgroundColor: 'white',
      flexDirection: 'row',
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '100%'
    },
    rowContent: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingRight: CommonStyle.paddingSize,
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '90%',
      borderBottomWidth: 1,
      borderColor: '#0000001e'
    },
    rowContentNoBorder: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingRight: CommonStyle.paddingSize,
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '90%'
    },
    checkContainer: {
      backgroundColor: 'white',
      alignItems: 'center',
      width: '100%'
    },
    row: {
      backgroundColor: 'white',
      height: CommonStyle.heightM,
      justifyContent: 'center',
      width: '100%',
      borderBottomWidth: 1,
      borderColor: '#0000001e'
    },
    rowNoHeight: {
      justifyContent: 'center',
      width: '100%',
      borderBottomWidth: 1,
      borderColor: '#0000001e',
      paddingVertical: 4
    },
    rowNoBorder: {
      backgroundColor: 'white',
      justifyContent: 'center',
      width: '100%',
      paddingVertical: 4
    },
    row2: {
      justifyContent: 'center',
      flexDirection: 'row',
      width: '100%'
    },
    textCol1: {
      width: '10%'
    },
    textCol2: {
      width: '55%'
    },
    textCol3: {
      width: '45%'
    },
    mainText: {
      fontFamily: CommonStyle.fontMedium,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeM,
      opacity: CommonStyle.opacity1
    },
    mainText2: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeM,
      opacity: CommonStyle.opacity1
    },
    subText: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeS,
      opacity: CommonStyle.opacity2
    },
    textHeader: {
      fontFamily: CommonStyle.fontMedium,
      color: '#ffffff',
      fontSize: CommonStyle.fontSizeM
    },
    iconHeader: {
      color: '#ffffff',
      textAlign: 'right'
    },
    textField: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      opacity: CommonStyle.opacity2,
      paddingBottom: 4
    },
    title: {
      fontFamily: CommonStyle.fontMedium,
      color: '#10a8b2',
      fontSize: CommonStyle.fontSizeM,
      paddingVertical: CommonStyle.paddingSize,
      paddingRight: CommonStyle.paddingSize
    },
    col1: {
      width: '45%'
    },
    col2: {
      width: '13%'
    },
    col3: {
      width: '20%'
    },
    col4: {
      width: '22%'
    },
    checkText: {
      paddingVertical: 4
    },
    iconPicker: {
      position: 'absolute',
      right: 0,
      top: 20,
      width: CommonStyle.iconSizeM,
      height: CommonStyle.iconSizeM,
      fontSize: CommonStyle.iconSizeS,
      lineHeight: CommonStyle.iconSizeM,
      textAlign: 'center',
      opacity: CommonStyle.opacity2,
      backgroundColor: 'transparent'
    },
    iconPicker2: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: CommonStyle.iconSizeM,
      height: CommonStyle.iconSizeM,
      lineHeight: CommonStyle.iconSizeM,
      textAlign: 'center',
      opacity: CommonStyle.opacity2,
      backgroundColor: 'transparent'
    },
    textExtra: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      position: 'absolute',
      right: 0
    },
    textExtra2: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS
    },
    textExtra3: {
      fontFamily: CommonStyle.fontMedium,
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontSize: CommonStyle.fontSizeS,
      position: 'absolute',
      right: 0,
      top: 25
    },
    textExtra4: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity2,
      fontSize: CommonStyle.fontSizeXS,
      position: 'absolute',
      right: 0,
      top: 25
    },
    yesNo: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.font15,
      opacity: CommonStyle.opacity1
    },
    add: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 16,
      marginBottom: -8
    },
    orText: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      opacity: CommonStyle.opacity1
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

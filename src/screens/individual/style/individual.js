import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
    searchBarContainer: {
      height: 44,
      paddingLeft: CommonStyle.paddingDistance2,
      paddingRight: CommonStyle.paddingDistance2,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderColor: '#0000001e',
      backgroundColor: 'white',
      justifyContent: 'center',
      width: '100%'
    },
    searchBar: {
      borderWidth: 1,
      borderColor: '#0000001e',
      height: 30,
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontFamily: CommonStyle.fontMedium,
      color: '#10a8b2',
      fontSize: CommonStyle.fontSizeM,
      paddingVertical: CommonStyle.paddingSize,
      paddingRight: CommonStyle.paddingSize
    },
    iconSearch: {
      color: '#8e8e93',
      fontSize: CommonStyle.iconSizeS,
      paddingRight: CommonStyle.paddingDistance2
    },
    searchPlaceHolder: {
      color: '#8e8e93',
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontFamily
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
    header: {
      backgroundColor: 'white',
      flexDirection: 'row',
      height: CommonStyle.heightS,
      paddingRight: CommonStyle.paddingSize,
      alignItems: 'center',
      width: '90%',
      borderBottomWidth: 1,
      borderColor: '#0000001e'
    },
    content: {
      paddingLeft: CommonStyle.paddingSize,
      width: '100%'
    },
    contentEdit: {
      paddingHorizontal: CommonStyle.paddingSize,
      width: '100%'
    },
    textField: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      opacity: CommonStyle.opacity2,
      paddingBottom: 4
    },
    headerDetail: {
      backgroundColor: config.colorVersion,
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize,
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '100%',
      marginTop: 16
    },
    textExtra: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      position: 'absolute',
      right: 0
    },
    orText: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      opacity: CommonStyle.opacity1
    },
    textExtra2: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS
    },
    rowCheckVertical: {
      backgroundColor: 'white',
      flexDirection: 'row',
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '100%'
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
    add: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: 16,
      marginBottom: -8
    },
    headerContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: CommonStyle.paddingSize,
      height: CommonStyle.heightS,
      alignItems: 'center',
      width: '100%'
    },
    iconHeader: {
      color: '#ffffff',
      textAlign: 'right'
    },
    textHeader: {
      fontFamily: CommonStyle.fontMedium,
      color: '#ffffff',
      fontSize: CommonStyle.fontSizeM
    },
    textCol1: {
      width: '10%'
    },
    textCol2: {
      width: '65%'
    },
    textCol3: {
      width: '35%'
    },
    textMainHeader: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      opacity: CommonStyle.opacity1
    },
    textSubHeader: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontTiny,
      opacity: CommonStyle.opacity2
    }
  });

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

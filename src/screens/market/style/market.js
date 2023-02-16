import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
      height: height,
      backgroundColor: 'white',
      ...Platform.select({
        ios: {
        },
        android: {
        }
      })
    },
    progressBar: {
      backgroundColor: 'white',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    header: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: 16,
      paddingRight: 16,
      height: 40,
      alignItems: 'center',
      width: '100%'
    },
    textHeader: {
      fontSize: CommonStyle.fontSizeS,
      color: '#757575'
    },
    rowContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: 16,
      paddingRight: 16,
      height: 48,
      alignItems: 'center',
      width: '100%',
      borderTopWidth: 1,
      borderColor: '#0000001e'
    },
    textCol1: {
      width: '48%'
    },
    textCol2: {
      width: '26%'
    },
    textCol3: {
      width: '26%'
    },
    textMainHeader: {
      fontFamily: CommonStyle.fontMedium,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      opacity: CommonStyle.opacity1
    },
    textSubHeader: {
      fontFamily: CommonStyle.fontMedium,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontTiny,
      opacity: CommonStyle.opacity2
    },
    textMainData: {
      fontFamily: CommonStyle.fontMedium,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeM,
      opacity: CommonStyle.opacity1
    },
    textSubData: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeS,
      opacity: CommonStyle.opacity2
    },
    textMainHighLight: {
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    textSubHighLight: {
      fontFamily: CommonStyle.fontLight,
      fontSize: CommonStyle.fontSizeS
    },
    textExpand1: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeS,
      opacity: CommonStyle.opacity2
    },
    chartContainer: {
      height: CommonStyle.heightM * 3,
      paddingLeft: 8,
      paddingRight: 8,
      width: '100%',
      backgroundColor: 'white',
      marginBottom: 10
    },
    filterContainer: {
      paddingLeft: CommonStyle.paddingSize,
      paddingRight: CommonStyle.paddingSize,
      width: '100%',
      flexDirection: 'row'
    },
    filterButton: {
      backgroundColor: config.colorVersion,
      height: 32,
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row'
    },
    normalText: {
      color: 'white',
      fontSize: CommonStyle.fontSizeM,
      fontFamily: CommonStyle.fontMedium
    },
    textDropDown: {
      color: 'black',
      fontSize: CommonStyle.fontSizeM,
      fontFamily: CommonStyle.fontMedium,
      opacity: CommonStyle.opacity1
    },
    iconModal: {
      backgroundColor: 'transparent',
      color: 'white',
      right: -5,
      top: 2
    },
    tabButton1: {
      width: 53,
      height: 30,
      backgroundColor: 'white',
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: '#10a8b2',
      justifyContent: 'center',
      alignItems: 'center'
    },
    textButton1: {
      color: '#10a8b2',
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontFamily
    },
    tabButton2: {
      width: 53,
      height: 30,
      backgroundColor: config.colorVersion,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
      borderWidth: 1,
      borderColor: '#10a8b2',
      justifyContent: 'center',
      alignItems: 'center'
    },
    textButton2: {
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

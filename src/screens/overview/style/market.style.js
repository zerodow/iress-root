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
      backgroundColor: CommonStyle.backgroundColor,
      ...Platform.select({
        ios: {
        },
        android: {
        }
      })
    },
    searchContainer: {
      width: '100%',
      height: 88,
      padding: 16,
      backgroundColor: 'pink',
      position: 'absolute',
      alignItems: 'flex-end',
      bottom: 0,
      left: 0,
      right: 0,
      marginBottom: Platform.OS === 'ios' ? 48 : 8
    },
    filter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 10,
      marginRight: 10,
      marginBottom: 10
    },
    timeFilter: {
      backgroundColor: config.colorVersion,
      borderWidth: 1,
      borderColor: CommonStyle.fontBlue,
      height: 30,
      width: 60,
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    typeFilter: {
      borderWidth: 1,
      borderColor: CommonStyle.fontBlue,
      overflow: 'hidden',
      height: 30,
      width: 106,
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    filterButt: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1
    },
    filterButtActive: {
      backgroundColor: config.colorVersion,
      height: 30
    },
    filterButtActiveLeft: {
      borderTopLeftRadius: CommonStyle.borderRadius,
      borderBottomLeftRadius: CommonStyle.borderRadius
    },
    filterButtActiveRight: {
      borderTopRightRadius: CommonStyle.borderRadius,
      borderBottomRightRadius: CommonStyle.borderRadius
    },
    iconModal: {
      backgroundColor: 'transparent',
      color: CommonStyle.backgroundColor,
      right: -5,
      top: 2
    },
    chart: {
      flex: 1,
      backgroundColor: CommonStyle.backgroundColor,
      marginRight: 10,
      marginLeft: 10
    },
    progressBar: {
      backgroundColor: CommonStyle.backgroundColor,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    header: {
      backgroundColor: CommonStyle.backgroundColor,
      flexDirection: 'row',
      paddingLeft: 16,
      paddingRight: 16,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%'
    },
    headerContent: {
      height: 24,
      borderRadius: CommonStyle.borderRadius,
      backgroundColor: '#f8f8f8',
      width: '95%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    rowContainer: {
      backgroundColor: CommonStyle.backgroundColor,
      // flexDirection: 'row',
      paddingVertical: 6,
      paddingHorizontal: CommonStyle.paddingSize,
      // height: 48,
      // alignItems: 'center',
      width: '100%'
    },
    col1: {
      width: '44%'
    },
    col2: {
      width: '30%',
      alignItems: 'flex-end'
    },
    col3: {
      width: '30%',
      alignItems: 'flex-end'
    },
    col4: {
      width: '26%',
      alignItems: 'flex-end'
    },
    rateContainer: {
      marginHorizontal: 16
    },
    rate: {
      height: 64
    },
    rateLabelContainer: {
      flexDirection: 'row',
      // alignItems: 'center',
      paddingVertical: 8
    },
    exchangeRateRowContainer: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: CommonStyle.fontBorderGray,
      paddingVertical: 4
    },
    alignStart: {
      alignItems: 'flex-start'
    },
    alignEnd: {
      alignItems: 'flex-end'
    },
    rateCol1: {
      flex: 5.2
    },
    rateCol2: {
      flex: 2.6
    },
    rateCol3: {
      flex: 2.2
    },
    text16: {
      color: CommonStyle.fontColor,
      opacity: 0.87,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    text14: {
      color: CommonStyle.fontColor,
      opacity: 0.78,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeS
    },
    text12: {
      color: CommonStyle.fontColor,
      opacity: 0.87,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeXS
    },
    text9: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity3,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontTiny
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

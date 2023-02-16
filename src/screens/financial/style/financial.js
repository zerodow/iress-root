import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    headerReportContainer: {
      width: '100%',
      paddingHorizontal: 16,
      paddingVertical: 16
    },
    textMainHeader: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeXL,
      shadowColor: '#0000007f',
      shadowOffset: {
        width: 0,
        height: 1
      }
    },
    textSubHeader: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity2,
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontSizeS
    },
    header: {
      width: '100%',
      paddingVertical: 12,
      backgroundColor: config.colorVersion,
      alignItems: 'center',
      flexDirection: 'row',
      paddingLeft: CommonStyle.paddingSize,
      paddingRight: 20
    },
    whiteTextHeader: {
      color: 'white',
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    col1: {
      width: '47%'
    },
    col2: {
      width: '18%'
    },
    col3: {
      width: '35%'
    },
    headerContent: {
      height: CommonStyle.heightM,
      width: '100%',
      backgroundColor: 'rgba(10, 167, 177, 0.3)',
      paddingHorizontal: 16,
      justifyContent: 'center'
    },
    headerTotal: {
      height: CommonStyle.heightM,
      width: '100%',
      backgroundColor: 'rgba(10, 167, 177, 0.54)',
      paddingHorizontal: 16,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center'
    },
    headerText: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    rowContent: {
      height: CommonStyle.heightM,
      flexDirection: 'row',
      alignItems: 'center',
      paddingRight: CommonStyle.paddingSize
    },
    normalText: {
      color: CommonStyle.fontColor,
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontSizeM,
      opacity: CommonStyle.opacity1
    },
    textHighLight: {
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontSizeM,
      textAlign: 'right'
    },
    seg1: {
      width: '35%'
    },
    seg2: {
      width: '31%',
      paddingLeft: 8
    },
    seg3: {
      width: '34%',
      paddingLeft: 8,
      textAlign: 'right'
    },
    rowTotal: {
      height: CommonStyle.heightM,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: CommonStyle.paddingSize,
      borderBottomWidth: 1,
      borderColor: '#0000001e'
    },
    doubleChartContainer: {
      height: '100%',
      width: '50%',
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center'
    },
    chartName: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontSizeM
    },
    legendContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 24
    },
    legendLeft: {
      width: '50%',
      paddingRight: 8
    },
    legendRight: {
      width: '50%',
      paddingLeft: 8,
      textAlign: 'right'
    },
    singleChartContainer: {
      marginTop: 32,
      height: CommonStyle.heightM * 5,
      width: '100%',
      backgroundColor: 'white',
      marginBottom: 10,
      paddingHorizontal: 10
    },
    square: {
      width: 16,
      height: 12
    },
    line: {
      width: 22,
      height: 2,
      borderRadius: 1
    },
    retryButton: {
      width: 100,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: CommonStyle.borderRadius,
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
    circle: {
      width: 8,
      height: 8,
      borderRadius: 8 / 2,
      marginRight: 4,
      marginLeft: 7
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

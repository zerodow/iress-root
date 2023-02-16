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
    headerMainText: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontSizeXS
    },
    headerSubText: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity2,
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontTiny
    },
    header: {
      width: '100%',
      // height: CommonStyle.heightM,
      backgroundColor: config.colorVersion,
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize,
      paddingVertical: 14
    },
    headerCol: {

    },
    whiteTextHeader: {
      color: 'white',
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    col1: {
      width: Platform.OS === 'ios' ? '21%' : '23%'
    },
    col2: {
      width: '18%'
    },
    col3: {
      width: '20%'
    },
    col4: {
      width: '18%'
    },
    col5: {
      width: '23%'
    },
    col1Clone: {
      flex: 1
    },
    col2Clone: {
      flex: 1,
      // paddingRight: 20,
      textAlign: 'right'
    },
    col3Clone: {
      flex: 1,
      paddingLeft: 15,
      textAlign: 'right'
    },
    col4Clone: {
      flex: 1,
      paddingLeft: 15,
      textAlign: 'right'
    },
    headerContent: {
      // height: CommonStyle.heightS,
      paddingVertical: 7,
      width: '100%',
      backgroundColor: 'rgba(10, 167, 177, 0.3)',
      paddingHorizontal: 16
      // alignItems: 'center',
      // flexDirection: 'row'
    },
    headerText: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    rowContent: {
      // height: CommonStyle.heightM,
      // flexDirection: 'row',
      // alignItems: 'center',
      paddingVertical: 4,
      paddingRight: CommonStyle.paddingSize
    },
    normalText: {
      color: CommonStyle.fontColor,
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontSizeM,
      opacity: CommonStyle.opacity1
    },
    contentMainText: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    contentSubText: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity2,
      fontFamily: CommonStyle.fontLight,
      fontSize: CommonStyle.fontSizeS
    },
    footerContainer: {
      height: CommonStyle.heightM,
      width: width,
      backgroundColor: 'rgba(10, 167, 177, 0.3)',
      paddingHorizontal: 16,
      alignItems: 'center',
      flexDirection: 'row'
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

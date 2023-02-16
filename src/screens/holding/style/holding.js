import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    header: {
      width: '100%',
      paddingVertical: 4,
      backgroundColor: config.colorVersion,
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize
    },
    whiteTextHeader: {
      color: 'white',
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    rowContent: {
      width: '100%',
      // height: CommonStyle.heightM,
      paddingVertical: 6,
      backgroundColor: 'white',
      // alignItems: 'center',
      // flexDirection: 'row',
      paddingRight: CommonStyle.paddingSize
    },
    contentText: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    col1: {
      width: '45%'
    },
    col2: {
      width: '23%'
    },
    col3: {
      width: '32%'
    },
    footer: {
      width: '100%',
      height: CommonStyle.heightM,
      backgroundColor: '#10a8b230',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize
    },
    headerContent: {
      width: '100%',
      // height: CommonStyle.heightS,
      paddingVertical: 4,
      backgroundColor: '#10a8b230',
      // alignItems: 'center',
      // flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize
    },
    chartContainer: {
      marginTop: 10,
      height: CommonStyle.heightM * 6,
      width: '100%',
      backgroundColor: 'white',
      marginBottom: 20,
      paddingHorizontal: 10,
      alignItems: 'center'
    },
    chartDescription: {
      color: '#485465',
      fontSize: CommonStyle.font13
    },
    textMainHeader: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontSize: CommonStyle.fontSizeXS
    },
    textSubHeader: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity2,
      fontSize: CommonStyle.fontTiny
    },
    textMainContent: {
      fontFamily: CommonStyle.fontMedium,
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontSize: CommonStyle.fontSizeM
    },
    textSubContent: {
      fontFamily: CommonStyle.fontLight,
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity2,
      fontSize: CommonStyle.fontSizeS
    },
    extensionText: {
      fontFamily: CommonStyle.fontFamily,
      color: '#10a8b2',
      fontSize: CommonStyle.fontSizeM
    },
    rowContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize,
      alignItems: 'center',
      width: '100%',
      height: 250
    },
    colChart1: {
      width: '56%'
    },
    colChart2: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '41%'
    },
    colChart2_1: {
      width: 18,
      height: 18
    },
    colChart2_2: {
      width: '50%',
      paddingLeft: 8
    },
    colChart2_3: {
      width: '38%',
      textAlign: 'right'
    },
    colChart2_4: {
      width: '12%',
      textAlign: 'right',
      paddingRight: 8
    },
    colChart2rowContainer: {
      // justifyContent: 'center',
      // alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      paddingVertical: 3
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

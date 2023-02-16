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
      marginHorizontal: CommonStyle.marginSize,
      flexDirection: 'row',
      borderBottomWidth: 0.5
      // borderBottomColor: 'white'
    },
    header2: {
      paddingVertical: 6,
      // marginHorizontal: CommonStyle.marginSize,
      // backgroundColor: '#10a8b260',
      // paddingHorizontal: CommonStyle.paddingSize,
      flexDirection: 'row',
      borderRadius: CommonStyle.borderRadius
    },
    headerLeft: {
      backgroundColor: 'transparent',
      width: '50%',
      justifyContent: 'flex-end',
      flexDirection: 'row',
      borderRightWidth: 1,
      borderRightColor: CommonStyle.backgroundColor
    },
    headerRight: {
      backgroundColor: 'transparent',
      width: '50%',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      borderLeftWidth: 1,
      borderLeftColor: CommonStyle.backgroundColor
    },
    headerContainer: {
      flexDirection: 'row'
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    },
    rowContainer: {
      flexDirection: 'row',
      // width: '100%',
      // paddingHorizontal: CommonStyle.paddingSize,
      paddingVertical: 6
    },
    col1: {
      width: '40%'
    },
    col2: {
      width: '45%'
    },
    col3: {
      width: '15%'
    },
    col21: {
      width: '43%'
    },
    col22: {
      width: '30%'
    },
    col23: {
      width: '27%'
    },
    col31: {
      width: '30%'
    },
    col32: {
      width: '25%'
    },
    col33: {
      width: '45%'
    },
    slide: {
      flex: 1,
      backgroundColor: 'transparent'
    },
    containerSwiper: {
      flex: 1
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
    filterContainer: {
      paddingLeft: CommonStyle.paddingSize,
      paddingRight: CommonStyle.paddingSize,
      width: '100%',
      flexDirection: 'row'
    },
    filterButton: {
      backgroundColor: config.colorVersion,
      height: 30,
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 2,
      flexDirection: 'row'
    },
    priceWatchListButton: {
      backgroundColor: config.colorVersion,
      height: 30,
      width: 100,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row'
    },
    iconModal: {
      backgroundColor: 'transparent',
      color: 'white',
      right: -5,
      top: 2
    },
    modalWrapper: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      height: height,
      width: width,
      justifyContent: 'center',
      alignItems: 'center'
    },
    modal: {
      height: 135,
      width: 135,
      alignItems: 'center',
      backgroundColor: '#ffffff',
      borderRadius: 12,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: {
        width: 0,
        height: 15
      },
      shadowOpacity: 1,
      shadowRadius: 30
    },
    tabButton1: {
      width: 53,
      height: 30,
      borderTopLeftRadius: 2,
      borderBottomLeftRadius: 2,
      borderWidth: 1,
      borderRightWidth: 0,
      borderColor: '#10a8b2',
      justifyContent: 'center',
      alignItems: 'center'
    },
    tabButton2: {
      width: 53,
      height: 30,
      borderTopRightRadius: 2,
      borderBottomRightRadius: 2,
      borderWidth: 1,
      borderLeftWidth: 0,
      borderColor: '#10a8b2',
      justifyContent: 'center',
      alignItems: 'center'
    },
    chartContainer: {
      flex: 1,
      paddingLeft: 8,
      paddingRight: 8,
      width: width,
      backgroundColor: 'white',
      marginBottom: 10
    },
    rowContainerNews: {
      backgroundColor: 'white',
      alignItems: 'center',
      paddingVertical: 6,
      flexDirection: 'column',
      borderBottomWidth: 1,
      borderColor: '#0000001e',
      width: '100%',
      paddingHorizontal: 16
    },
    rowColumn: {
      width: '100%',
      flexDirection: 'row'
    },
    colTwoElements30: {
      flexDirection: 'column',
      flex: 0.3
    },
    colTwoElements70: {
      flexDirection: 'column',
      flex: 0.7
    },
    colTwoElements35: {
      flexDirection: 'row',
      flex: 0.35
    },
    rowExpandNews: {
      backgroundColor: 'white',
      flexDirection: 'row',
      marginHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center',
      borderColor: '#0000001e'
    },
    textWrapper: {
      // height: '100%',
      justifyContent: 'center'
    },
    col51: {
      width: '20%'
    },
    col52: {
      width: '24%'
    },
    col53: {
      width: '28%'
    },
    col54: {
      width: '28%'
    },
    marketBackgroundPercentLeft: {
      position: 'absolute',
      backgroundColor: '#00b80030',
      height: '100%',
      marginTop: 1,
      borderRightWidth: 1,
      borderColor: CommonStyle.fontBorderGray,
      borderBottomLeftRadius: 8,
      borderTopLeftRadius: 8
    },
    marketBackgroundPercentRight: {
      position: 'absolute',
      backgroundColor: '#00b80030',
      height: '100%',
      marginTop: 1,
      borderRightWidth: 1,
      borderColor: CommonStyle.fontBorderGray,
      borderBottomRightRadius: 8,
      borderTopRightRadius: 8
    },
    textHeaderSecond: {
      fontFamily: CommonStyle.fontPoppinsRegular,
      color: CommonStyle.fontColor,
      opacity: 0.4,
      fontSize: CommonStyle.fontSizeXS
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

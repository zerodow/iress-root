import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
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
    expandLine: {
      width: '100%',
      flexDirection: 'row',
      paddingVertical: 4
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
      marginLeft: 16,
      paddingRight: 32,
      height: 40,
      alignItems: 'center',
      width: '100%'
    },
    rowContainer: {
      paddingHorizontal: CommonStyle.paddingSize,
      backgroundColor: 'white',
      flexDirection: 'row',
      height: CommonStyle.heightM,
      alignItems: 'center',
      width: '100%'
    },
    rowExpand: {
      backgroundColor: 'white',
      paddingLeft: 16,
      paddingRight: 16,
      // height: 24,
      paddingBottom: 10,
      // alignItems: 'center',
      width: '100%'
    },
    rowExpandNews: {
      backgroundColor: 'white',
      flexDirection: 'row',
      marginHorizontal: 16,
      // height: 40,
      paddingVertical: 10,
      alignItems: 'center',
      borderColor: '#0000001e'
    },
    rowExpandNews2: {
      backgroundColor: 'white',
      // flexDirection: 'row',
      marginHorizontal: 16,
      // height: 40,
      paddingVertical: 10,
      alignItems: 'center',
      borderColor: '#0000001e'
      // borderBottomWidth: 1
    },
    buttonExpand: {
      backgroundColor: 'white',
      flexDirection: 'row',
      // alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16
    },
    col1: {
      width: '49%'
    },
    col2: {
      width: '29%'
    },
    col3: {
      width: '22%'
    },
    colExpand: {
      width: '25%'
    },
    chartContainer: {
      height: CommonStyle.heightM * 3,
      paddingRight: 10,
      width: width,
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
      height: 30,
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row'
    },
    priceWatchListButton: {
      backgroundColor: config.colorVersion,
      height: 30,
      width: PixelRatio.getFontScale() > 1 ? 120 : 100,
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
    iconPlus: {
      backgroundColor: 'transparent',
      color: 'white'
    },
    tabButton1: {
      width: 53,
      height: 30,
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderRightWidth: 0,
      borderColor: '#10a8b2',
      justifyContent: 'center',
      alignItems: 'center'
    },
    tabButton2: {
      width: 53,
      height: 30,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
      borderWidth: 1,
      borderLeftWidth: 0,
      borderColor: '#10a8b2',
      justifyContent: 'center',
      alignItems: 'center'
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
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}

getNewestStyle()
register(getNewestStyle)

export default styles;

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
      flexDirection: 'row',
      paddingLeft: 16,
      paddingRight: 16,
      // height: 24,
      paddingBottom: 8,
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
    },
    buttonExpand: {
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16
    },
    col1: {
      width: '48%'
    },
    col2: {
      width: '26%'
    },
    col3: {
      width: '26%'
    },
    colExpand: {
      width: '25%'
    },
    chartContainer: {
      height: CommonStyle.heightM * 3,
      paddingLeft: 8,
      paddingRight: 8,
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

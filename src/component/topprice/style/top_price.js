import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

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
      backgroundColor: CommonStyle.statusBarBgColor,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    header: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: 15,
      paddingRight: 15,
      height: 40,
      alignItems: 'center',
      width: '100%'
    },
    rowContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: 15,
      paddingRight: 15,
      height: 40,
      alignItems: 'center',
      width: '100%',
      borderTopWidth: 1,
      borderColor: '#0000001e'
    },
    textHeader: {
      color: '#818181',
      fontWeight: 'bold'
    },
    textCol1: {
      width: '15%'
    },
    textCol2: {
      width: '25%'
    },
    textCol3: {
      width: '30%'
    },
    textCol4: {
      width: '30%'
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

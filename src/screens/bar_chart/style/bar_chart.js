import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    chartContainer: {
      flex: 1,
      shadowColor: '#00000054',
      shadowOffset: {
        width: 0,
        height: 0
      },
      borderRadius: CommonStyle.borderRadius,
      shadowOpacity: 1,
      shadowRadius: 2,
      // marginHorizontal: 16,
      // paddingRight: 16,
      backgroundColor: 'white'
    },
    xAxisText: {
      color: '#485465',
      fontSize: CommonStyle.font10,
      fontFamily: CommonStyle.fontFamily,
      height: 24,
      marginVertical: 13,
      textAlign: 'right'
    },
    changeValue: {
      fontSize: CommonStyle.font10,
      fontFamily: CommonStyle.fontFamily,
      // lineHeight: 24,
      marginVertical: 30,
      textAlign: 'right',
      left: -10
    },
    legendText: {
      color: '#4f5b6b',
      fontSize: CommonStyle.font10,
      fontFamily: CommonStyle.fontFamily
    },
    legendContainer: {
      height: '20%',
      width: '100%',
      justifyContent: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center'
    },
    circle: {
      width: 8,
      height: 8,
      borderRadius: 8 / 2,
      marginRight: 4
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

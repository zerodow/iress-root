import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    slide: {
      flex: 1,
      backgroundColor: 'transparent'
    },
    descriptionText: {
      fontSize: CommonStyle.fontSizeXL,
      color: '#10a8b2',
      textAlign: 'center',
      paddingVertical: 8
    },
    descriptionTextSmall: {
      fontSize: CommonStyle.fontSizeM,
      color: '#10a8b2',
      textAlign: 'center'
    },
    legendLineChart: {
      width: width,
      height: height / 7,
      backgroundColor: 'white'
    },
    legendText: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    legendCircle: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6
    },
    chartOption: {
      width: width,
      height: height / 8,
      backgroundColor: '#C8FDFC',
      zIndex: 99999,
      paddingBottom: 29,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'flex-end'
    },
    filterButton: {
      height: 30,
      width: 54,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center'
    },
    circle: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 4
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

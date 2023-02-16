import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    trapezoid1: {
      width: (width - 72) / 2,
      height: 0,
      borderTopWidth: 36,
      borderTopColor: 'red',
      borderRightWidth: 16,
      borderRightColor: 'transparent',
      borderStyle: 'solid'
    },
    trapezoid2: {
      width: (width - 72) / 2,
      height: 0,
      borderBottomWidth: 36,
      borderBottomColor: 'blue',
      borderLeftWidth: 16,
      borderLeftColor: 'transparent',
      borderStyle: 'solid'
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

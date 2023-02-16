import { StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    whiteText: {
      color: CommonStyle.fontWhite,
      width: '50%',
      fontFamily: CommonStyle.fontBuySellWL,
      opacity: CommonStyle.opacity1
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

import { StyleSheet } from 'react-native'
import { Colors, Fonts, Metrics } from '../Themes/';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF'
    },
    welcome: {
      fontSize: CommonStyle.fontSizeXL,
      textAlign: 'center',
      margin: 10
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5
    },
    button: {
      height: Metrics.alertButtonHeight,
      alignSelf: 'stretch',
      borderRadius: Metrics.smallBorderRadius,
      justifyContent: 'center',
      alignItems: 'center',
      margin: Metrics.baseMargin,
      backgroundColor: Colors.blue
    },
    buttonText: {
      ...Fonts.style.skip,
      textAlign: 'center'
    }
  })

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

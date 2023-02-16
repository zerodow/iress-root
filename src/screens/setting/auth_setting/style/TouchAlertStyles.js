import { StyleSheet } from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { Colors, Fonts, Metrics } from '../Themes/'

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    overlay: {
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      position: 'absolute'
    },
    main: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    dialog: {
      height: Metrics.atHeight,
      width: Metrics.atWidth,
      backgroundColor: Colors.atBackgroundColor,
      borderRadius: Metrics.smallBorderRadius
    },
    infoWrapper: {
      width: Metrics.atWidth + 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      borderRadius: 12
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
    },
    skipButtonConstainer: {
      alignSelf: 'stretch',
      justifyContent: 'center',
      alignItems: 'center',
      height: Metrics.alertSkipHeight
    },
    skipButtonText: {
      flex: 1,
      ...Fonts.style.skip,
      textAlign: 'center',
      marginTop: Metrics.alertMargin
    },
    image: {
      height: Metrics.atImageHeight,
      width: Metrics.atImageWidth,
      marginTop: 10
      // resizeMode: 'contain'
    },
    name: {
      fontSize: Fonts.size.h4,
      fontWeight: 'normal',
      color: Colors.black,
      marginTop: Metrics.baseMargin
    },
    connectionTypeContainer: {
      flexDirection: 'row',
      marginTop: Metrics.smallMargin
    },
    connectionType: {
      color: Colors.blue,
      fontSize: Fonts.size.medium,
      marginTop: 30
    },
    icon: {
      marginRight: Metrics.smallMargin,
      height: Metrics.feedIcon,
      width: Metrics.feedIcon,
      alignSelf: 'center'
    }
  })

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

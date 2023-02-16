import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
import { isIphoneXorAbove } from '~/lib/base/functionUtil'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white'
    },
    containerFromMenu: {
      flex: 1,
      backgroundColor: '#fefefe'
    },
    content: {
      width: '100%',
      position: 'absolute',
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
      borderTopWidth: 2,
      borderColor: '#FFFFFF40'
    },
    contentFromMenu: {
      width: '100%',
      paddingHorizontal: 16,
      borderTopWidth: 2,
      borderColor: '#FFFFFF40'
    },
    footer: {
      width: '100%',
      height: isIphoneXorAbove() ? 74 : 60,
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: CommonStyle.fontColorSwitchTrue,
      paddingHorizontal: 16
    },
    acceptButton: {
      backgroundColor: 'transparent',
      // justifyContent: 'center',
      alignItems: 'flex-end'
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

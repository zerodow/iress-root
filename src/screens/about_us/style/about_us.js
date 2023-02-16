import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Platform.OS === 'ios' ? '#07000007' : '#efefef'
    },
    logo: {
      alignItems: 'center',
      paddingTop: 24,
      backgroundColor: '#fff',
      width: '100%',
      marginBottom: 24
    },
    image: {
      width: 64,
      height: 64,
      marginBottom: 24,
      marginTop: 24
    },
    content: {
      backgroundColor: '#fff',
      width: '100%'
    },
    rate: {
      flexDirection: 'row',
      paddingVertical: 8,
      alignItems: 'center',
      paddingHorizontal: 16
    },
    icon: {
      fontSize: CommonStyle.fontSizeM,
      width: 24,
      height: 24,
      textAlign: 'center',
      opacity: CommonStyle.opacity2,
      right: 24,
      top: 5
    },
    website: {
      flexDirection: 'row',
      paddingVertical: 8,
      alignItems: 'center',
      paddingHorizontal: 16
    },
    textLink: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontSize: CommonStyle.fontSizeM,
      width: '25%',
      paddingRight: 8
    },
    icon2: {
      fontSize: CommonStyle.fontSizeM,
      textAlign: 'center',
      opacity: CommonStyle.opacity2
    }
  })

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

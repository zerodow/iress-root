import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
    rowContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: 30,
      paddingRight: 30,
      height: 40,
      alignItems: 'center',
      width: '100%',
      borderTopWidth: 1,
      borderColor: '#0000001e'
    },
    iconStyle: {
      width: '15%',
      fontSize: CommonStyle.fontSizeXXL
    },
    title: {
      // height: 22,
      lineHeight: 22,
      fontSize: CommonStyle.fontSizeM,
      letterSpacing: -0.2,
      color: 'black',
      paddingLeft: 4
    }
  });

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
    header: {
      width: '100%',
      height: CommonStyle.heightM,
      backgroundColor: config.colorVersion,
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize
    },
    whiteTextHeader: {
      color: 'white',
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    rowContent: {
      width: '100%',
      height: CommonStyle.heightM,
      backgroundColor: 'white',
      alignItems: 'center',
      flexDirection: 'row',
      paddingLeft: CommonStyle.paddingSize
    },
    contentText: {
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontMedium,
      fontSize: CommonStyle.fontSizeM
    },
    col1: {
      width: '37%'
    },
    col2: {
      width: '21%',
      paddingLeft: 8,
      textAlign: 'right'
    },
    footer: {
      width: '100%',
      height: CommonStyle.heightM,
      backgroundColor: '#10a8b230',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: CommonStyle.paddingSize
    }
  });

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

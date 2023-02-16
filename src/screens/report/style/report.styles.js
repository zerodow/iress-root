import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
    header: {
      paddingLeft: 16, paddingBottom: 8, paddingTop: 8
    },
    filterSec: {
      width: '100%',
      height: 48,
      paddingHorizontal: 16
    },
    filterField: {
      width: (width - 48) / 2,
      alignItems: 'center',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#0000001e'
    },
    fieldTitle: {
      paddingTop: 4,
      paddingBottom: 4,
      width: '100%',
      flexDirection: 'row'
    },
    iconPicker: {
      color: '#00000054',
      right: 5,
      top: -5,
      width: 24,
      height: 24,
      textAlign: 'right',
      position: 'absolute'
    },
    timeFilter: {
      height: 30,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#10a8b2',
      borderRadius: CommonStyle.borderRadius,
      marginHorizontal: CommonStyle.paddingSize - 4,
      marginBottom: 10,
      marginTop: CommonStyle.fontRatio === 1 ? 4 : 14,
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    timeFilterButt: {
      flex: 1,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center'
    },
    separator: {
      marginTop: 14,
      height: 1,
      width: '100%',
      borderBottomWidth: 1,
      borderColor: '#0000001e'
    },
    reportItem: {
      marginTop: 15
    }
  })

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

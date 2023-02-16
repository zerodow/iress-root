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
    personalContainer: {
      flex: 1,
      alignItems: 'center',
      width: width,
      backgroundColor: 'transparent'
    },
    chartContainer: {
      width: '100%',
      height: '58%',
      paddingBottom: 16,
      backgroundColor: 'transparent'
    },
    dataContainer: {
      flex: 1,
      width: '100%',
      // paddingBottom: 20,
      marginHorizontal: 16
    },
    listDataContainer: {
      width: width,
      paddingVertical: 7,
      display: 'flex',
      flexDirection: 'row',
      borderRadius: 2,
      paddingHorizontal: 16
    },
    circle: {
      width: 8,
      height: 8,
      borderRadius: 4
    },
    col1: {
      width: '5%',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    col2: {
      width: CommonStyle.fontRatio === 1 ? '33%' : '37%',
      justifyContent: 'center'
    },
    col3: {
      width: CommonStyle.fontRatio === 1 ? '42%' : '37%',
      justifyContent: 'center'
    },
    col4: {
      width: '22%',
      justifyContent: 'center'
    },
    chartTitle: {
      color: 'black',
      backgroundColor: 'transparent',
      textAlign: 'center',
      paddingBottom: 16,
      fontFamily: 'HelveticaNeue-Medium',
      opacity: Platform.OS === 'ios' ? 0.87 : 1,
      fontSize: CommonStyle.fontSizeXL
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
      // flex: 1,
      width: width,
      // height: '12%',
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
    }
  });

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

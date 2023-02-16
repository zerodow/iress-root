import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    searchBarContainer: {
      height: 44,
      paddingLeft: CommonStyle.paddingDistance2,
      paddingRight: CommonStyle.paddingDistance2,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderColor: '#0000001e',
      backgroundColor: 'white',
      justifyContent: 'center',
      width: '100%'
    },
    searchBar: {
      borderWidth: 1,
      borderColor: '#0000001e',
      height: 30,
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconSearch: {
      color: '#8e8e93',
      fontSize: CommonStyle.iconSizeS,
      paddingRight: CommonStyle.paddingDistance2
    },
    searchPlaceHolder: {
      color: '#8e8e93',
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontFamily
    },
    header: {
      backgroundColor: 'white',
      flexDirection: 'row',
      height: CommonStyle.heightS,
      paddingRight: CommonStyle.paddingSize,
      alignItems: 'center',
      width: '90%',
      borderBottomWidth: 1,
      borderColor: '#0000001e'
    },
    headerContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: CommonStyle.paddingSize,
      height: CommonStyle.heightS,
      alignItems: 'center',
      width: '100%'
    },
    textCol1: {
      width: '10%'
    },
    textCol2: {
      width: '65%'
    },
    textCol3: {
      width: '35%'
    },
    textMainHeader: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontSizeXS,
      opacity: CommonStyle.opacity1
    },
    textSubHeader: {
      fontFamily: CommonStyle.fontFamily,
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.fontTiny,
      opacity: CommonStyle.opacity2
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

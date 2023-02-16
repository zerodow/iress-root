import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
const { height, width } = Dimensions.get('window');

const styles = {}
function getNewestStyle() {
  const newStyle = StyleSheet.create({
    searchBar: {
      borderWidth: 1,
      borderColor: CommonStyle.backgroundNewSearchBar,
      height: 44,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CommonStyle.backgroundNewSearchBar,
      paddingRight: CommonStyle.paddingDistance2,
      paddingLeft: CommonStyle.paddingDistance2
    },

    searchBarNoBorder: {
      flex: 1,
      height: 32,
      borderRadius: CommonStyle.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CommonStyle.backgroundColor,
      paddingRight: CommonStyle.paddingDistance2,
      paddingLeft: CommonStyle.paddingDistance2
    },
    iconSearch: {
      color: CommonStyle.fontWhite,
      fontSize: CommonStyle.iconSizeS,
      paddingRight: CommonStyle.paddingSize
    },
    searchPlaceHolder: {
      color: CommonStyle.searchPlaceHolderColor,
      fontSize: CommonStyle.fontSizeXS,
      fontFamily: CommonStyle.fontPoppinsRegular,
      opacity: 0.5
    },

    searchPlaceHolder1: {
      color: CommonStyle.searchPlaceHolderColor,
      fontSize: CommonStyle.fontSizeXS,
      fontFamily: CommonStyle.fontPoppinsRegular,
      opacity: 0.5
    },
    iconRight: {
      color: '#757575',
      fontSize: CommonStyle.fontSizeXXL,
      width: '10%',
      textAlign: 'right'
    },
    searchBarContractNotes: {
      height: 42,
      paddingLeft: 8,
      backgroundColor: CommonStyle.backgroundNewSearchBar,
      borderRadius: 8,
      marginTop: 4,
      marginBottom: 4,
      justifyContent: 'center'
    },
    searchBar1: {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: CommonStyle.backgroundNewSearchBar,
      paddingVertical: 8
    },
    searchBarContainer: {
      height: 44,
      paddingLeft: CommonStyle.paddingDistance2,
      paddingRight: CommonStyle.paddingDistance2,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderColor: CommonStyle.fontShadow,
      backgroundColor: CommonStyle.statusBarBgColor,
      justifyContent: 'center'
    },
    iconCloseLight: {
      color: '#8e8e93',
      fontSize: CommonStyle.iconSizeS,
      backgroundColor: 'transparent'
    },
    searchBarContainerNoBorder: {
      height: 48,
      paddingHorizontal: 16,
      flexDirection: 'row',
      // marginTop: Platform.OS === 'ios' ? CommonStyle.marginSize - 4 : 0,
      alignItems: 'center',
      backgroundColor: CommonStyle.ColorTabNews,
      shadowColor: 'rgba(76,0,0,0)',
      shadowOffset: {
        width: 0,
        height: 0.5
      }
    },
    buttonCancel: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 16.5
    },
    inputStyle: {
      flex: 1,
      backgroundColor: 'transparent',
      color: 'rgba(255, 255, 255, 087)',
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontFamily,
      // lineHeight: 12,
      height: 40
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

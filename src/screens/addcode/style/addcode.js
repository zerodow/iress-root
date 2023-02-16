import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
  const newStyle = StyleSheet.create({
    rowContainer: {
      width: '100%',
      backgroundColor: 'white',
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: '#0000001e',
      paddingHorizontal: CommonStyle.paddingSize,
      paddingVertical: 6,
      alignItems: 'center'
    },
    codeStyle: {
      fontSize: CommonStyle.fontSizeM,
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity1,
      fontFamily: CommonStyle.fontFamily
    },
    companyStyle: {
      fontSize: CommonStyle.fontSizeS,
      color: CommonStyle.fontColor,
      opacity: CommonStyle.opacity2,
      fontFamily: CommonStyle.fontFamily
    },
    iconLeft: {
      color: '#df0000',
      fontSize: CommonStyle.iconSizeM,
      width: '10%',
      textAlign: 'left'
      // paddingRight: CommonStyle.paddingDistance2
    },
    iconRight: {
      color: 'black',
      fontSize: CommonStyle.fontSizeXXL,
      width: '10%',
      textAlign: 'right',
      opacity: CommonStyle.opacity2
    },
    searchBarContainer: {
      height: 44,
      paddingLeft: CommonStyle.paddingDistance2,
      paddingRight: CommonStyle.paddingDistance2,
      borderBottomWidth: 1,
      borderTopWidth: 1,
      borderColor: '#0000001e',
      backgroundColor: 'white',
      justifyContent: 'center'
    },
    searchBarContainer2: {
      height: 40,
      width: '100%',
      flexDirection: 'row',
      marginTop: CommonStyle.marginSize - 4,
      alignItems: 'center',
      paddingLeft: CommonStyle.paddingDistance2,
      backgroundColor: config.colorVersion,
      shadowColor: 'rgba(76,0,0,0)',
      shadowOffset: {
        width: 0,
        height: 0.5
      }
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
    searchBar2: {
      backgroundColor: 'rgba(254, 254, 254, 0.2)',
      flex: 1,
      borderRadius: 5,
      height: 32,
      alignItems: 'center',
      flexDirection: 'row'
    },
    iconSearch: {
      color: '#8e8e93',
      fontSize: CommonStyle.iconSizeS,
      paddingRight: CommonStyle.paddingDistance2
    },
    iconSearch2: {
      width: '10%',
      color: 'rgba(255, 255, 255, 0.54)',
      fontSize: CommonStyle.iconSizeS,
      paddingRight: CommonStyle.paddingDistance2,
      paddingLeft: CommonStyle.paddingDistance2
    },
    iconRight2: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: CommonStyle.iconSizeS,
      width: '10%',
      textAlign: 'right',
      paddingRight: CommonStyle.paddingDistance2
    },
    searchPlaceHolder: {
      color: '#8e8e93',
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontFamily
    },
    whiteText: {
      color: '#FFFFFF',
      fontSize: CommonStyle.fontSizeM,
      fontFamily: CommonStyle.fontFamily
    },
    buttonCancel: {
      flex: PixelRatio.getFontScale !== 1 ? 3 : 2,
      justifyContent: 'center',
      alignItems: 'center'
    },
    buttonCancelClone: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 16.5
    },
    inputStyle: {
      backgroundColor: 'transparent',
      width: '80%',
      color: 'rgba(255, 255, 255, 087)',
      fontSize: CommonStyle.fontSizeS,
      fontFamily: CommonStyle.fontFamily,
      lineHeight: 12,
      height: 40
    },
    iconAdd: {
      width: '15%',
      color: CommonStyle.fontColor,
      fontSize: CommonStyle.iconSizeM,
      opacity: CommonStyle.opacity2
    },
    iconCheck: {
      width: '15%',
      color: '#00c752',
      fontSize: CommonStyle.iconSizeM
    }
  });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

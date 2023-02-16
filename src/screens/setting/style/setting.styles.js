import { Platform, StyleSheet, Dimensions } from 'react-native';
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
    sectBackground: { backgroundColor: '#fff', width: '100%' },
    sectContent: { flexDirection: 'row', paddingVertical: 14, alignItems: 'center', paddingLeft: 16, paddingRight: 16, minHeight: 30 },
    sectContentText: { color: 'black', opacity: 0.87, fontSize: CommonStyle.fontSizeM, width: '85%' },
    sectSeparator: { height: 1, backgroundColor: '#0000001e' },
    rowContainer: {
      backgroundColor: 'white',
      flexDirection: 'row',
      paddingLeft: 16,
      paddingRight: 16,
      height: 48,
      alignItems: 'center',
      width: '100%',
      borderBottomWidth: 1,
      borderColor: '#0000001e'
    },
    rowFooter: {
      position: 'absolute',
      bottom: 0,
      flexDirection: 'row',
      height: 48,
      paddingLeft: 16,
      paddingRight: 16,
      width: '100%',
      justifyContent: 'center'
    },
    midFooter: {
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderColor: 'rgba(97,97,97,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      paddingBottom: 10
    },
    columFooter: {
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      paddingBottom: 10
    },
    normalText2: {
      color: '#757575',
      fontSize: CommonStyle.fontSizeM
    },
    confirmText: {
      color: '#009688',
      fontSize: CommonStyle.fontSizeS
    },
    textField: {
      color: '#757575',
      fontSize: CommonStyle.fontSizeM,
      borderBottomWidth: 1,
      borderColor: '#0000001e',
      width: '100%'
    },
    colLeft: {
      width: '40%'
    },
    colMid: {
      width: '40%'
    },
    colMid2: {
      width: '30%'
    },
    colRight2: {
      width: '20%'
    },
    dropDownContainer: {
      width: '10%',
      alignSelf: 'flex-end'
    },
    langSelected: {
      opacity: CommonStyle.opacity2,
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontSizeM,
      fontWeight: '300',
      color: CommonStyle.fontColor
    },
    dropDownContainer2: {
      width: '30%',
      alignItems: 'flex-end'
    },
    dropDownRow: {
      height: 48,
      justifyContent: 'center',
      paddingLeft: 16
    },
    dropDownStyle: {
      borderWidth: 0,
      alignItems: 'flex-end',
      marginTop: 40,
      shadowColor: 'rgba(0,0,0,0.3)',
      shadowOffset: {
        width: 0,
        height: 5
      },
      shadowOpacity: 1,
      shadowRadius: 20
    },
    normalText: {
      color: 'black',
      opacity: CommonStyle.opacity2,
      fontFamily: CommonStyle.fontFamily,
      fontSize: CommonStyle.fontSizeM
    },
    buttonContainer: {
      width: 24,
      height: 24,
      right: -20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    buttonText: {
      color: 'black',
      opacity: CommonStyle.opacity2,
      fontSize: CommonStyle.fontSizeXXL
    },
    buttonSellBuy: {
      width: width - 32,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: CommonStyle.borderRadius,
      marginTop: 16
    },
    confirmButton: {
      marginRight: 12
    },
    modal: {
      marginLeft: 40,
      marginRight: 40,
      height: 148,
      backgroundColor: 'white',
      marginTop: (height - 148) / 2,
      borderRadius: CommonStyle.borderRadius,
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowOffset: {
        width: 0,
        height: 15
      },
      shadowOpacity: 1,
      shadowRadius: 30
    },
    modalContainer: {
      height: '100%',
      backgroundColor: '#00000064'
    },
    iconModal: {
      width: 24,
      height: 24,
      textAlign: 'center',
      opacity: CommonStyle.opacity2
    }
  })

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

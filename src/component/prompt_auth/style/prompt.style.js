import { StyleSheet, Platform, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        dialog: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        },
        dialogOverlay: {
            backgroundColor: CommonStyle.statusBarModal,
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        dialogContent: {
            elevation: 5,
            marginTop: dataStorage.platform === 'ios' ? 150 : 100,
            backgroundColor: CommonStyle.statusBarModal,
            width: 270,
            borderRadius: Platform.OS === 'ios' ? 15 : 0,
            borderWidth: 1,
            overflow: 'hidden'
        },
        dialogContent2: {
            width: 334,
            backgroundColor: CommonStyle.fontDefaultColor,
            borderRadius: 12,
            height: 260
        },
        dialogTitle: {
            paddingVertical: 32,
            paddingHorizontal: 20,
            paddingBottom: 8
        },
        dialogSubTitle: {
            paddingHorizontal: 20,
            paddingBottom: 16
        },
        dialogTitleText: {
            ...CommonStyle.textTitleDialog,
            textAlign: 'center',
            color: CommonStyle.fontColor
        },
        dialogSubTitleText: {
            ...CommonStyle.textDescDialog,
            textAlign: 'center'
        },
        dialogBody: {
            flexDirection: 'row',
            marginHorizontal: 16,
            backgroundColor: CommonStyle.fontColorSwitchTrue,
            paddingHorizontal: 4,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center'
        },
        rightIcon: {
            height: Platform.OS === 'ios' ? 32 : 42,
            // width: '8%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: 20
        },
        dialogInput: {
            width: 286,
            paddingHorizontal: 20,
            marginHorizontal: 4,
            height: 48,
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: Platform.OS === 'ios' ? CommonStyle.fontSizeM : CommonStyle.fontSizeM,
            color: CommonStyle.fontWhite
        },
        dialogFooter: {
            flexDirection: 'row',
            height: 39,
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            marginTop: 16
        },
        dialogAction: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignContent: 'center'
        },
        dialogActionText: {
            fontSize: CommonStyle.fontSizeS,
            textAlign: 'center',
            fontFamily: CommonStyle.fontPoppinsRegular,
            color: CommonStyle.fontColorButtonSwitch
        },
        errorContainer: {
            height: 32,
            width: '100%',
            paddingHorizontal: CommonStyle.paddingSize,
            justifyContent: 'center',
            alignItems: 'center'
        },
        cancelButton: {
            width: '50%',
            borderBottomLeftRadius: 12,
            overflow: 'hidden'
        },
        submitButton: {
            width: '50%',
            borderBottomRightRadius: 12,
            overflow: 'hidden'
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

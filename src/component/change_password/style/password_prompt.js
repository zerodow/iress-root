import { StyleSheet, Platform, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
import lineHeight from 'react-native-style-tachyons/lib/styles/lineHeight';
import { blue } from 'ansi-colors';

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        dialog: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        },
        dialogContent2: {
            backgroundColor: CommonStyle.fontDefaultColor,
            width: 334,

            borderRadius: 12
        },
        dialogTitle: {
            paddingHorizontal: 20,
            paddingVertical: 32
        },
        dialogTitleText: {
            ...CommonStyle.textMain,
            textAlign: Platform.OS ? 'center' : 'left',
            lineHeight: 22,
            fontFamily: CommonStyle.fontPoppinsRegular
        },
        rightIcon: {
            height: Platform.OS === 'ios' ? 32 : 42,
            width: '8%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: 4
        },
        dialogInput: {
            width: '92%',
            paddingHorizontal: 12,
            // height: Platform.OS === 'ios' ? 32 : 42,
            height: Platform.OS === 'ios' ? 32 : 42,
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeM,
            alignContent: 'center',
            color: 'white'
        },
        dialogFooter: {
            flexDirection: 'row',
            height: 39,
            paddingHorizontal: 24,
            justifyContent: 'space-between',
            marginTop: 16,
            marginBottom: 32
        },
        dialogAction: {
            flex: 1,
            paddingHorizontal: 10,
            justifyContent: 'center',
            alignItems: 'center'
        },
        dialogActionText: {
            fontSize: CommonStyle.fontSizeS,
            textAlign: Platform.OS === 'ios' ? 'center' : 'right',
            fontFamily: CommonStyle.fontPoppinsRegular,
            color: CommonStyle.fontColorButtonSwitch
        },
        errorContainer: {
            marginBottom: 4,
            width: '100%',
            paddingHorizontal: CommonStyle.paddingSize,
            justifyContent: 'center',
            alignItems: 'center'
        },
        cancelButton: {
            width: '50%',
            borderBottomLeftRadius: Platform.OS === 'ios' ? 15 : 0,
            overflow: 'hidden'
        },
        submitButton: {
            width: '50%',
            borderBottomRightRadius: Platform.OS === 'ios' ? 15 : 0,
            overflow: 'hidden'
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

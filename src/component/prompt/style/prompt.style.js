import { StyleSheet, Platform, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        dialog: {
            flex: 1
        },
        dialogOverlay: {
            backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.5)',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            justifyContent: 'center',
            alignItems: 'center'
        },
        dialogContent: {
            // elevation: 5,
            // marginTop: dataStorage.platform === 'ios' ? 150 : 100,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            width: 280,
            borderRadius: Platform.OS === 'ios' ? 15 : 15,
            borderWidth: 1
            // flex: 1,
            // justifyContent: 'center',
            // alignItems: 'center'
            // overflow: 'hidden'
        },
        dialogContent2: {
            // marginTop: dataStorage.platform === 'ios' ? 150 : 100,
            width: 280,
            backgroundColor: '#E5E5E5',
            borderRadius: Platform.OS === 'ios' ? 15 : 15
        },
        dialogTitle: {
            marginBottom: Platform.OS === 'ios' ? 16 : 6,
            paddingHorizontal: 16
        },
        dialogSubTitle: {
            paddingHorizontal: 16,
            paddingBottom: 16
        },
        dialogTitleText: {
            ...Platform.OS === 'ios' ? CommonStyle.textMain : CommonStyle.textGiant,
            textAlign: Platform.OS ? 'center' : 'left',
            marginVertical: 16
        },
        dialogSubTitleText: {
            ...Platform.OS === 'ios' ? CommonStyle.textSubNormalBlack : CommonStyle.textMainNormalNoColor,
            textAlign: Platform.OS ? 'center' : 'left'
        },
        dialogBody: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            zIndex: 99999
        },
        rightIcon: {
            height: Platform.OS === 'ios' ? 32 : 42,
            width: '8%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Platform.OS === 'ios' ? '#CECECE' : 'rgba(255, 255, 255, 0.1)',
            borderBottomColor: 'gray',
            borderBottomWidth: 1,
            paddingRight: 4
        },
        dialogInput: {
            width: '92%',
            backgroundColor: Platform.OS === 'ios' ? '#CECECE' : 'rgba(255, 255, 255, 0.1)',
            paddingHorizontal: 4,
            height: Platform.OS === 'ios' ? 32 : 42,
            borderBottomColor: 'gray',
            borderBottomWidth: 1,
            color: 'rgba(0, 0, 0, 0.87)',
            fontFamily: CommonStyle.fontFamily,
            fontSize: Platform.OS === 'ios' ? CommonStyle.fontSizeS : CommonStyle.fontSizeM
        },
        dialogFooter: {
            flexDirection: 'row',
            width: 280,
            height: (PixelRatio.getFontScale() > 1) ? 58 : 48
        },
        dialogAction: {
            flex: 1,
            // padding: 15,
            alignItems: 'center'
        },
        dialogActionText: {
            fontSize: Platform.OS === 'ios' ? CommonStyle.fontSizeM : CommonStyle.fontSizeM,
            textAlign: Platform.OS === 'ios' ? 'center' : 'right',
            fontFamily: CommonStyle.fontFamily,
            color: Platform.OS === 'ios' ? '#1e90ff' : '#10a8b2'
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

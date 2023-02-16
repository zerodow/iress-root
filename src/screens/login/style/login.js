import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
        container: {
            // backgroundColor: 'black',
            ...Platform.select({
                ios: {
                    paddingTop: 0
                }
            })
        },
        progressBar: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        textfieldWithFloatingLabel: {
            height: 53, // have to do it on iOS
            marginTop: 10
        },
        submitButton: {
            color: '#353da7',
            fontWeight: '500',
            padding: 10,
            fontSize: CommonStyle.fontSizeS,
            borderRadius: CommonStyle.borderRadius,
            textAlign: 'center',
            borderWidth: 1,
            overflow: 'hidden'
        },
        labelButton: {
            color: '#f4f4fa',
            fontSize: CommonStyle.fontSizeS
        },
        errorContainer: {
            width: width,
            height: 24,
            left: -56,
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 16,
            backgroundColor: 'transparent'
        },
        inputText: {
            flexGrow: 1,
            flex: 0,
            fontSize: CommonStyle.fontSizeM,
            color: '#ffffff',
            fontFamily: CommonStyle.fontFamily,
            height: CommonStyle.heightM,
            marginLeft: -5
        }
    });

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

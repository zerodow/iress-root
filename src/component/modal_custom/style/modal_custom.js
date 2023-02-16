import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        modalWrapper: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            height: height,
            width: width,
            justifyContent: 'center',
            alignItems: 'center'
        },
        modal: {
            height: 80,
            width: '60%',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowOffset: {
                width: 0,
                height: 15
            },
            shadowOpacity: 1,
            shadowRadius: 30
        },
        wrapper: {
            flex: 1,
            resizeMode: 'cover',
            alignItems: 'center',
            borderRadius: 10
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

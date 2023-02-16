import { StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        warningContainer: {
            width: '100%',
            height: 24,
            alignItems: 'center',
            justifyContent: 'center'
        },
        warningContainer1: {
            width: '100%',
            // height: 24,
            alignItems: 'center',
            justifyContent: 'center'
        },
        errorContainer: {
            width: '100%',
            height: 24,
            // opacity: 0.8,
            alignItems: 'center',
            justifyContent: 'center'
        },
        errorContainer2: {
            width: '100%',
            // height: 24,
            // opacity: 0.8,
            alignItems: 'center',
            justifyContent: 'center'
        }
    })

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

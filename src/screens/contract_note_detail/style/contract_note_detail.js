import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            // opacity: 0.87,
            backgroundColor: CommonStyle.backgroundColor
        },
        pdf: {
            flex: 1,
            width: '100%',
            overflow: 'hidden',
            backgroundColor: CommonStyle.backgroundColor
        }
    })

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

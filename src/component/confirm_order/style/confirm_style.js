import { StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        boldTitle: {
            width: '100%',
            paddingTop: 15,
            paddingBottom: 15,
            paddingHorizontal: 16,
            alignItems: 'flex-start'
        },
        confirmContent: {
            width: '100%',
            backgroundColor: '#e6e6e6',
            paddingBottom: 10,
            paddingTop: 10,
            paddingLeft: 16,
            paddingRight: 16,
            marginBottom: 10
        }
    })

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

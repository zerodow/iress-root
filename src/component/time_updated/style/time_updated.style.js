import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        container: {
            height: 48,
            flex: 1,
            flexDirection: 'row'
        },
        header: {
            backgroundColor: CommonStyle.backgroundColor,
            flexDirection: 'row',
            paddingLeft: 16,
            paddingRight: 16,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
        },
        headerContent: {
            transform: [{ translateY: 0 }],
            paddingVertical: 3,
            borderRadius: CommonStyle.borderRadius,
            backgroundColor: CommonStyle.fontTimeUpdate,
            width: '95%',
            alignItems: 'center',
            justifyContent: 'center'
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

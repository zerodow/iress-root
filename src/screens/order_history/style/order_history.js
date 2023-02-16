import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../../storage';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        rowContainer: {
            backgroundColor: 'white',
            height: 48,
            justifyContent: 'center',
            flex: 1,
            borderBottomWidth: 1,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderColor: '#0000001e'
        },
        textRowFirst: {
            height: 16,
            opacity: 0.87,
            fontSize: CommonStyle.fontSizeS,
            color: '#000000'
        },
        textLeft: { textAlign: 'left', flex: 1 },
        textRight: { textAlign: 'right' },
        wrapperText: { flexDirection: 'row', flex: 1 },
        textRowSecond: {
            height: 14,
            opacity: CommonStyle.opacity2,
            fontSize: CommonStyle.fontSizeXS,
            color: '#000000'
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

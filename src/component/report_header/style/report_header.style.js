import { Platform, StyleSheet, Dimensions } from 'react-native';
import config from '../../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        container: {
            height: 88,
            paddingVertical: 22,
            paddingHorizontal: 16
        },
        textTitle: {
            opacity: CommonStyle.opacity1,
            fontFamily: CommonStyle.fontFamily,
            fontSize: CommonStyle.fontSizeXL,
            color: CommonStyle.fontColor,
            textShadowColor: 'transparent',
            shadowOpacity: 0
        },
        textSubTitle: {
            opacity: CommonStyle.opacity1,
            fontFamily: CommonStyle.fontFamily,
            fontSize: CommonStyle.fontSizeS,
            color: CommonStyle.fontColor,
            textShadowColor: 'transparent',
            shadowOpacity: 0
            // textShadowOffset: {
            //    width: 0,
            //    height: 1
            // },
            // textShadowRadius: 3
        }
    });

  PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

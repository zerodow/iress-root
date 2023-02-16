import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        labelSymbol: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeXS - 2,
            color: CommonStyle.fontColor,
            marginRight: 4
        },
        labelCompanyName: {
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font10 - 2,
            color: CommonStyle.fontNearLight6
        },
        labelTitleNews: {
            fontSize: CommonStyle.fontSizeL - 2,
            fontFamily: CommonStyle.fontPoppinsBold,
            color: CommonStyle.fontColor
        },
        labelTimeAndVendor: {
            ...CommonStyle.textFloatingLabel3,
            fontSize: CommonStyle.fontSizeXS - 2
        },
        viewRow: {
            flexDirection: 'row',
            alignItems: 'center'
        }
    })

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

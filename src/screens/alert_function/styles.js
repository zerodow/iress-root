import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const styles = {}

function getNewestStyle() {
    const newStyle = {
        itemWrapper: {
            backgroundColor: CommonStyle.backgroundColor,
            flexDirection: 'row',
            paddingVertical: CommonStyle.paddingDistance2,
            paddingHorizontal: CommonStyle.paddingSize,
            paddingRight: CommonStyle.paddingDistance2,
            borderRadius: 8,
            alignItems: 'center'
        },
        textTimeInsights: {
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeXS,
            color: CommonStyle.fontColor
        },
        textSymbol: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.fontSizeL,
            color: CommonStyle.fontColor
        }
    }

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

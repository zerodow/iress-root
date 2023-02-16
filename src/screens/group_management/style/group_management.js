import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

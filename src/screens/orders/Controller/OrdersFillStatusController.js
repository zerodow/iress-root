import ENUM from '~/enum'
import CommonStyle from '~/theme/theme_controller'
const { FILL_STATUS } = ENUM
export function getColor({ fillStatus }) {
    switch (fillStatus) {
        case FILL_STATUS.PARTIALLY_FILLED:
            return CommonStyle.color.process
        case FILL_STATUS.FILLED:
            return CommonStyle.color.buy
        default:
            // Default is UNFILLED
            return 'rgba(255, 255, 255, 0.2)'
    }
}

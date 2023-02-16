import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Enum from '../../enum';

const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;

const common = {
    animatedView: {
        position: 'absolute',
        top: 0,
        paddingHorizontal: 4
    }
};

export default {
    [TYPE_FORM_REALTIME.WATCHLIST]: {
        animatedView: { ...common.animatedView, right: 0 },
        text: {
            ...CommonStyle.textMainNoColor,
            opacity: CommonStyle.opacity1
        }
    },
    [TYPE_FORM_REALTIME.HOLDING]: {
        animatedView: { ...common.animatedView, right: -4 },
        text: {
            ...CommonStyle.textMainNoColor,
            opacity: CommonStyle.opacity1
        }
    },
    [TYPE_FORM_REALTIME.NEW_ORDER_BID_PRICE]: {
        animatedView: { ...common.animatedView, left: 0 },
        text: {
            ...CommonStyle.textMainLightMedium,
            opacity: CommonStyle.opacity1
        }
    },
    [TYPE_FORM_REALTIME.NEW_ORDER_TRADE_PRICE]: {
        animatedView: { ...common.animatedView, right: 0 },
        text: {
            ...CommonStyle.textMainLightMedium,
            opacity: CommonStyle.opacity1
        }
    },
    [TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL]: {
        animatedView: { ...common.animatedView, left: 0 },
        text: {
            ...CommonStyle.textSub,
            fontWeight: 'bold',
            opacity: CommonStyle.opacity1
        }
    }
}

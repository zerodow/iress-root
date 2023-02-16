import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import Enum from '../../enum';

const TYPE_FORM_REALTIME = Enum.TYPE_FORM_REALTIME;

const common = {
	animatedView: {
		position: 'absolute',
		top: 0,
		paddingLeft: 4,
		paddingRight: 4
	},
	animatedView2: {
		position: 'absolute',
		top: 0
	},
	animatedView3: {
		position: 'absolute',
		top: 0,
		paddingLeft: 0,
		paddingRight: 0
	}
};

const styles = {};

function getNewestStyle() {
	const newStyle = {
		[TYPE_FORM_REALTIME.WATCHLIST]: {
			animatedView: { ...common.animatedView, right: 0 },
			text: {
				...CommonStyle.textMainNoColor,
				opacity: CommonStyle.opacityPrice
			}
		},
		[TYPE_FORM_REALTIME.HOLDING]: {
			animatedView: { ...common.animatedView, right: -4 },
			text: {
				...CommonStyle.textMainNoColor,
				opacity: CommonStyle.opacityPrice
			}
		},
		[TYPE_FORM_REALTIME.NEW_ORDER_BID_PRICE]: {
			animatedView: { ...common.animatedView, left: 0 },
			text: {
				...CommonStyle.textMainLightMedium,
				opacity: CommonStyle.opacityPrice
			}
		},
		[TYPE_FORM_REALTIME.NEW_ORDER_TRADE_PRICE]: {
			animatedView: { ...common.animatedView, right: 0 },
			text: {
				...CommonStyle.textMainLightMedium,
				opacity: CommonStyle.opacityPrice
			}
		},
		[TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL]: {
			animatedView: { ...common.animatedView, left: 0 },
			text: {
				...CommonStyle.textSub,
				fontWeight: 'bold',
				opacity: CommonStyle.opacityPrice
			}
		},
		[TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL_2]: {
			animatedView: { ...common.animatedView2, left: 0 },
			text: {
				...CommonStyle.textSub,
				fontWeight: 'bold',
				opacity: CommonStyle.opacityPrice
			}
		},
		[TYPE_FORM_REALTIME.PRICE_SEARCH_DETAIL_3]: {
			animatedView: { ...common.animatedView3, left: 0 },
			text: {
				...CommonStyle.textSub,
				fontWeight: 'bold',
				opacity: CommonStyle.opacityPrice
			}
		}
	};

	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

export default styles;

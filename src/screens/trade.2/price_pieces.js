import PropTypes from 'prop-types';
import XComponent from '../../component/xComponent/xComponent';
import * as Util from '../../util';
import { func } from '../../storage';
import * as Emitter from '@lib/vietnam-emitter';
import * as PureFunc from '../../utils/pure_func';
import * as StreamingBusiness from '../../streaming/streaming_business';

export default class PricePieces extends XComponent {
	static propTypes = {
		data: PropTypes.object,
		loadingInfo: PropTypes.object,
		autoControlRender: PropTypes.bool,
		allowRenderInfo: PropTypes.shape({
			fnGetAllowRender: PropTypes.func,
			channelAllowRender: PropTypes.string
		}),
		indexInList: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
	};

	init() {
		this.onDataChange = this.onDataChange.bind(this);
		const loadingInfo = this.props.loadingInfo;

		this.dic = {
			data: this.props.data || {},
			channelLoading: loadingInfo.channelLoading,
			isLoading: PureFunc.getBooleanable(loadingInfo.isLoading, false)
		};
	}

	componentDidMount() {
		super.componentDidMount();

		this.subDataChange();
		this.subChannelLoading();
	}

	onDataChange(newPrice) {
		const currentPrice = this.dic.data;

		if (this.isChange(currentPrice, newPrice)) {
			this.dic.data = newPrice;
			this.forceUpdate();
		} else {
			this.dic.data = newPrice;
		}
	}

	isChange() {
		return true;
	}

	subChannelLoading() {
		this.dic.channelLoading &&
			Emitter.addListener(this.dic.channelLoading, this.id, isLoading => {
				if (this.dic.isLoading === isLoading) return;
				this.dic.isLoading = isLoading;
				this.forceUpdate();
			});
	}

	subDataChange() {
		const symbol = this.dic.data.symbol;
		const exchange = func.getExchangeSymbol(symbol);
		const channel = StreamingBusiness.getChannelLv1(exchange, symbol);
		Emitter.addListener(channel, this.id, this.onDataChange);
	}

	render() {
		return <View />;
	}
}

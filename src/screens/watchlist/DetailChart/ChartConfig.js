import React, { PureComponent } from 'react';
import _ from 'lodash';

import Enum from '~/enum';
import * as Business from '~/business';
import * as Util from '~/util';
import {
	formatNumberNew2,
	largeValue,
	renderTime,
	checkWeekend
} from '~/lib/base/functionUtil';

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const KEY_ENUM = {
	LINE: 'LINE',
	CANDLE: 'CANDLE'
};
export default class ChartConfig extends PureComponent {
	state = {
		filterType: PRICE_FILL_TYPE._6M,
		chartType: KEY_ENUM.LINE,
		isLoading: false,
		data: {}
	};

	componentWillReceiveProps(nextProps) {
		if (
			this.props.symbol !== nextProps.symbol ||
			this.props.exchange !== nextProps.exchange
		) {
			this.changeTimeType && this.changeTimeType('_3M');
		}
		if (!_.isEqual(this.props.data, nextProps.data)) {
			this.getDataChart(nextProps);
		}
	}

	componentDidMount() {
		this.getDataChart();
	}

	shouldComponentUpdate(nextProps, nextState) {
		return (
			!_.isEqual(nextProps.priceObject, this.props.priceObject) ||
			!_.isEqual(nextProps.symbol, this.props.symbol) ||
			!_.isEqual(nextProps.exchange, this.props.exchange) ||
			!_.isEqual(nextState, this.state)
		);
	}

	getDataChart(props) {
		const { symbol, exchange } = props || this.props;
		storage
			.load({
				key: 'WatchListChart',
				id: `${symbol}#${exchange}`
			})
			.then((data) => {
				if (!data[this.state.filterType]) return;
				this.state.isLoading = false;
				this.state.data = data;
				this.forceUpdate();
			})
			.catch(() => {
				this.state.data = {};
			});
	}

	onChange = this.onChange.bind(this);
	onChange(filterType) {
		this.state.filterType = filterType;
		this.state.isLoading = true;
		this.forceUpdate();

		this.onChangeTimeout = setTimeout(() => {
			this.state.isLoading = false;
			this.forceUpdate();
		}, 1000);
	}

	onChangeLoadingState = this.onChangeLoadingState.bind(this);
	onChangeLoadingState(isLoading) {
		if (!isLoading) {
			this.onChangeTimeout && clearTimeout(this.onChangeTimeout);
			this.onChangeTimeout = null;
		}
		this.setState({ isLoading });
	}

	getLineChartData({ close = 0, volume = 0 }, timeStamp) {
		return {
			y: +close,
			marker: timeStamp,
			volume
		};
	}

	getMarkerInfo({ volume = 0, open, high, low, close }, timeStamp) {
		// const { filterType } = this.state;
		// const markerLabelTimeFormat = Util.checkIntervalMarkerLabelTimeFormat(
		// 	filterType
		// );

		// const timeMarker = renderTime(timeStamp, markerLabelTimeFormat);

		const openLabel = formatNumberNew2(open, PRICE_DECIMAL.PRICE);
		const highLabel = formatNumberNew2(high, PRICE_DECIMAL.PRICE);
		const lowLabel = formatNumberNew2(low, PRICE_DECIMAL.PRICE);
		const closeMarker =
			close === 0 ? '--' : formatNumberNew2(close, PRICE_DECIMAL.PRICE);
		const volumeLabel = largeValue(volume);

		return `O: ${openLabel}  H: ${highLabel}  L: ${lowLabel}  C: ${closeMarker}  Vol: ${volumeLabel}`;
	}

	getBarChartData({ volume = 0, open, high, low, close }, timeStamp) {
		const marker = this.getMarkerInfo(
			{
				volume,
				open,
				high,
				low,
				close
			},
			timeStamp
		);

		return { y: +volume, marker: +close };
	}

	getCandleChartData(
		{ volume = 0, high = 0, low = 0, open = 0, close = 0 },
		timeStamp
	) {
		console.log(`getCandleChartData - high: ${high} - low: ${low}`);
		if (isNaN(open) || open === null || open === undefined) {
			open = 0;
		}
		if (isNaN(high) || high === null || high === undefined) {
			high = 0;
		}
		if (isNaN(low) || low === null || low === undefined) {
			low = 0;
		}
		if (isNaN(close) || close === null || close === undefined) {
			close = 0;
		}
		return {
			shadowH: +high,
			shadowL: +low,
			open: +open,
			close: +close,
			timeStamp,
			marker: this.getMarkerInfo(
				{
					volume,
					open,
					high,
					low,
					close
				},
				timeStamp
			)
		};
	}

	getData() {
		const { symbol } = this.props;
		const { filterType, data = {} } = this.state;
		const newData = _.isNil(data[filterType])
			? {}
			: { ...data[filterType] };

		// Xử lý vẽ bar cuối đối với chart 3M duration day
		// const lastKey = _.last(_.keys(newData));
		const { previous_close: preClosePrice = 0 } =
			this.props.priceObject || {};

		// const newClose = close || tradePrice || 0;

		// const isWeekend = checkWeekend();
		// const isOpenSession = Util.checkOpenSessionBySymbol(symbol);
		// const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice);
		// const isAddLastBar = Business.checkDurationAddLastBar(filterType);

		// if (isWeekend && isOpenSession && isDrawBarChartNow && isAddLastBar) {
		//     newData[timePrice] = { ...this.props.priceObject, close: newClose };
		// }

		const result = {
			maxLeft: 0,
			minRight: 0,
			maxRight: 0,
			listCandle: [],
			listVolume: [],
			listData: []
		};

		const listTemp = [];
		const listMin = [];
		const listMax = [];
		if (newData && !newData.noData) {
			_.forEach(newData, (eachData, key) => {
				const { close, open, high, low, volume } = eachData;

				if (
					close &&
					open &&
					high &&
					low &&
					volume &&
					!isNaN(open) &&
					!isNaN(high) &&
					!isNaN(low)
				) {
					result.listData.push(this.getLineChartData(eachData, +key));

					result.listVolume.push(
						this.getBarChartData(eachData, +key)
					);

					result.listCandle.push(
						this.getCandleChartData(eachData, +key)
					);

					listTemp.push(+volume || 0);

					listMin.push(Math.min(+high, +low, +close, +open));

					listMax.push(Math.max(+high, +low, +close, +open));
				}
			});
			result.maxLeft = _.max(listTemp) * 13 || 0;

			listMin.push(+preClosePrice);
			listMax.push(+preClosePrice);

			const min = _.min(listMin);
			const max = _.max(listMax);
			result.minRight = min - (max - min) / 3;
			if (result.minRight < 0) result.minRight = min;
			result.maxRight = max + (max - min) / 3;
			if (result.minRight === result.maxRight) {
				result.minRight = 0;
			}
		}

		result.rawData = newData;

		return result;
	}

	onSelectChartType = this.onSelectChartType.bind(this);
	onSelectChartType(value) {
		this.state.chartType = value;
		this.forceUpdate();
		// this.setState({
		// 	chartType: value
		// });
	}

	render() {
		return null;
	}
}

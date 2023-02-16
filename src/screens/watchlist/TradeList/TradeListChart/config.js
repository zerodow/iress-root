import _ from 'lodash';
import { processColor } from 'react-native';
import moment from 'moment-timezone';

import * as Util from '~/util';
import * as FuncUtil from '~/lib/base/functionUtil';
import Enum from '~/enum';
import { func } from '~/storage';
import CommonStyle from '~/theme/theme_controller';

const { PRICE_DECIMAL, PRICE_FILL_TYPE } = Enum;

const STATUS = {
	UP: 'UP',
	DOWN: 'DOWN'
};

const DEFAULT_CONFIG = {
	mode: 'LINEAR',
	drawValues: false,
	drawCircles: false,
	drawFilled: true,
	fillAlpha: 2000,
	axisDependency: 'RIGHT'
};

const ChartColor = {
	GRADIENT_BEGIN: 0.3,
	GRADIENT_END: 0,
	DOWN_COLOR: {
		BORDER: 'rgb(253, 55, 84)',
		BASE_COLOR: [241, 0, 0]
	},
	UP_COLOR: {
		BORDER: 'rgb(95, 255, 169)',
		BASE_COLOR: [92, 255, 92]
	}
};

export const formatValue = (value) => {
	const valueAsString = String(value);
	const [f] = valueAsString.split('.');
	const size = _.size(f);
	if (size >= 4) {
		const fm = _.map(_.range(size), () => '0');
		return `${'   '}#${fm.join('')}.0`;
	} else if (size >= 2) {
		const fm = _.map(_.range(size), () => '0');
		return `${'   '}#${fm.join('')}.00`;
	} else {
		return '   #0.000';
	}
};

export const getTimeFormat = (type) => {
	if (type === PRICE_FILL_TYPE._1D) {
		return { timeFormatter: 'H', GRANULARITY: 7 };
	} else if (type === PRICE_FILL_TYPE._1W) {
		return { timeFormatter: 'DD', GRANULARITY: 5 };
	} else if (type === PRICE_FILL_TYPE._1M) {
		return { timeFormatter: 'DD', GRANULARITY: 5 };
	} else if (type === PRICE_FILL_TYPE._3M) {
		return { timeFormatter: 'MMM', GRANULARITY: 5 };
	} else if (type === PRICE_FILL_TYPE._6M) {
		return { timeFormatter: 'MMM', GRANULARITY: 7 };
	} else if (type === PRICE_FILL_TYPE._YTD) {
		return { timeFormatter: 'MMM', GRANULARITY: 5 };
	} else if (type === PRICE_FILL_TYPE._1Y) {
		return { timeFormatter: 'MMM', GRANULARITY: 6 };
	} else if (type === PRICE_FILL_TYPE._3Y) {
		return { timeFormatter: 'MMM', GRANULARITY: 7 };
	} else if (type === PRICE_FILL_TYPE._5Y) {
		return { timeFormatter: 'YYYY', GRANULARITY: 6 };
	} else if (type === PRICE_FILL_TYPE._10Y) {
		return { timeFormatter: 'YYYY', GRANULARITY: 6 };
	} else if (type === PRICE_FILL_TYPE._ALL) {
		return { timeFormatter: 'YYYY', GRANULARITY: 6 };
	} else {
		return { timeFormatter: 'MMM YYYY', GRANULARITY: 6 };
	}
};

export default class ChartConfig {
	constructor(props) {
		this.preClose = null;
		this.data = [];
		this.symbol = '';
		this.maxValue = 0;
		this.minValue = 0;
	}
	setData({ preClose, data, symbol, filterType }) {
		this.preClose = this.maxValue = this.minValue = preClose;
		this.data = data;
		this.sortedData = _.sortBy(_.keys(data));
		this.symbol = symbol;

		const now = new Date().getTime();
		this.isAuBySymbol = Util.isAuBySymbol(this.symbol);
		this.isCloseSession = Util.checkCloseSessionBySymbol(
			now,
			this.isAuBySymbol
		);

		this.status = this.getStatus();
		this.preCloseChart = this.getPreCloseChart();
		this.dataChart = this.getChart();
		this.type = filterType;
	}

	getData() {
		const result = [];

		if (this.preCloseChart) {
			result.push(this.preCloseChart);
		}

		if (!_.isEmpty(this.dataChart)) {
			_.forEach(this.dataChart, (itemData) => {
				!_.isEmpty(itemData) && result.push(itemData);
			});
		}

		return result;
	}

	getSize() {
		return {
			maxRight: this.maxValue,
			minRight: this.minValue
		};
	}

	getStatus() {
		if (!this.preClose || _.isEmpty(this.data)) return STATUS.UP;
		const { close: latestPrice } = _.last(_.values(this.data));
		return +this.preClose <= +latestPrice ? STATUS.UP : STATUS.DOWN;
	}

	getPreChartGrad(baseColor) {
		if (this.maxValue > this.preClose) {
			const diff = this.getDiff();
			const midderPoint = _.floor(diff, 4) - 0.001;

			if (midderPoint <= 1 && midderPoint - 0.0001 > 0) {
				const opacityOffset =
					ChartColor.GRADIENT_BEGIN - ChartColor.GRADIENT_END;
				const endOpacity =
					_.floor(opacityOffset * diff, 2) + ChartColor.GRADIENT_END;
				return {
					colors: [
						this.createColor(baseColor, 0),
						this.createColor(baseColor, endOpacity)
					],
					positions: [0, 1]
				};
			}
		}

		return {
			colors: [
				this.createColor(baseColor, ChartColor.GRADIENT_END),
				this.createColor(baseColor, ChartColor.GRADIENT_BEGIN)
			],
			positions: [0, 1]
		};
	}

	getPreGradient(status) {
		const baseColor =
			status === STATUS.UP
				? ChartColor.UP_COLOR.BASE_COLOR
				: ChartColor.DOWN_COLOR.BASE_COLOR;

		const { colors, positions } = this.getPreChartGrad(baseColor);
		return {
			colors,
			positions,
			angle: 90,
			orientation: 'BOTTOM_TOP'
		};
	}

	getPreCloseChart() {
		if (!this.preClose || _.isEmpty(this.data)) return null;
		const borderColorChart = this.getBorderColor(this.status);
		// const borderColorChart = 'rgb(139, 140, 147)';

		const fillGradient = this.getPreGradient(STATUS.DOWN);

		const config = {
			...DEFAULT_CONFIG,
			lineWidth: 2,
			color: processColor(borderColorChart),
			dashedLine: {
				lineLength: 5,
				spaceLength: 2
			},
			// fillGradient,
			drawFilled: false
		};

		const result = [
			{
				y: this.preClose,
				x: 0
			}
		];

		if (this.isCloseSession) {
			result.push({
				y: +this.preClose,
				x: _.size(this.data) - 1
			});
		} else {
			// const size = isAuBySymbol ? 74 : 78;
			const size = _.size(this.data) - 1;
			result.push({
				y: +this.preClose,
				x: size
			});
		}

		return {
			values: result,
			label: 'preClose',
			config
		};
	}

	createColor(base, opacity) {
		return processColor(`rgba(${_.join(base, ',')},${opacity})`);
	}

	getDiff() {
		const maxOffset = this.maxValue - this.minValue || 1;
		const preOffset = this.preClose - this.minValue;
		return preOffset / maxOffset;
	}

	getMainChartGrad(baseColor) {
		return {
			colors: [
				this.createColor(baseColor, ChartColor.GRADIENT_END),
				this.createColor(baseColor, ChartColor.GRADIENT_BEGIN)
			],
			positions: [0, 1]
		};
	}

	getMainGradient(status) {
		const baseColor =
			status === STATUS.UP
				? ChartColor.UP_COLOR.BASE_COLOR
				: ChartColor.DOWN_COLOR.BASE_COLOR;
		// const baseColor = ChartColor.UP_COLOR.BASE_COLOR;

		const { colors, positions } = this.getMainChartGrad(baseColor);
		return {
			colors,
			positions,
			angle: 90,
			orientation: 'BOTTOM_TOP'
		};
	}

	getChart() {
		if (
			!this.symbol ||
			_.isEmpty(this.data) ||
			(this.data && this.data.noData)
		) {
			return null;
		}

		const displayName = func.getDisplayNameSymbol(this.symbol);
		const result = [];
		const chartData = [];

		this.maxValue = this.minValue = this.preClose || 0;

		_.forEach(this.sortedData, (key, index) => {
			const item = this.data[key];
			const dataTemp = +item.close;
			if (this.maxValue < dataTemp) {
				this.maxValue = dataTemp;
			}

			if (this.minValue > dataTemp) {
				this.minValue = dataTemp;
			}
		});

		let offset = this.maxValue - this.minValue;
		offset = Math.max(offset, 0);
		this.maxValue = this.maxValue + offset * 0.1;
		this.minValue = this.minValue - offset * 0.1;

		_.forEach(this.sortedData, (key, index) => {
			const item = this.data[key];
			const dataTemp = +item.close;

			const timeStamp = parseInt(key);
			const markerLabelTimeFormat = Util.checkIntervalMarkerLabelTimeFormat(
				'1D'
			);

			const markerTime = FuncUtil.renderTime(
				timeStamp,
				markerLabelTimeFormat
			);
			const value = FuncUtil.formatNumberNew2(
				dataTemp,
				PRICE_DECIMAL.VALUE
			);

			const marker = `${markerTime}\n ${displayName}: ${value}`;

			chartData.push({
				y: dataTemp,
				x: index,
				marker
			});
		});

		const borderColorChart = this.getBorderColor(this.status);
		const fillGradient = this.getMainGradient(this.status);
		const config = {
			...DEFAULT_CONFIG,
			lineWidth: 1,
			color: processColor(borderColorChart),
			fillGradient
		};

		if (!_.isEmpty(chartData)) {
			result.push({
				values: chartData,
				label: 'chartData',
				config
			});
		}

		return result;
	}

	getBorderColor(status) {
		const borderColorChart =
			status === STATUS.UP
				? ChartColor.UP_COLOR.BORDER
				: ChartColor.DOWN_COLOR.BORDER;
		return borderColorChart;
	}

	getGranularity() {
		const size = _.size(this.data);
		const { timeFormatter, GRANULARITY } = getTimeFormat(this.type);

		const granularityX = _.floor(size / GRANULARITY) + 1;
		const granularityY =
			_.floor((this.maxValue - this.minValue) / 4, 4) || 0;
		const XValueFormatter = _.map(
			_.values(this.data),
			({ updated }, index) => {
				if (
					index < granularityX / 2 ||
					index > size - granularityX / 2
				) {
					return '';
				}

				return moment
					.tz(updated, Enum.LOCATION.AU)
					.format(timeFormatter);
			}
		);

		const ArrYValueFormatter = _.map(
			this.data,
			({ close }) => formatValue(+close) || ''
		);
		const YValueFormatter = _.max(ArrYValueFormatter);

		return { XValueFormatter, YValueFormatter, granularityX, granularityY };
	}
}

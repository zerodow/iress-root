import _ from 'lodash';
import { processColor, Platform } from 'react-native';
import moment from 'moment-timezone';
import * as Controller from '~/memory/controller';

import Enum from '~/enum';
import * as Util from '~/util';

const DOWN_COLOR = {
	BORDER: '#df0000',
	GRADIENT_BEGIN: 'rgba(241, 0, 0, 0)',
	GRADIENT_END: 'rgba(241, 0, 0, 0.3)',
	GRADIENT_BLUR: 'rgba(241, 0, 0, 0.3)'
};
const UP_COLOR = {
	BORDER: '#00b800',
	GRADIENT_BEGIN: 'rgba(0, 184, 0, 0)',
	GRADIENT_END: 'rgba(0, 184, 0, 0.3)',
	GRADIENT_BLUR: 'rgba(7, 241, 0, 0.3)'
};

const DASHED_COLOR = {
	BORDER: 'rgba(0, 0, 0, 0.3)',
	LIGHT_THEME_BORDER: 'rgba(0, 0, 0, 0.8)',
	DARK_THEME_BORDER: 'rgba(255, 255, 255, 0.8)'
};

const SELECT_COLOR = {
	BORDER: '#3198f6',
	GRADIENT_BEGIN: 'rgba(32, 150, 243, 0)',
	GRADIENT_END: 'rgba(32, 150, 243, 0.54)',
	GRADIENT_BLUR: 'rgba(32, 150, 243, 0.3)'
};

const { PRICE_FILL_TYPE, THEME } = Enum;

export const formatValue = value => {
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
}

export default class LineChartFunc {
	constructor() {
		this.defaultConfig = {
			mode: 'LINEAR',
			lineWidth: 1.5,
			drawValues: false,
			drawCircles: false,
			highlightColor: processColor('transparent'),
			highlightLineWidth: 1,
			fillAlpha: 1000,
			axisDependency: 'RIGHT'
		};

		this.defaultFillColor = {
			positions: [0, 0.5],
			angle: 90,
			orientation: 'BOTTOM_TOP'
		};
	}

	set({
		maxRight,
		minRight,
		listLineData,
		preClosePrice,
		filterType,
		firstPoint,
		secondPoint
	}) {
		this.maxRight = maxRight;
		this.minRight = minRight;
		this.data = listLineData;
		this.closePrice = preClosePrice;
		this.type = filterType;

		this.setPoint(firstPoint, secondPoint);

		const { y: lastValue } = _.last(listLineData);
		this.isUpper = lastValue > preClosePrice;
	}

	setPoint(firstPoint, secondPoint) {
		if (!firstPoint && !secondPoint) {
			this.firstPoint = undefined;
			this.secondPoint = undefined;
			return;
		}
		if (!firstPoint) return (this.firstPoint = secondPoint);
		if (!secondPoint) return (this.firstPoint = firstPoint);

		if (firstPoint.data.marker > secondPoint.data.marker) {
			this.firstPoint = secondPoint;
			this.secondPoint = firstPoint;
		} else {
			this.firstPoint = firstPoint;
			this.secondPoint = secondPoint;
		}
	}

	get() {
		if (_.isEmpty(this.data)) {
			return [];
		}
		if (!this.firstPoint && !this.secondPoint) {
			return [this.createDefaultChart()];
		}

		if (this.firstPoint && this.secondPoint) {
			return [
				this.createLeftChart(true),
				this.createPointWithColor(this.firstPoint),
				this.createSelectedChart(),
				this.createPointWithColor(this.secondPoint),
				this.createRightChart(true),
				this.create2Highlight(this.firstPoint),
				this.create2Highlight(this.secondPoint)
			];
		}
		return [
			this.createLeftChartSelected(),
			this.createPointSelected(this.firstPoint),
			this.createRightChartSelected(),
			this.create1Highlight(this.firstPoint)
		];
	}

	getPreData(symbol) {
		let result = [];
		result.push({
			y: +this.closePrice,
			x: 0
		});

		if (this.type === PRICE_FILL_TYPE._1D) {
			const isAuBySymbol = Util.isAuBySymbol(symbol);
			const now = new Date().getTime();
			const isCloseSession = Util.checkCloseSessionBySymbol(
				now,
				isAuBySymbol
			);

			if (isCloseSession) {
				if (Platform.OS === 'android') {
					result.push({
						y: +this.closePrice,
						x: _.size(this.data)
					});
				} else {
					result.push({
						y: +this.closePrice,
						x: _.size(this.data) - 1
					});
				}
			} else {
				const size = isAuBySymbol ? 74 : 78;
				result.push({
					y: +this.closePrice,
					x: size
				});
			}
		} else {
			if (Platform.OS === 'android') {
				result.push({
					y: +this.closePrice,
					x: _.size(this.data)
				});
			} else {
				result.push({
					y: +this.closePrice,
					x: _.size(this.data) - 1
				});
			}
		}

		return {
			values: result,
			label: 'preCloseLine',
			config: {
				mode: 'LINEAR',
				drawValues: false,
				drawCircles: false,
				lineWidth: 0.3,
				highlightColor: processColor('transparent'),
				color: this.getDashedBorderColor(),
				drawFilled: false,
				dashedLine: {
					lineLength: 6,
					spaceLength: 2
				},
				axisDependency: 'RIGHT'
			}
		};
	}

	// #region defined get config

	getDashedBorderColor() {
		const borderColor =
			Controller.getThemeColorFromStorage() === THEME.DARK
				? DASHED_COLOR.DARK_THEME_BORDER
				: DASHED_COLOR.LIGHT_THEME_BORDER;
		return processColor(borderColor);
	}

	getBorderColor(isUpper = this.isUpper, isBlur) {
		if (isUpper) {
			if (isBlur) return processColor(UP_COLOR.BORDER + '30');
			return processColor(UP_COLOR.BORDER);
		} else {
			if (isBlur) return processColor(DOWN_COLOR.BORDER + '30');
			return processColor(DOWN_COLOR.BORDER);
		}
	}

	getDefaultFillColor(isUpper = this.isUpper, isBlur) {
		let colors = [];
		if (isUpper) {
			// GRADIENT_BLUR
			colors.push(processColor(UP_COLOR.GRADIENT_BEGIN));
			if (isBlur) {
				colors.push(processColor(UP_COLOR.GRADIENT_BLUR));
			} else colors.push(processColor(UP_COLOR.GRADIENT_END));
		} else {
			colors.push(processColor(DOWN_COLOR.GRADIENT_BEGIN));
			if (isBlur) {
				colors.push(processColor(DOWN_COLOR.GRADIENT_BLUR));
			} else colors.push(processColor(DOWN_COLOR.GRADIENT_END));
		}
		return {
			colors,
			...this.defaultFillColor
		};
	}

	getDataSelected(startValue, endValue) {
		const result = [];
		_.forEach(this.data, (data, index) => {
			if (
				data.marker >= startValue.marker &&
				data.marker <= endValue.marker
			) {
				result.push({ ...data, x: index });
			}
		});

		return result;
	}

	// #endregion

	getGranularity() {
		const size = _.size(this.data);
		const { timeFormatter, GRANULARITY } = getTimeFormat(this.type);

		const granularityX = _.floor(size / GRANULARITY) + 1;
		const granularityY =
			_.floor((this.maxRight - this.minRight) / 4, 4) ||
			0;

		const XValueFormatter = _.map(
			this.data,
			({ marker: timeStamp, y }, index) => {
				if (
					index < granularityX / 2 ||
					index > size - granularityX / 2
				) {
					return '';
				}

				return moment
					.tz(timeStamp, Enum.LOCATION.AU)
					.format(timeFormatter);
			}
		);

		const ArrYValueFormatter = _.map(
			this.data,
			({ y }) => formatValue(y) || ''
		);
		const YValueFormatter = _.max(ArrYValueFormatter);

		return { XValueFormatter, YValueFormatter, granularityX, granularityY };
	}

	createDefaultChart() {
		return {
			values: this.data,
			label: 'default',
			config: {
				...this.defaultConfig,
				color: this.getBorderColor(),
				drawFilled: true,
				fillGradient: this.getDefaultFillColor()
			}
		};
	}

	createLeftChart(isBlur) {
		const startPoint = _.first(this.data);
		const endPoint = this.firstPoint.data;
		const values = this.getDataSelected(startPoint, endPoint);
		let color = processColor('blue');
		if (this.secondPoint) {
			const isUpper = this.firstPoint.data.y < this.secondPoint.data.y;
			color = this.getBorderColor(isUpper);
		}

		return {
			values,
			label: 'leftChart',
			config: {
				...this.defaultConfig,
				highlightColor: color,
				color: this.getBorderColor(this.isUpper, isBlur),
				drawFilled: true,
				fillGradient: this.getDefaultFillColor(this.isUpper, isBlur)
			}
		};
	}

	createLeftChartSelected() {
		const leftChart = this.createLeftChart();
		return {
			...leftChart,
			config: {
				...leftChart.config,
				highlightColor: processColor(SELECT_COLOR.BORDER),
				color: processColor(SELECT_COLOR.BORDER),
				fillGradient: {
					colors: [
						processColor(SELECT_COLOR.GRADIENT_BEGIN),
						processColor(SELECT_COLOR.GRADIENT_END)
					],
					...this.defaultFillColor
				}
			}
		};
	}

	createRightChart(isBlur) {
		const startPoint = this.secondPoint
			? this.secondPoint.data
			: this.firstPoint.data;
		const endPoint = _.last(this.data);

		const values = this.getDataSelected(startPoint, endPoint);
		return {
			values,
			label: 'rightChart',
			config: {
				...this.defaultConfig,
				color: this.getBorderColor(this.isUpper, isBlur),
				drawFilled: true,
				fillGradient: this.getDefaultFillColor(this.isUpper, isBlur)
			}
		};
	}

	createRightChartSelected() {
		const rightChart = this.createRightChart();
		return {
			...rightChart,
			config: {
				...rightChart.config,
				color: processColor(SELECT_COLOR.BORDER),
				highlightColor: processColor(SELECT_COLOR.BORDER),
				fillGradient: {
					colors: [
						processColor(SELECT_COLOR.GRADIENT_BEGIN),
						processColor(SELECT_COLOR.GRADIENT_END)
					],
					...this.defaultFillColor
				}
			}
		};
	}

	createPoint(point) {
		const { data, x } = point || {};
		return {
			values: [{ ...data, x }],
			label: 'point',
			config: {
				...this.defaultConfig,
				drawCircles: true,
				circleRadius: 4,
				drawCircleHole: false,
				circleColor: processColor('blue')
			}
		};
	}

	createPointSelected(point) {
		const currentPoint = this.createPoint(point);
		return {
			...currentPoint,
			config: {
				...currentPoint.config,
				circleColor: processColor(SELECT_COLOR.BORDER)
			}
		};
	}

	createPointWithColor(point) {
		const isUpper = this.firstPoint.data.y < this.secondPoint.data.y;
		const color = this.getBorderColor(isUpper);

		const result = this.createPoint(point);
		result.config = {
			...result.config,
			// highlightColor: color,
			circleColor: color
		};

		return result;
	}

	checkChartTrend() {
		const fPointX = this.firstPoint.x;
		const fPointY = this.firstPoint.data.y;
		const sPointX = this.secondPoint.x;
		const sPointY = this.secondPoint.data.y;

		let leftValue = fPointY;
		let rightValue = sPointY;

		if (sPointX < fPointX) {
			leftValue = sPointY;
			rightValue = fPointY;
		}
		return leftValue < rightValue;
	}

	createSelectedChart() {
		const startPoint = this.firstPoint.data;
		const endPoint = this.secondPoint.data;

		const values = this.getDataSelected(startPoint, endPoint);

		const isUpper = this.checkChartTrend();
		return {
			values,
			label: 'selectedChart',
			config: {
				...this.defaultConfig,
				color: this.getBorderColor(isUpper),
				drawFilled: true,
				fillGradient: this.getDefaultFillColor(isUpper)
			}
		};
	}
	create1Highlight(point) {
		if (Platform.OS === 'ios') return {}
		const { x } = point || {};

		return {
			values: [{ x, y: this.minRight - 10000 }, { x, y: this.maxRight + 10000 }],
			label: 'highLight1',
			config: {
				mode: 'LINEAR',
				drawValues: false,
				drawCircles: false,
				lineWidth: 1,
				highlightColor: processColor('transparent'),
				color: processColor(SELECT_COLOR.BORDER),
				drawFilled: true,
				fillColor: processColor('red'),
				fillAlpha: 60,
				axisDependency: 'RIGHT'
			}
		};
	}

	create2Highlight(point) {
		if (Platform.OS === 'ios') return {}
		const { x } = point || {};

		const isUpper = this.firstPoint.data.y < this.secondPoint.data.y;
		const color = this.getBorderColor(isUpper);

		return {
			values: [{ x, y: this.minRight - 10000 }, { x, y: this.maxRight + 10000 }],
			label: 'highLight2',
			config: {
				mode: 'LINEAR',
				drawValues: false,
				drawCircles: false,
				lineWidth: 1,
				highlightColor: processColor('transparent'),
				color,
				drawFilled: false,
				axisDependency: 'RIGHT'
			}
		};
	}
}

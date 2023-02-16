import { call, select, put } from 'redux-saga/effects';
import _ from 'lodash';
import { processColor } from 'react-native';

import {
	formatNumberNew2,
	logAndReport,
	largeValue,
	renderTime,
	checkWeekend,
	getDisplayName
} from '~/lib/base/functionUtil';
import * as Business from '~/business';
import Enum from '~/enum';
import * as Util from '~/util';
import { getDateStringWithFormat } from '~/lib/base/dateTime';
import ChartActions from './price_chart.reducer';
import PriceActions from './price.reducer';

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const CHART_TYPE = Enum.CHART_TYPE;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

let maxValue = -99999999999999;
let minValue = 999999999999999;

export function* mergeNewDataHistorical() {
	const { dataChart } = yield select(state => state.priceChart);
	yield call(getDataChart, dataChart);
}
export function* priceChartChangeFilterType() {
	yield put(ChartActions.priceChartGetSnapshot());
	yield put(PriceActions.priceUniSubHistorical());
}

export function* priceChartChangeChartType() {
	yield put(ChartActions.priceChartGetSnapshot());
}

export function* priceChartGetSnapshotSuccess({ dataChart }) {
	maxValue = -99999999999999;
	minValue = 999999999999999;
	yield call(getDataChart, dataChart);
}

export function* priceChartGetSnapshot() {
	try {
		const { symbol } = yield select(state => state.searchDetail);
		const { filterType } = yield select(state => state.priceChart);
		const dataChart = yield call(
			Business.getDataChartPrice,
			symbol,
			filterType
		);
		yield put(ChartActions.priceChartGetSnapshotSuccess(dataChart));
	} catch (error) {
		logAndReport(
			'getDataChart price exception',
			error,
			'getDataChart price'
		);
	}
}

function* getDataChart(data) {
	const newData = _.isNil(data) ? {} : data;
	const { symbol } = yield select(state => state.searchDetail);
	const { priceObject } = yield select(state => state.price);
	const { filterType, chartType } = yield select(state => state.priceChart);

	const displayName = getDisplayName(symbol) || '';
	const currentPrice = { ...priceObject };
	const isChartDay = filterType === PRICE_FILL_TYPE._1D;
	const isAddLastBar = Business.checkDurationAddLastBar(filterType);
	let keysSorted = [];

	if (!_.isEmpty(newData)) {
		keysSorted = _.keys(newData);
	}

	// Xử lý vẽ bar cuối đối với chart 3M duration day
	const lastKey = parseInt(keysSorted[keysSorted.length - 1]);
	const timePrice = currentPrice.updated;
	currentPrice.close = currentPrice.close || currentPrice.trade_price || 0;
	const isWeekend = checkWeekend();
	const isOpenSession = Util.checkOpenSessionBySymbol(symbol);
	const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice);
	if (isAddLastBar && isDrawBarChartNow && isWeekend && isOpenSession) {
		newData[currentPrice.updated] = currentPrice;
		keysSorted.push(currentPrice.updated);
	}

	const result = {
		listData: [],
		listColor: [],
		labelsP: [],
		labelsM: [],
		maxLeft: 0,
		minRight: 0,
		maxRight: 0,
		listCandle: [],
		listVolume: [],
		labelLength: 0
	};

	const listTemp = [];
	const listMin = [];
	const listMax = [];

	if (newData && !newData.noData) {
		_.forEach(keysSorted, (key, index) => {
			const eachData = newData[key];

			// listColor
			const listColor = result.listColor || [];
			const { close, open, high, low, volume } = eachData;
			if (parseFloat(close) <= parseFloat(open)) {
				listColor.push(processColor('rgba(193, 0, 0, 0.15)'));
			} else {
				listColor.push(processColor('rgba(0, 66, 0, 0.15)'));
			}
			result.listColor = listColor;

			// labelsP
			const labelsP = result.labelsP || [];
			const timeStamp = parseInt(key);
			const date = new Date(timeStamp);
			const labelTimeFormat = isChartDay ? 'HH:mm' : 'MMM YYYY';
			let label = getDateStringWithFormat(date, labelTimeFormat);
			if (filterType !== PRICE_FILL_TYPE._3Y) {
				label = getDateStringWithFormat(date, labelTimeFormat);
			}
			labelsP.push(label);
			result.labelsP = labelsP;

			// listData
			const listData = result.listData || [];
			let dataPre;
			let dataChanged = 0;
			const firstDateValue = newData[keysSorted[0]].close || 0;

			if (index > 0) {
				const keyPre = keysSorted[index - 1];
				dataPre = newData[keyPre];
				if (chartType === CHART_TYPE.PERCENT) {
					dataChanged = close - firstDateValue;
				} else {
					dataChanged = close - dataPre.close;
				}
			}
			let dataTemp = 0;
			if (chartType === CHART_TYPE.VALUE) {
				dataTemp = close;
			} else {
				dataTemp =
					dataPre && dataPre.close > 0
						? (100 * dataChanged) / firstDateValue
						: 0;
			}

			const markerLabelTimeFormat = Util.checkIntervalMarkerLabelTimeFormat(
				filterType
			);
			const markerLabel = getDateStringWithFormat(
				date,
				markerLabelTimeFormat
			);

			if (!isNaN(dataTemp)) {
				listData.push({
					y: dataTemp,
					marker: `${renderTime(timeStamp, markerLabelTimeFormat)}\n ${displayName}: ${formatNumberNew2(dataTemp, PRICE_DECIMAL.VALUE)}${chartType === '%' ? '%' : ''}`
				});
			}
			result.listData = listData;

			if (dataTemp >= maxValue) {
				maxValue = dataTemp;
			}
			if (dataTemp <= minValue) {
				minValue = dataTemp;
			}

			if (
				!_.isUndefined(open) &&
				!_.isNull(open) &&
				(!_.isUndefined(high) && !_.isNull(high)) &&
				(!_.isUndefined(low) && !_.isNull(low)) &&
				(!_.isUndefined(close) && !_.isNull(close))
			) {
				// labelsM
				const labelsM = result.labelsM || [];
				labelsM.push(label); // fix chart day
				result.labelsM = labelsM;

				const openLabel = formatNumberNew2(open, PRICE_DECIMAL.PRICE);
				const highLabel = formatNumberNew2(high, PRICE_DECIMAL.PRICE);
				const lowLabel = formatNumberNew2(low, PRICE_DECIMAL.PRICE);
				const closeMarker =
					close === 0
						? '--'
						: formatNumberNew2(close, PRICE_DECIMAL.PRICE);
				const volumeLabel = largeValue(volume);
				markerInfo = `${renderTime(timeStamp, markerLabelTimeFormat)} - O: ${openLabel}  H: ${highLabel}  L: ${lowLabel}  C: ${closeMarker}  Vol: ${volumeLabel}`;
				// listVolume
				const listVolume = result.listVolume || [];
				const temp2 = {};
				temp2.y = parseInt(volume) || 0;
				temp2.marker = markerInfo;
				listVolume.push(temp2);
				result.listVolume = listVolume;

				// listCandle
				const listCandle = result.listCandle || [];
				const temp = {};
				temp.shadowH = parseFloat(high) || 0;
				temp.shadowL = parseFloat(low) || 0;
				temp.open = parseFloat(open) || 0;
				temp.close = parseFloat(close) || 0;
				temp.marker = markerInfo;
				listCandle.push(temp);
				result.listCandle = listCandle;

				listTemp.push(volume || 0);
				result.maxLeft = Math.max(...listTemp) * 4 || 0;

				listMin.push(Math.min(high, low, close, open));
				const min = Math.min(...listMin);

				listMax.push(Math.max(high, low, close, open));
				const max = Math.max(...listMax);

				result.minRight = min - (max - min) / 20;
				result.maxRight = max + (max - min) / 20;
			}
		});
		if (result.minRight === result.maxRight) {
			result.minRight = 0;
		}
	}

	// fix label cho chart day
	let labelLength = _.size(result.labelsM);
	if (isChartDay && _.size(result.listData) > 0) {
		const isAuBySymbol = Util.isAuBySymbol(symbol);
		const now = new Date().getTime();
		const checkTimeCloseSession = Util.checkCloseSessionBySymbol(
			now,
			isAuBySymbol
		);
		if (checkTimeCloseSession) {
			labelLength = _.size(result.listData);
		} else {
			labelLength = Util.isAuBySymbol(symbol) ? 74 : 78;
		}
	}

	result.labelLength = labelLength;
	result.maxValue = maxValue;
	result.minValue = minValue;

	yield put(
		ChartActions.priceChartSetPoint(
			(maxValue - minValue) / Enum.LABEL_COUNT
		)
	);
	yield put(ChartActions.priceChartSetData(result));
}

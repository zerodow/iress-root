import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';

import Enum from '~/enum';
import * as Util from '~/util';
import { checkWeekend } from '~/lib/base/functionUtil';
import * as Controller from '~/memory/controller';

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const CHART_TYPE = Enum.CHART_TYPE;

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
	priceChartSetData: ['chartData'],
	priceChartChangeFilterType: ['filterType'],
	priceChartChangeChartType: ['chartType'],
	priceChartSetPoint: ['point'],
	mergeNewDataHistorical: ['data'],
	priceChartGetSnapshot: null,
	priceChartGetSnapshotSuccess: ['dataChart']
});

export const ChartTypes = Types;
export default Creators;

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
	filterType: PRICE_FILL_TYPE._1D,
	listData: [],
	listColor: [],
	isLoading: false,
	labelsP: [],
	labelsM: [],
	maxLeft: 0,
	minRight: 0,
	maxRight: 0,
	listCandle: [],
	listVolume: [],
	labelLength: 0,
	chartType: CHART_TYPE.VALUE,
	point: 1,
	dataChart: {}
});

/* ------------- Reducers ------------- */
// request the avatar for a user
export const priceChartGetSnapshot = (state, { type }) =>
	state.merge({
		isLoading: true,
		type
	});
export const priceChartGetSnapshotSuccess = (state, { dataChart, type }) =>
	state.merge({ dataChart, type });
export const priceChartSetData = (state, { chartData, type }) =>
	state.merge({ ...chartData, isLoading: false, type });
export const priceChartChangeFilterType = (state, { filterType, type }) =>
	state.merge({ filterType, type });
export const priceChartChangeChartType = (state, { chartType, type }) =>
	state.merge({ chartType, type });
export const priceChartSetPoint = (state, { point, type }) =>
	state.merge({ point, type });

export const mergeNewDataHistorical = (state, { data, type }) => {
	const isWeekend = checkWeekend();
	const { filterType: dataSelect, dataChart } = state;
	let newDataChart = {};
	if (dataChart && dataChart.noData) {
		if (
			isWeekend &&
			(dataSelect === PRICE_FILL_TYPE._1Y ||
				dataSelect === PRICE_FILL_TYPE._3Y)
		) {
			newDataChart = {
				[data.updated]: data
			};
		}
		return state.merge({ dataChart: newDataChart, type });
	}

	newDataChart = Immutable.asMutable(dataChart);
	const lastKey = parseInt(
		Object.keys(dataChart)
			.sort()
			.pop()
	);
	const timePrice = data.updated;

	// Check xem đã có bar ngày hiện tại hay chưa
	const isDrawBarChartNow = Util.checkDrawBarChartNow(lastKey, timePrice);
	if (
		Controller.isPriceStreaming() ||
		(isWeekend &&
			isDrawBarChartNow &&
			(dataSelect === PRICE_FILL_TYPE._1Y ||
				dataSelect === PRICE_FILL_TYPE._3Y))
	) {
		if (newDataChart[timePrice]) {
			newDataChart[timePrice] = {
				...newDataChart[timePrice],
				...data
			};
		} else {
			newDataChart[timePrice] = data;
		}

		newDataChart[timePrice].close =
			newDataChart[timePrice].close ||
			newDataChart[timePrice].trade_price ||
			0;
	}

	return state.merge({ dataChart: newDataChart, type });
};

export const reducer = createReducer(INITIAL_STATE, {
	[Types.PRICE_CHART_SET_DATA]: priceChartSetData,
	[Types.PRICE_CHART_CHANGE_FILTER_TYPE]: priceChartChangeFilterType,
	[Types.PRICE_CHART_CHANGE_CHART_TYPE]: priceChartChangeChartType,
	[Types.PRICE_CHART_SET_POINT]: priceChartSetPoint,
	[Types.PRICE_CHART_GET_SNAPSHOT]: priceChartGetSnapshot,
	[Types.MERGE_NEW_DATA_HISTORICAL]: mergeNewDataHistorical,
	[Types.PRICE_CHART_GET_SNAPSHOT_SUCCESS]: priceChartGetSnapshotSuccess
});

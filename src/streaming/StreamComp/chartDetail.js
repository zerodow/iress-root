import moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import BaseConnecter from './baseConnect';
import * as Controller from '~/memory/controller';
import * as Util from '~/util';
import * as Api from '~/api';
import * as Business from '~/business';
import { func } from '~/storage';
import streamActions from './reducer';
import Enum from '~/enum';

let listSymbolWait = [];

class ChartStreaming extends BaseConnecter {
	componentDidUpdate(prevProps) {
		if (prevProps.filterType !== this.props.filterType) {
			this.getSnapshot();
		}

		if (prevProps.isLoading && this.props.isLoading) {
			setTimeout(() => {
				this.getSnapshot();
			}, 500);
		}
	}

	componentWillUnmount() {
		this.currentInterval && clearInterval(this.currentInterval);
		super.componentWillUnmount();
	}

	getUrl({ exchange, symbol }, priceType = Enum.PRICE_FILL_TYPE._1D) {
		if (!exchange || !symbol) return;

		const isAUSymbol = Util.isAuBySymbol(symbol);
		const timezone = isAUSymbol
			? Controller.getTimeZoneAU()
			: Controller.getTimeZoneUS();
		const curTime = new Date().getTime();
		return Api.getCustomHistorical({
			symbol,
			exchange,
			time: curTime,
			priceType,
			timezone,
			isAUSymbol
		});
	}

	getIndex(snap) {
		const preStr = _.split(snap, 'Time,Open,High,Low,Close,Volume')[0];
		return _.size(_.split(preStr, '\n'));
	}

	onSuccess(snap) {
		return new Promise((resolve) => {
			const dataChart = {};
			if (snap && typeof snap === 'string') {
				const data = Util.convertCsvToObject(snap, {
					startLine: this.getIndex(snap)
				});
				if (_.size(data) < 1) return resolve(dataChart);

				_.forEach(
					data,
					({
						Time: time,
						Open: open,
						High: high,
						Close: close,
						Volume: volume,
						Low: low
					}) => {
						const timeStamp =
							Util.getCurrentTimezone() * (60 * 60 * 1000);
						const timeUpdated =
							moment(time, ['DD/MM/YY HH:mm:ss.SSS']).valueOf() +
							timeStamp;
						if (!timeUpdated) return;

						dataChart[timeUpdated] = {
							updated: timeUpdated,
							open,
							high,
							close,
							volume,
							low
						};
					}
				);
			}
			if (snap && typeof snap === 'object') {
				return resolve(snap);
			}
			resolve(dataChart);
		});
	}

	saveToStore(exchange, symbol, data, filterType, cb) {
		const saveData = (p) => {
			const newData = p || {};
			newData[filterType] = data;
			storage
				.save({
					key: 'WatchListChart',
					id: `${symbol}#${exchange}`,
					data: newData
				})
				.then(cb)
				.catch(cb);
		};

		storage
			.load({
				key: 'WatchListChart',
				id: `${symbol}#${exchange}`
			})
			.then((data) => saveData(data))
			.catch(() => saveData());
	}

	async handleGetData({ exchange, symbol }, filterType) {
		const url = this.getUrl({ exchange, symbol }, filterType);
		let snap = await Api.requestData(url);
		// Fake Favorites priceboard
		// if (symbol === 'ANZ' && exchange === 'ASX') {
		// 	snap = Business.fakeChart()
		// }
		const data = await this.onSuccess(snap);
		if (_.isEmpty(data)) return this.onChangeLoadingState(false);
		if (data && data.code) {
			this.onChangeLoadingState(false);
			this.props.changeChartDetailData(
				data,
				symbol,
				exchange,
				filterType
			);
		} else {
			// save to storage
			this.saveToStore(exchange, symbol, data, filterType, () => {
				// dispatch reducer
				this.onChangeLoadingState(false);
				this.props.changeChartDetailData(
					data,
					symbol,
					exchange,
					filterType
				);
			});
		}
	}

	async getSnapshot(props) {
		const { listSymbol, filterType = Enum.PRICE_FILL_TYPE._1D, isLoading } =
			props || this.props;
		const { symbol, exchange } = listSymbol && listSymbol[0];
		if (isLoading || !symbol) return;

		this.onChangeLoadingState(true);
		this.handleGetData({ exchange, symbol }, filterType);
	}
}

const mapStateToProps = (state) => {
	const { marketData } = state.streamMarket;
	const { newsToday } = state.watchlist3;

	return { isLoading: _.isEmpty(marketData) || _.isEmpty(newsToday) };
};

const mapDispatchToProps = (dispatch) => ({
	changeChartDetailData: (...p) =>
		dispatch(streamActions.changeChartDetailData(...p))
});

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
	ChartStreaming
);

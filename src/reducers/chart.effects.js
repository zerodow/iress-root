import _ from 'lodash';

import * as Api from '~/api';
import { getOptionStream } from '~/streaming/streaming_business';
import Nchan from '~/nchan.1';
import * as Util from '~/util';
import * as Controller from '~/memory/controller';

export const getSnapshot = async (
	dispatch,
	{ symbol, exchange, filterType }
) => {
	if (!symbol || !exchange) return;

	const isAUSymbol = Util.isAuBySymbol(symbol);
	const timezone = isAUSymbol
		? Controller.getTimeZoneAU()
		: Controller.getTimeZoneUS();
	const curTime = new Date().getTime();
	const url = Api.getCustomHistorical({
		symbol,
		exchange,
		time: curTime,
		priceType: filterType,
		timezone,
		isAUSymbol
	});
	const data = await Api.requestData(url);
	dispatch.chart.changeChartData({ data, symbol, exchange, filterType });

	// if (snap && typeof snap === 'string') {
	// 	const preStr = _.split(snap, 'Time,Open,High,Low,Close,Volume')[0];
	// 	const data = Util.convertCsvToObject(snap, {
	// 		startLine: _.size(_.split(preStr, '\n'))
	// 	});
	// 	if (_.size(data) < 1) return;

	// 	dispatch.chart.changeChartData({ data, symbol, exchange });
	// }
};

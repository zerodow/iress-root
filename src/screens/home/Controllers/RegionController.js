import * as Api from '~/api';
import * as Controller from '~/memory/controller';
import { oktaCreateConfig } from '~/manage/manageOktaAuth';
import {
	detroy,
	setRegionSelected,
	setBrokerName
} from '~/screens/home/Model/LoginModel.js';
import CONFIG from '~/config';
import { logoutWithOldToken } from '~/manage/manageAuth';

const TIMEOUT = 15 * 1000;
export function getListRegion() {
	const url = Api.getUrlGetRegion(CONFIG.envRegion);
	return new Promise((resolve) => {
		Api.requestData(url)
			.then((res) => {
				resolve(res);
			})
			.catch((err) => {
				resolve([]);
			});
	});
}
export async function postBrokerName({
	region,
	brokerName,
	cbError,
	cbSuccess
}) {
	try {
		const brokerBody = {
			region: region,
			broker_name: brokerName
		};
		const url = Api.getUrlBrokerName();
		console.log(brokerBody, 'brokerBody');
		const data = await Api.postData(url, { data: brokerBody }, TIMEOUT);
		if (data) {
			cbSuccess && cbSuccess({ data });
		}
	} catch (error) {
		cbError && cbError({ error });
		console.info('ERROR BROKER NAME', error);
	}
}

export async function postBrokerName2(brokerName, cbSuccess, cbError) {
	try {
		const brokerBody = {
			region: Controller.getRegion(),
			broker_name: brokerName
		};
		const url = Api.getUrlBrokerName();
		const data = await Api.postData(url, { data: brokerBody }, TIMEOUT);
		if (data) {
			const {
				domain,
				domain_streaming: streamingUrl,
				version,
				region_code: region
			} = data[0];

			setBrokerName(brokerName);

			Controller.setBaseUrl(domain);
			Controller.setBaseVersion(version);
			Controller.setRegion(region);
			Controller.setBaseStreamingUrl(streamingUrl);
			oktaCreateConfig(data[0]);
			setRegionSelected(data[0]);
			cbSuccess && cbSuccess({ data });

			logoutWithOldToken('');
			return data;
		}
	} catch (error) {
		cbError && cbError({ error });
		throw error;
	}
}

import apiTypeEnum from '~/constants/api_config';

class LV1Class {
	getLv1Snapshot(exchange, strSymbol) {
		if (base.dic.isLogin) {
			return `${base.dic.baseUrl}/${base.dic.version}/${
				apiTypeEnum.priceLv1
			}/${exchange}/${strSymbol}`;
		}
		return `${base.dic.baseUrl}/${base.dic.version}/${
			apiTypeEnum.priceDelayed
		}/${exchange}/${strSymbol}`;
	}

	getSnapshot(listChannelInfo) {
		const getUrl = (exchange, str) => this.getLv1Snapshot(exchange, str);

		const listPromise = [];
		_.forEach(listChannelInfo, ({ symbolsAsUrl }, exchange) => {
			_.forEach(symbolsAsUrl, str => {
				const url = getUrl(exchange, str.replace(/.ASX/g, ''));
				listPromise.push(
					new Promise(resolve => {
						base.requestData(url)
							.then(bodyData => resolve(bodyData || []))
							.catch(() => resolve([]));
					})
				);
			});
		});

		Promise.all(listPromise)
			.then(response => {
				cw.emit('lv1.getSnapshot', response);
			})
			.catch(err => null);
	}
}

lv1 = new LV1Class();

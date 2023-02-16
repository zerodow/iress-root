import * as Util from '../util';
import Enum from '../enum';

const ORDERS_TYPE_FILTER = Enum.ORDERS_TYPE_FILTER;

export function getDataCacheByUrl(url, mongoInstance, cacheDataCb, requestDataCb) {
    const orderId = url.match(/\/order\?order_id=(.*)&detail=true/)[1];
    mongoInstance.find({ broker_order_id: orderId }).then(res => {
        if (!Util.arrayHasItem(res)) return requestDataCb();
        const newData = res.map(item => {
            delete item._id;
            return item;
        });
        return cacheDataCb(newData);
    }).catch(() => {
            return requestDataCb();
        });
};

export function deleteByOrderId(mongoInstance, orderId) {
    return new Promise(resolve => {
        mongoInstance.removeMulti({ broker_order_id: orderId })
            .then(() => {
                resolve();
            })
            .catch(() => {
                resolve();
            });
    });
}

export function setDataCacheWhenRequest(mongoInstance, newData) {
    return new Promise(async resolve => {
        if (!Util.arrayHasItem(newData)) return resolve();
        const lastItem = newData[0];
        if (!lastItem.order_tag || lastItem.order_tag !== ORDERS_TYPE_FILTER.filled) return resolve();
        await deleteByOrderId(mongoInstance, newData[0].client_order_id);
        mongoInstance.insert(newData).then(resolve).catch(resolve);
    });
};

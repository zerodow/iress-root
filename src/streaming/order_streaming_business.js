import * as Storage from '../storage';
import * as StreamingStorage from './streaming_storage'
import * as Util from '../util';

const DataStorage = Storage.dataStorage;
const OBJ = Util.OBJ;
const LENGTH_URL = 1000;

export function getChannelLoadingOrder() {
    return `order##loading_state`
}

export function getChannelPriceOrder(id) {
    if (id) return `order##lv1$${id}`
    return `order##lv1$`
}

export function getChannelRealtimeOrderDetail(orderID) {
    return `orders##detail_${orderID}`
}

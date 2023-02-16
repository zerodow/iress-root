import { getType } from '~/screens/new_order/Model/OrderEntryModel'
import Enum from '~/enum'
import OrderTypeEnum from '~/constants/order_type'
const { AMEND_TYPE } = Enum
export function isShowPrice(orderType) {
    return OrderTypeEnum.LIMIT === orderType
}
export function isShowTradingPrice({ stopPrice, takeProfitLoss }) {
    const amendType = getType()
    if (amendType === AMEND_TYPE.AMEND_TRADING_PROFITLOSS || amendType === AMEND_TYPE.AMEND_TRADING_STOPPRICE || amendType === AMEND_TYPE.AMEND_TRADING_STRATEGIES) return true
    if (amendType === AMEND_TYPE.AMEND_ORIGINAL) {
        if (!stopPrice && !takeProfitLoss) return false
        return true
    }
}
export function getValueToStopPrice(oldStopPrice, stopPrice) {
    const amendType = getType()
    if (amendType === AMEND_TYPE.AMEND_TRADING_PROFITLOSS || oldStopPrice === stopPrice) return '--'
    return stopPrice
}
export function getValueToTakeProfitLossPrice(oldTakeProfitPrice, takeProfitLoss) {
    const amendType = getType()
    if (amendType === AMEND_TYPE.AMEND_TRADING_STOPPRICE || oldTakeProfitPrice === takeProfitLoss) return '--'
    return takeProfitLoss
}
export function getValueToVolume(oldVolume, volume) {
    const amendType = getType()
    if (amendType === AMEND_TYPE.AMEND_TRADING_PROFITLOSS || amendType === AMEND_TYPE.AMEND_TRADING_STOPPRICE || oldVolume === volume) return '--'
    return volume
}
export function getValueToPrice(oldPrice, price) {
    const amendType = getType()
    if (amendType === AMEND_TYPE.AMEND_TRADING_PROFITLOSS || amendType === AMEND_TYPE.AMEND_TRADING_STOPPRICE || oldPrice === price) return '--'
    return price
}

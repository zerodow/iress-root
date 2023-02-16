import * as Req from '../network/http/request'
import * as Controller from '../memory/controller'
import * as Channel from '../streaming/channel'
import Enum from '../enum'
import * as Emitter from '@lib/vietnam-emitter'
import { dataStorage as DataStorage } from '../storage'

const REQ_KEY = Enum.REQ_KEY

export function updatePriceboard(priceboardId, userId, newPriceboard, bypassUpdateStorage) {
    !bypassUpdateStorage && FuncStorage.resetPriceBoardWatchList(newPriceboard)
    Req.updatePriceBoard(priceboardId, userId, newPriceboard)

    const url = Api.getUpdatePriceBoardUrl(priceboardId, userId)
    return Api.putData(url, { data: newPriceboard })
}

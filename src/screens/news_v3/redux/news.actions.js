import CONSTANTS from './news.constants'
export function updateAffectedSymbol(data) {
    return {
        type: CONSTANTS.NEWS_UPDATE_AFFECTED_SYMBOL,
        payload: data
    }
}

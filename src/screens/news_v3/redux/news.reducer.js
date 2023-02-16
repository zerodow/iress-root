import CONSTANTS from './news.constants'
const initState = {
    affectedSymbol: {
        // 'ASX#THC': {
        //     symbol: 'THC',
        //     changePercent: 95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#BHP': {
        //     symbol: 'BHP',
        //     changePercent: -95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#MQG': {
        //     symbol: 'MQG',
        //     changePercent: 95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#AAA': {
        //     symbol: 'AAA',
        //     changePercent: -95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#NAB': {
        //     symbol: 'NAB',
        //     changePercent: -95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#A2M': {
        //     symbol: 'A2M',
        //     changePercent: -95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#SIY': {
        //     symbol: 'SIY',
        //     changePercent: 95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#SCG': {
        //     symbol: 'SCG',
        //     changePercent: -95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#RIO': {
        //     symbol: 'RIO',
        //     changePercent: 95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#CBA': {
        //     symbol: 'CBA',
        //     changePercent: -95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // },
        // 'ASX#ANZ': {
        //     symbol: 'ANZ',
        //     changePercent: -95,
        //     changePoint: 100,
        //     exchange: 'ASX'
        // }
    }
}
export const newsIress = (state = initState, action) => {
    switch (action.type) {
        case CONSTANTS.NEWS_UPDATE_AFFECTED_SYMBOL:
            const oldRelated = state.affectedSymbol
            const newRelated = action.payload
            const mergeRelated = { ...oldRelated, ...newRelated }
            const newState = { ...state, affectedSymbol: mergeRelated }
            return newState
        default:
            return state
    }
}

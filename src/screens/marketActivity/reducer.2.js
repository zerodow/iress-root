import {
    requestData,
    getUrlExchange,
    getUrlMarketGroup,
    getUrlMarketWatchlist
} from '~/api';

export default {
    state: {
        exchanges: [],
        marketGroup: [],
        marketWatchlist: [],
        typeWatchlist: '',
        codeError: '',
        messageError: '',
        isLoadingSymbolInfo: true
    }, // initial state
    reducers: {
        // handle state changes with pure functions
        changeExchanges: (state, { exchanges }) => {
            state.exchanges = exchanges;
            return state;
        },
        changeGroups: (state, { groups }) => {
            state.marketGroup = groups;
            return state;
        },
        changeMarket: (state, { value = [], watchlist = [], code, message } = {}) => {
            state.marketWatchlist = value;
            state.typeWatchlist = watchlist;
            state.codeError = code;
            state.messageError = message
            return state;
        },
        changeMarketRealtime: (state, { value = [] } = {}) => {
            state.marketWatchlist = value;
            return state
        },
        changeLoadingSymbolInfo: (state, { isLoading = true } = {}) => {
            state.isLoadingSymbolInfo = isLoading;
            return state
        },
        resetDataMarket: (state) => {
            state.marketWatchlist = [];
            return state
        }
    },
    effects: (dispatch) => ({
        // handle state changes with impure functions.
        // use async/await for async actions
        getMarketExchange: async () => {
            const url = getUrlExchange();
            const res = await requestData(url);
            dispatch.marketActivity.changeExchanges({ exchanges: res });
        },
        getMarketGroup: async () => {
            const url = getUrlMarketGroup();
            const res = await requestData(url);
            dispatch.marketActivity.changeGroups({ groups: res });
        },
        getMarketWatchlist: async ({ exchange, marketGroup, watchlist }) => {
            // const url = getUrlMarketWatchlist('POINTS_DOWN', 'A', 'OIL');
            const url = getUrlMarketWatchlist(watchlist, exchange, marketGroup);
            const res = await requestData(url);
            console.info('Res Log', url, res)

            dispatch.marketActivity.changeMarket(res);
        }
    })
};

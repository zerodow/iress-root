
import initialState from '../../reducers/initialState';
const pageSizeFirst = 200;
const pageSizeNextPage = 30;
export const trade = (state = initialState.trade, action) => {
    switch (action.type) {
        case 'CLEAR_DATA':
            return {
                ...state,
                listData: []
            }
        case 'TRADE_USER_TYPE_RESPONSE':
            return {
                ...state,
                userType: action.payload
            }
        case 'USER_SYMBOL_REQUEST':
            return {
                ...state,
                loading: true
            };
        case 'TRADE_RELOAD_FORM':
            return {
                ...state,
                loading: true
            };
        case 'TRADE_WRITE_DATA_REQUEST':
            return {
                ...state,
                isLoading: true
            };
        case 'TRADE_WRITE_DATA_SUCCESS':
            return {
                ...state,
                isLoading: false
            };
        case 'TRADE_WRITE_DATA_ERROR':
            return {
                ...state,
                isLoading: false,
                error: action.payload
            };
        case 'CLOSE_TRADE':
            return {
                ...initialState.trade
            };
        case 'SET_UPDATED_HANDLER':
            return {
                ...state,
                isUpdated: true
            };
        case 'TRADE_NEXT_PAGE':
            let listFull = [...state.listDataFull];
            const lengthList = listFull.length;
            const currentIndex = state.symbolIndex;
            let nextIndex = currentIndex + pageSizeNextPage;
            if (currentIndex >= listFull.length) return state;

            if (nextIndex > listFull.length) nextIndex = listFull.length;
            return {
                ...state,
                listData: listFull.splice(0, nextIndex),
                isFullData: nextIndex >= lengthList,
                symbolIndex: nextIndex,
                isRefreshing: false
            };

        case 'USER_SYMBOL_RESPONSE':
            return {
                ...state,
                listData: action.payload,
                isLoading: false
            }
        case 'TRADE_GET_DATA_LIST_CODE_UPDATED_RESPONSE':
            return {
                ...state,
                listData: action.payload,
                isLoading: false
            }
        case 'USER_SYMBOL_ADDED':
            const dicSym = { ...state.dicUserSymbol };
            const val = action.payload.val();
            const key = action.payload.key;
            if (dicSym[key]) return state;
            dicSym[key] = val;
            return {
                ...state,
                listData: [...state.listData, { code: key }],
                dicUserSymbol: { ...dicSym }
            };

        case 'USER_SYMBOL_REMOVED':
            const dicSym1 = { ...state.dicUserSymbol };
            const key1 = action.payload.key;
            if (dicSym1[key1]) {
                delete dicSym1[key1];
            }
            const listDataTemp = state.listData.filter((e, i) => e.code !== key1);
            return {
                ...state,
                listData: [...listDataTemp],
                dicUserSymbol: { ...dicSym1 }
            };
        default:
            return state
    }
}

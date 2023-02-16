
import initialState from '../../reducers/initialState';
export const orderHistory = (state = initialState.orderHistory, action) => {
    // console.log('state: ', state);
    switch (action.type) {
        case 'ORDER_HISTORY_REQUEST':
            return {
                ...state,
                isLoading: true
            };
        case 'ORDER_HISTORY_RESPONSE':
            return {
                ...state,
                isLoading: false,
                listData: action.listData
            };
        default:
            return state
    }
}

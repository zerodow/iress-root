import initialState from '../../reducers/initialState';
export const cashAccountSummary = (state = initialState.cashAccountSummary, action) => {
    // console.log('state: ', state);
    switch (action.type) {
        case 'CASH_ACCOUNT_SUMMARY_LOAD_FORM_REQUEST':
            state.is_loading = true;
            return { ...state };
        case 'CASH_ACCOUNT_SUMMARY_LOAD_FORM_RESPONSE':
            state.is_loading = false;
            return {
                ...state,
                is_loading: false,
                total: action.payload.interest_earned_in_period,
                dataAccount: {
                    cashSOP: action.payload.balance_start_of_period,
                    cashEOP: action.payload.balance_end_of_period,
                    netTradeFlow: action.payload.net_trade_flows,
                    totalFees: action.payload.total_fees
                },
                dataDetail: []
            };
        default:
            return state
    }
}

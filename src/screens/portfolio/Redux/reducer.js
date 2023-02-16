import initialState from '~/reducers/initialState';

export const portfolio = (state = initialState.portfolio, action) => {
	switch (action.type) {
		case 'CHANGE_ACC_ACTIVE':
			return {
				...state,
				accActive: action.payload
			};
		case 'CHANGE_PL_STATE':
			return {
				...state,
				plState: action.payload
			};
		case 'RESET_PL_STATE':
			return {
				...state,
				plState: 0
			};
		case 'STORE_PORTFOLIO_TOTAL':
			const { currency: oldCurrency } = state.data || {};
			const { currency: newCurrency } = action.payload || {};

			let newData = undefined;
			if (action.payload) {
				newData = {
					...action.payload,
					currency: newCurrency || oldCurrency
				};
			}
			return {
				...state,
				data: newData,
				isLoading: false
			};
		case 'CHANGE_LOADING_STATE':
			return {
				...state,
				isLoading: action.payload
			};
		default:
			return state;
	}
};
export const reducerNews = (state = initialState.reducerNews, action) => {
	switch (action.type) {
		case 'CHANGE_IS_SELECTOR':
			return {
				...state,
				isSelector: action.payload
			};
		default:
			return state;
	}
};

import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';
import _ from 'lodash';
/* ------------- Types and Action Creators ------------- */
const PAGE = 10;

const { Types, Creators } = createActions({
	getNewData: ['symbol'],
	resetNewData: null,
	loadMoreNewData: null,
	resetPageSizeNews: null,
	getNewDataSuccess: ['listNews', 'isMoreNews', 'lastId', 'invaliedWL']
});
export const SearchNewTypes = Types;
export default Creators;
/* ------------- Initial State ------------- */
export const INITIAL_STATE = Immutable({
	pageSize: PAGE,
	listNews: [],
	isLoadingNews: true,
	isMoreNews: false,
	lastId: '',
	invaliedWL: 0
});
/* ------------- Reducers ------------- */
export const getNewData = (state) =>
	state.merge({
		// pageSize: PAGE,
		// listNews: [],
		isLoadingNews: true
		// isMoreNews: false
	});
export const loadMoreNewData = (state) =>
	state.merge({ pageSize: state.pageSize + PAGE });

export const getNewDataSuccess = (
	state,
	{ listNews, isMoreNews, lastId, invaliedWL }
) => {
	const newListNews = lastId ? state.listNews.concat(listNews) : listNews;
	console.log('NEWS DATA', newListNews);
	return state.merge({
		listNews: newListNews,
		isLoadingNews: false,
		isMoreNews,
		lastId,
		invaliedWL
	});
};

export const resetNewData = (state) =>
	state.merge({
		pageSize: PAGE,
		listNews: [],
		isMoreNews: false,
		lastId: ''
	});

export const resetPageSizeNews = (state) => state.merge({ pageSize: PAGE });

export const reducer = createReducer(INITIAL_STATE, {
	[Types.GET_NEW_DATA]: getNewData,
	[Types.RESET_NEW_DATA]: resetNewData,
	[Types.LOAD_MORE_NEW_DATA]: loadMoreNewData,
	[Types.RESET_PAGE_SIZE_NEWS]: resetPageSizeNews,
	[Types.GET_NEW_DATA_SUCCESS]: getNewDataSuccess
});

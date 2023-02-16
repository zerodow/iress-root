import React, { Component } from 'react';
import { View, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { FindWatchlist } from '~s/find_watchlist/find_watchlist.1';
import WatchListActions from '~s/watchlist/reducers';
import { func } from '~/storage';
import SCREEN from '~s/watchlist/screenEnum';
import * as Channel from '~/streaming/channel';
import * as Emitter from '~/lib/base/vietnam-emitter';

class Priceboard extends FindWatchlist {
	onEnd(index) {
		if (index === 0) {
			this.dic.preText = '';
			this.setState();
		}
	}

	componentDidMount() {
		super.componentDidMount();
		this.subSyncHistorySearchWL();
	}

	componentWillUnmount() {
		this.unsubSyncHistorySearchWL();
		super.componentWillUnmount();
	}

	syncHistorySearchWL = this.syncHistorySearchWL.bind(this);
	syncHistorySearchWL(listWL) {
		this.dic.listHistory = listWL || [];
		// Rerender nếu đang ở trạng thái history
		this.state.isHistory && this.setState();
	}

	subSyncHistorySearchWL = this.subSyncHistorySearchWL.bind(this);
	subSyncHistorySearchWL() {
		const channel = Channel.getChannelSyncHistorySearchWLPriceboard();
		Emitter.addListener(channel, this.dic.id, this.syncHistorySearchWL);
	}

	unsubSyncHistorySearchWL = this.unsubSyncHistorySearchWL.bind(this);
	unsubSyncHistorySearchWL() {
		Emitter.deleteByIdEvent(this.dic.id);
	}

	getAllPriceboard() {
		this.dic.listPersonalPriceboard = _.values(this.props.priceBoard);
	}

	getListPriceboardSearch() {
		if (!this.dic.textSearch) {
			return super.getListPriceboardSearchHistory();
		}
		if (this.dic.preText) {
			return this.listSearchResult;
		}
		const searchResult = [];
		this.dic.listPersonalPriceboard.map((item) => {
			item.watchlist_name &&
				item.watchlist_name
					.toUpperCase()
					.includes(this.dic.textSearch.toUpperCase()) &&
				searchResult.push(item);
		});
		return _.sortBy(searchResult, 'watchlist_name');
	}

	searchSymbol(txt = '') {
		if (!!this.dic.textSearch && !txt) {
			const size = _.size(this.listSearchResult);
			this.dic.preText = this.dic.textSearch;
			this.dic.textSearch = txt;
			this.setState({
				isHistory: true
			});
		} else if (this.dic.preText === txt) {
			this.dic.preText = '';
			this.setState(
				{
					isHistory: false
				},
				() => {
					this.dic.textSearch = txt;
					this.setState();
				}
			);
		} else {
			this.dic.preText = '';
			this.dic.textSearch = txt;
			this.setState({
				isHistory: false
			});
		}
	}

	onSelectPriceBoard({ watchlist, watchlist_name: WLName }) {
		super.storeHistorySearch({ watchlist, watchlist_name: WLName });
		func.setCurrentPriceboardId(watchlist);
		this.props.selectPriceBoard(watchlist);
		this.props.setScreenActive(SCREEN.WATCHLIST);
	}

	closeModal() {
		Keyboard.dismiss();
		this.props.setScreenActive(this.props.fromScreen, {
			fromScreen: SCREEN.SEARCH_PRIBOARD,
			typePriceBoard: this.props.typePriceBoard
		});
	}
}

function mapStateToProps(state) {
	const { screenParams, screenSelected, priceBoard } = state.watchlist3;
	const { fromScreen, typePriceBoard } = screenParams[screenSelected] || {};
	return {
		priceBoard,
		isConnected: state.app.isConnected,
		setting: state.setting,
		fromScreen,
		typePriceBoard
	};
}

const mapDispatchToProps = (dispatch) => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p)),
	selectPriceBoard: dispatch.priceBoard.selectPriceBoard
});

export default connect(mapStateToProps, mapDispatchToProps)(Priceboard);

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';

import searchDetailActions from '../search_detail.reducer';
import AppState from '~/lib/base/helper/appState2';
import SwiperActions from '~s/market_depth/swiper_10_trades.reducer';

export class AllData extends PureComponent {
	constructor(props) {
		super(props);
		this.props.navigator.addOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);

		this.appState = new AppState(() => {
			this.props.subRealtime();
			this.props.getAllDataSnapshot();
		});
	}

	componentWillReceiveProps = nextProps => {
		const {
			isConnected,
			symbol,
			subRealtime,
			getAllDataSnapshot,
			setSymbolSearchDetail
		} = nextProps;
		const changeNerworkState =
			this.props.isConnected === false && isConnected === true;
		const changeSymbol = this.props.symbol !== symbol;
		if (changeNerworkState || changeSymbol) {
			setSymbolSearchDetail(symbol || '');
			subRealtime();
			getAllDataSnapshot();
		}
	};

	componentDidMount = () => {
		const {
			symbol,
			subRealtime,
			getAllDataSnapshot,
			setSymbolSearchDetail,
			resetDataSwipe10Trade
		} = this.props;
		resetDataSwipe10Trade();
		setSymbolSearchDetail(symbol || '');
		subRealtime();
		getAllDataSnapshot();
	};

	onNavigatorEvent(event) {
		const {
			setSymbolSearchDetail,
			symbol,
			subRealtime,
			getAllDataSnapshot,
			unSubRealtime
		} = this.props;
		switch (event.id) {
			case 'search_refresh':
				subRealtime();
				getAllDataSnapshot();
				break;
			case 'willAppear':
				setSymbolSearchDetail(symbol || '');
				subRealtime();
				getAllDataSnapshot();
				break;
			case 'didAppear':
				this.appState.addListenerAppState();
				break;
			case 'didDisappear':
				unSubRealtime(symbol);
				this.appState.removeListenerAppState();
				break;
			default:
				break;
		}
	}

	componentWillReceiveProps = nextProps => {
		const { symbol, setSymbolSearchDetail } = nextProps;
		if (this.props.symbol !== symbol) {
			setSymbolSearchDetail(symbol || '');
		}
	};

	render() {
		return null
	}
}

const mapStateToProps = state => ({
	isConnected: state.app.isConnected
});

const mapDispatchToProps = dispatch => ({
	getAllDataSnapshot: (...p) =>
		dispatch(searchDetailActions.getAllDataSearchDetail(...p)),
	setSymbolSearchDetail: (...p) =>
		dispatch(searchDetailActions.setSymbolSearchDetail(...p)),
	subRealtime: (...p) =>
		dispatch(searchDetailActions.searchDetailSubRealtime(...p)),
	unSubRealtime: (...p) =>
		dispatch(searchDetailActions.searchDetailUnSubRealtime(...p)),
	resetDataSwipe10Trade: (...p) =>
		dispatch(SwiperActions.initSwiperTenTrade(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AllData);

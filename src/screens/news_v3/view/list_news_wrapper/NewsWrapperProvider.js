import React, { Component, PureComponent } from 'react';

import NewsWrapperContext from './NewsWrapperContext';
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js';
import StateApp from '~/lib/base/helper/appState';
import * as ManageAppState from '~/manage/manageAppState';
import ScreenId from '~/constants/screen_id';
import { func, dataStorage } from '~/storage';
import ENUM from '~/enum';
// Helper
import { animate } from '~/screens/news_v3/helper/animation.js';
import { uniq } from 'lodash';
// Controller
import * as ContentController from '~/screens/news_v3/controller/list_news_wrapper_controller/wrapper_content_controller.js';
import * as HeaderController from '~/screens/news_v3/controller/list_news_wrapper_controller/wrapper_header_controller.js';
// Redux
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as NewsAction from '~/screens/news_v3/redux/news.actions.js';
import * as Controller from '~/memory/controller';
// Until
import { getSymbolInfoFromListSymbol } from '~/lib/base/functionUtil';
import * as UserPriceSource from '~/userPriceSource';
import HandleDataRealTime from '~/screens/news_v3/view/list_news_wrapper/HandleRealtimeNewsComp.js';
import * as ContentModel from '~/screens/news_v3/model/content.model.js';
const { STREAMING_MARKET_TYPE, PANEL_POSITION } = ENUM;
const getRandomNumber = () =>
	Math.floor(Math.random() * 2) === 1
		? -1 * Math.random() * 200
		: Math.random() * 200;
function getRandomData() {
	return {
		'ASX#THC': {
			symbol: 'THC',
			changePercent: getRandomNumber(),
			changePoint: getRandomNumber(),
			exchange: 'ASX'
		},
		'ASX#BHP': {
			symbol: 'BHP',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#MQG': {
			symbol: 'MQG',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#AAA': {
			symbol: 'AAA',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#NAB': {
			symbol: 'NAB',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#A2M': {
			symbol: 'A2M',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#SIY': {
			symbol: 'SIY',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#SCG': {
			symbol: 'SCG',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#RIO': {
			symbol: 'RIO',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#CBA': {
			symbol: 'CBA',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		},
		'ASX#ANZ': {
			symbol: 'ANZ',
			changePercent: getRandomNumber(),
			changePoint: 100,
			exchange: 'ASX'
		}
	};
}
export function getListSymbolObj(listSymbol) {
	let result = [];
	for (let index = 0; index < listSymbol.length; index++) {
		const obj = listSymbol[index].split('#');
		const symbol = obj[1];
		const exchange = obj[0];
		result.push({
			symbol,
			exchange: exchange
		});
	}
	return result;
}
export function mapObjectSymboInfo(listSymbol, relatedExchanges) {
	listSymbol = listSymbol.split(',');
	listExchange = relatedExchanges.split(',');
	return listSymbol.map((el, key) => {
		return `${listExchange[key]}#${el}`;
	});
}
export function getListSymbolAndSymbolWithExchange(data) {
	let listSymbol = '';
	let listSymbolWithExchange = [];
	for (let index = 0; index < data.length; index++) {
		const element = data[index];
		const listRelatedSymbol = element.related_symbols || '';
		const listRelatedExchanges = element.related_exchanges || '';
		listSymbolWithExchange = listSymbolWithExchange.concat(
			mapObjectSymboInfo(listRelatedSymbol, listRelatedExchanges)
		);
		if (listSymbol === '') {
			listSymbol = listSymbol + listRelatedSymbol;
		} else {
			listSymbol = listSymbol + ',' + listRelatedSymbol;
		}
	}
	return {
		listSymbol: uniq(listSymbol.split(',')),
		listSymbolWithExchange: uniq(listSymbolWithExchange)
	};
}
export function getListSymbolUniq(data) {
	let listSymbol = [];
	for (let index = 0; index < data.length; index++) {
		const element = data[index];
		const listRelatedSymbol = element.related_symbols || [];
		listSymbol = listSymbol.concat(listRelatedSymbol);
	}
	return uniq(listSymbol);
}
function getObjectDataSnapShot(data) {
	let result = {};
	for (let index = 0; index < data.length; index++) {
		const element = data[index];
		if (element.price) {
			const {
				symbol,
				exchange,
				price: {
					change_percent: changePercent,
					change_point: changePoint
				}
			} = element;
			result[`${exchange}#${symbol}`] = {
				symbol: symbol,
				changePercent: changePercent,
				changePoint: changePoint,
				exchange: exchange
			};
		}
	}
	return result;
}
function getSnapShot(listSymbol) {
	// const listSymbolObj = getListSymbolObj(listSymbol)
	// console.log('DCM getSnapShot listSymbolObj', listSymbolObj)
	return new Promise((resolve, reject) => {
		ContentController.getIressFeedSnapshot(listSymbol)
			.then((data) => {
				console.log('DCM getSnapShot getIressFeedSnapshot', data);
				ContentController.addSymbolInfoToDic(data);
				resolve(getObjectDataSnapShot(data));
			})
			.catch((e) => {
				reject(e);
			});
	});
}
function formatDataPreSaveToRedux(data) {
	let result = {};
	for (let index = 0; index < data.length; index++) {
		const element = data[index];
		const tmp = {
			element: data[index],
			exchange: element['exchange'],
			symbol: element['symbol'],
			changePercent: element['change_percent'],
			changePoint: element['change_point']
		};
		const key = `${tmp.exchange}#${tmp.symbol}`;
		result[key] = tmp;
	}
	return result;
}
export class NewsWrapperProvider extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			listData: [],
			isLoading: true,
			isLoadingAfter: false, // Bien loading su dung cho nhung lan sau,
			isLoadingSymbolInfo: true
		};
		this.listSymbolWithExchange = [];
		this.listSymbol = [];
		this.preListSymbol = [];

		this.lastId = null;
		ManageAppState.registerAppStateChangeHandle(
			ScreenId.NEWS,
			this.activeApp
		);
		this.duration = 1000;
	}
	componentWillReceiveProps(nextProps) {
		if (
			nextProps.isConnected &&
			nextProps.isConnected !== this.props.isConnected
		) {
			this.activeApp();
		}
	}
	componentWillUnmount() {
		console.info('componentWillUnmount');
	}
	activeApp = this.activeApp.bind(this);
	activeApp() {
		this.search({ notSetLoading: true, isApplyLoadingAfter: true });
	}
	componentDidMount() {
		func.setCurrentScreenId(ScreenId.NEWS);
		if (!Controller.getLoginStatus()) return;
		this.search({ notSetLoading: true });
		// HeaderController.getDataVendor() // Get tu luc login
		// HeaderController.getDataCategory() // Get tu luc login
		this.randomAffectedSymbol(); // 5p recall
	}
	randomAffectedSymbol = () => {
		this.interval = setInterval(async () => {
			try {
				this.preListSymbol = [];
				let data = await getSnapShot(this.listSymbol);
				this.props.newsActions.updateAffectedSymbol &&
					this.props.newsActions.updateAffectedSymbol(data);
			} catch (error) {}
		}, 1000 * 5 * 60);
	};
	componentWillUnmount() {
		this.interval && clearInterval(this.interval);
		HeaderModel.resetTextFilter();
		ManageAppState.unRegisterAppState(ScreenId.NEWS);
	}
	setLoading = (isLoading) => {
		this.setState({
			isLoading
		});
	};
	setLoadingSymbolInfo = (isLoading) => {
		this.setState({
			isLoadingSymbolInfo: isLoading
		});
	};
	setAfterLoading = (isLoadingAfter) => {
		this.setState({
			isLoadingAfter
		});
	};
	callBackGetSymbolInfo = async (listSymbol) => {
		// this.setLoadingSymbolInfo(false)
		try {
			let data = await getSnapShot(listSymbol);
			this.props.newsActions.updateAffectedSymbol &&
				this.props.newsActions.updateAffectedSymbol(data);
			ContentModel.updateListPreSymbol({
				symbols: this.listSymbol
			});
			this.setLoadingSymbolInfo(false);
		} catch (error) {
			setTimeout(() => {
				this.setLoadingSymbolInfo(false);
			}, 200);
		}
	};
	setPreSymbolByObject = (listSymbol) => {
		let tmp = {};
		for (let index = 0; index < listSymbol.length; index++) {
			const element = listSymbol[index];
			tmp[element] = element;
		}
		return tmp;
	};
	setInfoSymbol = (listSymbol) => {
		this.preListSymbol = this.setPreSymbolByObject(this.listSymbol);
		this.listSymbol = uniq(this.listSymbol.concat(listSymbol));
	};
	getListSymbolInfo = (data) => {
		const listSymbol = getListSymbolUniq(data);
		this.setInfoSymbol(listSymbol);
		this.callBackGetSymbolInfo(this.listSymbol);
	};
	search = async (params = {}) => {
		try {
			const { showError, hideErrorFn } = this.props;
			const { notSetLoading, isApplyLoadingAfter } = params;
			if (!notSetLoading) {
				this.setLoading(true);
				this.setLoadingSymbolInfo(true);
			}
			isApplyLoadingAfter && this.setAfterLoading(true);
			const res = await ContentController.search(showError, hideErrorFn);
			const { data, last_id: lastId } = res;
			this.lastId = lastId;
			this.getListSymbolInfo(data);
			// animate()
			this.setState({
				listData: data,
				isLoading: false,
				isLoadingAfter: false
			});
		} catch (error) {
			this.setState({
				listData: [],
				isLoading: false,
				isLoadingAfter: false
			});
		}
	};
	updateData = this.updateData.bind(this);
	updateData(listData, cb) {
		this.getListSymbolInfo(listData);
		this.setState(
			{
				listData
			},
			() => cb && cb()
		);
	}
	loadMore = this.loadMore.bind(this);
	loadMore(successCb, errorCb) {
		try {
			ContentController.loadMore({
				pageSize: 20,
				lastId: this.lastId
			})
				.then((res) => {
					const {
						data,
						last_id: lastId,
						status_code: statusCode
					} = res;
					this.lastId = lastId;
					successCb && successCb(data, statusCode);
					this.setLoadingSymbolInfo(true);
					this.getListSymbolInfo(data);
				})
				.catch((e) => {
					errorCb && errorCb([]);
				});
		} catch (error) {
			errorCb && errorCb([]);
		}
	}
	render() {
		return (
			<NewsWrapperContext.Provider
				value={{
					channelShowMessage: this.props.channelShowMessage,
					isLoading: this.state.isLoading,
					listData: this.state.listData,
					preListSymbol: this.preListSymbol,
					search: this.search,
					loadMore: this.loadMore,
					duration: this.duration,
					isLoadingAfter: this.state.isLoadingAfter,
					isLoadingSymbolInfo: this.state.isLoadingSymbolInfo
				}}
			>
				<HandleDataRealTime
					navigator={this.props.navigator}
					listData={this.state.listData}
					updateData={this.updateData}
				/>
				{this.props.children}
			</NewsWrapperContext.Provider>
		);
	}
}
function mapStateToProps(state) {
	return {
		isConnected: state.app.isConnected
	};
}
const mapDispatchToProps = (dispatch) => {
	return {
		newsActions: bindActionCreators(NewsAction, dispatch)
	};
};
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(NewsWrapperProvider);

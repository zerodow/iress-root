import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import VietNamQueue from '@lib/vietnam-queue';
import * as NewsBusiness from '~/streaming/news';
import * as StreamingBusiness from '~/streaming/streaming_business';
import * as Emitter from '@lib/vietnam-emitter';
import Enum from '~/enum';
import * as PureFunc from '~/utils/pure_func';
import {
	checkChangeVendor,
	setChangeVendor
} from '~s/news_v3/model/header_list_news/header.model';
const { TAB_NEWS } = Enum;
const AllNewsRealtimeQueue = new VietNamQueue();
export default class HandleRealtimeNewsComp extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {};
		this.dic = {
			listNewsRealtime: []
		};
	}

	// onNavigatorEvent = this.onNavigatorEvent.bind(this);
	// onNavigatorEvent(event) {
	// 	switch (event.id) {
	// 		case 'willAppear':
	// 			break;
	// 		case 'didAppear':
	// 			// setActiveScreen(ACTIVE_STREAMING.NEWS)
	// 			// doActiveScreen([ACTIVE_STREAMING.NEWS])
	// 			break;
	// 		case 'didDisappear':
	// 			// this.unSubRealtimeNews();
	// 			// setInactiveScreen(ACTIVE_STREAMING.NEWS)
	// 			// doInactiveScreen([ACTIVE_STREAMING.NEWS])
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// }

	componentDidMount() {
		// this.subNewsRealtime();
		// this.updateNewStreaming();
		// this._navigator = this.props.navigator.addOnNavigatorEvent(
		// 	this.onNavigatorEvent
		// );
	}

	async componentWillReceiveProps() {
		const isChangeVendor = checkChangeVendor();
		if (isChangeVendor) {
			setChangeVendor(false);
			// await this.unSubRealtimeNews();
			// this.subNewsRealtime();
		}
	}

	clearStoreDataRealtime = this.clearStoreDataRealtime.bind(this);
	clearStoreDataRealtime() {
		this.dic.listNewsRealtime.length = 0;
	}

	storeDataRealtime = this.storeDataRealtime.bind(this);
	storeDataRealtime({ data, type }) {
		try {
			const newsLength = this.dic.listNewsRealtime.length;
			if (newsLength === 0) {
				this.dic.listNewsRealtime.push(data);
			} else {
				// Update
				for (let i = 0; i < newsLength; i++) {
					const realtimeNewID = data.news_id;
					const newID = this.dic.listNewsRealtime[i].news_id;
					if (newID === realtimeNewID) {
						// Merge object
						this.dic.listNewsRealtime[i] = data;
						console.log(
							'DCM REALTIME NEWS UPDATE',
							this.dic.listNewsRealtime
						);
						return;
					}
				}
				// ADD
				console.log('DCM REALTIME NEWS ADD', this.dic.listNewsRealtime);
				this.dic.listNewsRealtime.unshift(data);
			}
		} catch (error) {}
	}
	mergeDataRealtime = this.mergeDataRealtime.bind(this);
	mergeDataRealtime({ type, resolve }) {
		// Ghép data news realtime vào data snapshot(redux)
		// this.props.actions.mergeNewsRealtime(this.dic.listNewsRealtime, 'TAB_NEWS.RELATED')
		// Kiem tra xem co accept data realtime ko
		// Lam sau
		let currentData = PureFunc.clone(this.props.listData);
		const newData = this.dic.listNewsRealtime.concat(currentData);
		currentData = newData;
		console.log('DCM REALTIME NEW DATA', currentData);
		// resolve && resolve()
		this.props.updateData(currentData, () => {
			this.dic.listNewsRealtime.length = 0;
			resolve && resolve();
		});
	}
	queueALlNewsRealtime = this.queueALlNewsRealtime.bind(this);
	queueALlNewsRealtime({ data, type }) {
		AllNewsRealtimeQueue.push(
			() =>
				new Promise((resolve) => {
					this.storeDataRealtime({ data, type });
					this.mergeDataRealtime({ type, resolve });
				})
		);
	}

	updateNewStreaming = this.updateNewStreaming.bind(this);
	updateNewStreaming() {
		const event = StreamingBusiness.getChannelNews(TAB_NEWS.ALL);
		this.idFormAll = Emitter.addListener(event, null, (data) => {
			console.log('DCM REALTIME DATA ALL NEWS REALTIME', data);
			this.queueALlNewsRealtime({ data, type: TAB_NEWS.ALL });
		});
	}
	// subNewsRealtime = this.subNewsRealtime.bind(this);
	// subNewsRealtime() {
	// 	NewsBusiness.sub(TAB_NEWS.ALL, [], () => {
	// 		console.log('DCM subAllNewsRealtime SUCCESS');
	// 	});
	// }

	// unSubRealtimeNews = this.unSubRealtimeNews.bind(this);
	// unSubRealtimeNews() {
	// 	return new Promise((resolve) => {
	// 		// Unsub news realtime
	// 		NewsBusiness.unSubNewByScreen('news', TAB_NEWS.ALL, resolve);
	// 		// Unsub update realtime
	// 		Emitter.deleteByIdEvent(this.idFormAll);
	// 	});
	// }
	componentWillUnmount() {
		// this.unSubRealtimeNews();
		// this._navigator && this._navigator();
	}
	render() {
		return null;
	}
}

import React, { Component } from 'react';
import {
	FlatList,
	Animated,
	View,
	Easing,
	ScrollView,
	TouchableWithoutFeedback
} from 'react-native';
import _ from 'lodash';
import * as Emitter from '@lib/vietnam-emitter'

import { func } from '~/storage';
import * as Channel from '~/streaming/channel';
const SIZE_SLICE = 3;
const DURATION = 4000;

const AniFlatlist = Animated.createAnimatedComponent(FlatList);

export default class InfiniteScroll extends Component {
	constructor(props) {
		super(props);
		this._listX = new Animated.Value(0);
		this._scrollX = new Animated.Value(0);

		this.state = { data: [], contentWidth: 0 };

		this.mapToCurrentData(this.props.data);
		this.dicMeasure = {};
		this.dicItemSize = {};
		this.running = false
	}

	componentDidMount() {
		// this.snapToIndex(SIZE_SLICE);
		this.addScrollListener();
		this.onRunningListener()
	}

	componentWillReceiveProps(nextProps) {
		this.mapToCurrentData(nextProps.data);
	}

	// componentDidUpdate(prevProps, prevState) {
	// 	if (_.isEmpty(prevProps.data) && !_.isEmpty(this.props.data)) {
	// 		setTimeout(() => {
	// 			this.snapToTop();
	// 		}, 2000);
	// 	}
	// }

	componentWillUnmount() {
		this.unSubAll()
		if (this._scrollAnimatedValueAttachment) {
			this._scrollAnimatedValueAttachment.detach();
		}
	}
	unSubAll = () => {
		this.idListenerIsAutoScroll && Emitter.deleteByIdEvent(this.idListenerIsAutoScroll);
	}
	autoScroll(delay) {
		if (_.size(this.state.data) <= SIZE_SLICE) return;

		this._listX.stopAnimation();

		setTimeout(() => {
			const ani = this.createAniEnd();
			if (!ani) {
				setTimeout(() => {
					const newAni = this.createAniEnd();
					if (!newAni) return;
					newAni.start(this.loop);
				}, 3000);
			} else ani.start(this.loop);
		}, delay);
	}

	getEndItem() {
		const size = _.size(this.state.data);
		return this.dicItemSize[size - SIZE_SLICE] || {};
	}

	createAniEnd() {
		const { width, px } = this.getEndItem();
		if (!width) return;

		const posEnd = px;
		const size = _.size(this.state.data);

		const duration = ((posEnd + this._listX._value) / px) * DURATION * size;
		return Animated.timing(this._listX, {
			duration,
			toValue: -posEnd,
			easing: Easing.linear,
			useNativeDriver: true
		});
	}

	loop = this.loop.bind(this);
	loop() {
		const { width, px } = this.getEndItem();
		if (!width || this._listX._value !== -px) return;
		this.snapToTop();

		Animated.loop(this.createAniEnd()).start();
	}

	disAutoScroll = this.disAutoScroll.bind(this)
	disAutoScroll() {
		this._listX.stopAnimation();
	}

	snapToTop = this.snapToTop.bind(this);
	snapToTop(offset = 0) {
		this._listX.setValue(offset);
	}

	snapToEnd(offset) {
		const size = _.size(this.state.data);
		this.snapToIndex(size - SIZE_SLICE, false, offset);
	}

	snapToIndex(index, isEnd, offset = 0) {
		const { width, px } = this.dicItemSize[index] || {};
		if (!width) return;
		if (isEnd) {
			this._listX.setValue(-width - px - offset);
		} else {
			this._listX.setValue(-px - offset);
		}
	}

	mapToCurrentData(data) {
		const size = _.size(data);

		if (size <= SIZE_SLICE) {
			this.state.data = data;
			return;
		}

		let currentData = data;

		const firstArr = _.take(currentData, SIZE_SLICE);
		// const lastArr = _.takeRight(currentData, SIZE_SLICE);
		const newData = _.concat(currentData, firstArr);

		this.state.data = newData;

		// reset
		this.dicItemSize = {};
		this.dicMeasure = {};
		this.isFirstSnap = false;
	}

	onMeasure(key, sef) {
		let curMeasureFunc;
		if (sef) {
			this.dicMeasure[key] = sef;
			curMeasureFunc = sef;
		} else {
			curMeasureFunc = this.dicMeasure[key];
		}
		curMeasureFunc &&
			curMeasureFunc.measure && urMeasureFunc.measure((ox, oy, width, height, px, py) => {
				this.dicItemSize[key] = { width, px };
			});
	}

	renderItem = this.renderItem.bind(this);
	renderItem({ item, index }) {
		const setRef = sef => this.onMeasure(index, sef);
		return (
			<View ref={setRef} collapsable={false}>
				{this.props.renderItem({ item, index })}
			</View>
		);
	}

	actionScroll = this.actionScroll.bind(this)
	actionScroll() {
		console.log('onContentLayout', _.size(this.state.data), this.state.data)
		const listSize = _.size(this.state.data)
		if (listSize <= 4) {
			console.log('SCROLL DISABLE')
			this.disAutoScroll()
			this.snapToTop()
		} else {
			console.log('SCROLL AUTO')
			// if (this.running) {
			this.autoScroll(1000)
			// }
		}
	}
	onRunningListener = () => {
		this.idListenerIsAutoScroll = Emitter.addListener(Channel.getChannelInfiniteScroll(), this.idListenerIsAutoScroll, (status) => {
			if (status) {
				this.running = true
				this.actionScroll()
			} else {
				this.running = false
				this.disAutoScroll()
			}
		})
	}

	onContentLayout = this.onContentLayout.bind(this);
	onContentLayout(e) {
		const contentWidth = e.nativeEvent.layout.width;
		this.contentLayoutTimeout && clearTimeout(this.contentLayoutTimeout);
		this.contentLayoutTimeout = setTimeout(() => {
			if (func.getIsShowDetailWatchList()) {
				this.running = true
				this.setState({
					contentWidth
				}, this.actionScroll)
			} else {
				this.setState({
					contentWidth
				})
			}
			this.contentLayoutTimeout = null;
		}, 500);
	}

	addScrollListener() {
		try {
			this._scroll &&
				this._scroll.scrollTo({
					x: -this._listX._value,
					animated: false
				});
		} catch (error) { }

		this._listX.addListener(({ value }) => {
			try {
				this._scroll &&
					this._scroll.scrollTo({ x: -value, animated: false });
			} catch (error) { }
		});
	}

	removeScrollListener() {
		this._listX.removeAllListeners();
	}

	addListListener() {
		this._scrollX.addListener(({ value }) => {
			this._listX.setValue(-value);
		});
	}

	removeListListener() {
		this._scrollX.removeAllListeners();
	}

	createInfinit() {
		if (this._scrollX._value < 5) {
			this.snapToEnd(this._scrollX._value);
		} else {
			const { width, px } = this.getEndItem();
			if (!width || !px) return;

			if (px - this._scrollX._value < 5) {
				this.snapToTop(px - this._scrollX._value);
			}
		}
	}

	onEndResponder(withoutCreate) {
		this.removeListListener();
		this.addScrollListener();
		this.actionScroll();
		!withoutCreate &&
			setTimeout(() => {
				this.createInfinit();
			}, 500);
	}

	onMomentumScrollBegin = this.onMomentumScrollBegin.bind(this);
	onMomentumScrollBegin() {
		this.momentumScrollBegin = true;
	}

	onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
	onMomentumScrollEnd() {
		this.touchStart = false;
		this.onEndResponder();
	}

	onTouchStart = this.onTouchStart.bind(this);
	onTouchStart() {
		this.removeScrollListener();
		this.addListListener();
		this.disAutoScroll();
		this.momentumScrollBegin = false;
	}

	onTouchEnd = this.onTouchEnd.bind(this);
	onTouchEnd(withoutCreate) {
		setTimeout(() => {
			// neu co velocity return
			if (this.momentumScrollBegin) return;
			this.onEndResponder(withoutCreate);
		}, 300);
	}

	setScrollRef = this.setScrollRef.bind(this);
	setScrollRef(sef) {
		if (this._scrollAnimatedValueAttachment) {
			this._scrollAnimatedValueAttachment.detach();
		}

		if (sef) {
			this._scroll = sef;
			this._scrollAnimatedValueAttachment = Animated.attachNativeEvent(
				sef._scrollViewRef,
				'onScroll',
				[
					{
						nativeEvent: {
							contentOffset: { x: this._scrollX }
						}
					}
				]
			);

			// this.onTouchStart();
			// this._scroll.scrollTo({ x: 1, animated: false });
			// this.onEndResponder(true);
		}
	}

	setKeyExtractor = this.setKeyExtractor.bind(this)
	setKeyExtractor(item, index) {
		return item + index
	}

	render() {
		const onRowPress = e => {
			const { locationX } = e.nativeEvent;
			_.forEach(this.dicItemSize, ({ width, px }, index) => {
				if (locationX < px + width && locationX > px) {
					this.props.onRowPress &&
						this.props.onRowPress({
							item: this.state.data[index] || {},
							index
						});
				}
			});

			this.onTouchEnd(true);
		};
		return (
			<View>
				<ScrollView
					showsHorizontalScrollIndicator={false}
					horizontal
					scrollEnabled={false}>
					<AniFlatlist
						style={{ transform: [{ translateX: this._listX }] }}
						horizontal
						scrollEnabled={false}
						renderItem={this.renderItem}
						keyExtractor={this.setKeyExtractor}
						data={this.state.data}
						extraData={this.props.extraData}
						onLayout={this.onContentLayout}
					/>
				</ScrollView>

				<ScrollView
					showsHorizontalScrollIndicator={false}
					ref={this.setScrollRef}
					onMomentumScrollEnd={this.onMomentumScrollEnd}
					onMomentumScrollBegin={this.onMomentumScrollBegin}
					onTouchStart={this.onTouchStart}
					onScrollEndDrag={this.onTouchEnd}
					horizontal
					style={{
						position: 'absolute',
						width: '100%',
						height: '100%'
					}}
					scrollEventThrottle={1}
				>
					<TouchableWithoutFeedback
						onPress={onRowPress}
					// onTouchStart={onRowPress}
					>
						<View
							style={{
								width: this.state.contentWidth,
								height: '100%'
							}}
						/>
					</TouchableWithoutFeedback>
				</ScrollView>
			</View>
		);
	}
}

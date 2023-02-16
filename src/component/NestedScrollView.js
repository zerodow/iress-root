import React, { PureComponent } from 'react';
import {
	PanResponder,
	Animated,
	Dimensions,
	View,
	Platform
} from 'react-native';
import _ from 'lodash';
import Enum from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import ExtraDimensions from 'react-native-extra-dimensions-android';
const { width: widthDevice, height: heightDevice } = Dimensions.get('window');
const { PANEL_POSITION } = Enum;
export default class NestedScrollView extends PureComponent {
	constructor(props) {
		super(props);

		this.snapContainerTopTop = this.snapContainerTopTop.bind(this);
		this.reset = this.reset.bind(this);
		this.hideContainer = this.hideContainer.bind(this);

		this.calHeightScrollView = this.calHeightScrollView.bind(this);
		this.calHeightContainer = this.calHeightContainer.bind(this);
		this.isExpandBottom = this.isExpandBottom.bind(this);

		this.heightContainer = 0;
		this.maxHeightContainer = 0;
		this.heightScroll = 0;

		this.startPointScr = null;
		this.init();

		// pain point (height)
		this.calPanPoint = () => this.maxHeightContainer / 2;

		this.scrollValue = new Animated.Value(0);
		this.createListenerForScrollValue();

		this.scrollContainerValue = new Animated.Value(heightDevice);
		this.createListenerForTransValue();

		// chan tren TranslateY
		this.translateYAni = this.scrollContainerValue.interpolate({
			inputRange: [-1, 0, 1],
			outputRange: [0, 0, 1]
		});

		this._panResponder = PanResponder.create({
			onStartShouldSetPanResponderCapture: (e, gestureState) => {
				// luu lai vi tri hien tai
				this.scrollValue.extractOffset();
				this.scrollContainerValue.extractOffset();

				const curVelocityFlag = this.handlingVelocity;

				// dung hanh dong truoc (ghim scroll)
				this.scrollValue.stopAnimation();
				return curVelocityFlag;
			},
			onMoveShouldSetPanResponder: (e, gestureState) => {
				// check xem co phai hanh dong scroll
				const { dx, dy } = gestureState;
				if (Math.abs(dy) < Math.abs(dx)) {
					console.log('Should FALSE')
					return false;
				}
				console.log('Should TRUE')
				return gestureState.dy > 6 || gestureState.dy < -6;
			},

			onPanResponderTerminationRequest: () => false,
			onPanResponderMove: (evt, gestureState) => {
				const newY = gestureState.dy;
				this.handleNewPoint(newY);
			},

			onPanResponderRelease: (evt, gestureState) => {
				this.resetPoint();

				if (this.isContainerOnTop) {
					const velocity = -gestureState.vy;
					this.handleScrollValueVelocity(velocity);
					console.log('handleNewPoint RELEASE SCROLL');
					// this.handleEndOfScroll();
				}
				// container khong tren top thi snap
				if (!this.isContainerOnTop && !this.isContainerOnPanPoint) {
					this.calPanPointOfContainer();
					console.log('handleNewPoint RELEASE CONTAINER');
				}
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.isShow !== nextProps.isShow) {
			if (nextProps.isShow) {
				// this.calHeightScrollView();
				this.snapContainerTopTop();
			} else {
				this.hideContainer();
			}
		}
	}

	componentDidMount() {
		if (this.props.setRef) {
			this.props.setRef(this);
		}
		if (this.props.isShow) {
			this.snapContainerTopTop();
		}
	}

	isExpandBottom() {
		this.isExpand = true;
	}

	componentWillUnmount() {
		this.scrollValue && this.scrollValue.removeAllListeners();
		this.scrollContainerValue.removeAllListeners();
	}

	mapToScrVarProp(value) {
		const { scrollValue } = this.props;
		if (
			scrollValue &&
			scrollValue.setValue &&
			typeof scrollValue.setValue === 'function'
		) {
			// new la top,end lam no scroll kho dan
			let curValue = value;
			if ((this.isEnd || this.isTop) && !this.handlingVelocity) {
				if (!this.startPointScr) {
					this.startPointScr = curValue;
				}

				const diff = curValue - this.startPointScr;
				let flag = 1;
				if (diff < 0) flag = -1;
				// + 1 de newDiff >=0
				const newDiff = Math.log(Math.abs(diff) + 1) / Math.log(1.1);
				curValue = Math.min(
					curValue,
					flag * newDiff + this.startPointScr
				);
			} else {
				this.startPointScr = null;
			}
			scrollValue.setValue(curValue);
		}
	}

	mapToScrContainerVarProp(value) {
		const { scrollContainerValue } = this.props;
		if (
			scrollContainerValue &&
			scrollContainerValue.setValue &&
			typeof scrollContainerValue.setValue === 'function'
		) {
			if (value >= 0) scrollContainerValue.setValue(value);
		}
	}

	init() {
		this.resetPoint();
		this.isTop = true;
		this.isEnd = false;
		this.isContainerOnTop = true;
		this.isContainerOnPanPoint = false;
		this.position = PANEL_POSITION.BOTTOM;
	}

	updatePosition(position) {
		this.position = position;
	}

	resetPoint() {
		this.startPointTranY = null;
		this.startPointScrValue = null;
		this.startPointUpDown = null;
	}

	calPanPointOfContainer() {
		const panPoint = this.calPanPoint();
		const { _offset, _value } = this.scrollContainerValue;
		const containerPos = _offset + _value;
		this.scrollContainerValue.flattenOffset();
		if (containerPos > (panPoint / 2 - 86)) {
			this.moveContainer(panPoint - 86);
			this.updatePosition(PANEL_POSITION.MIDDLE);
			// callback after go to middle
			this.props.goMiddleCallback && this.props.goMiddleCallback();
		} else {
			this.snapContainerTopTop();
			this.props.goTopCallback && this.props.goTopCallback();
		}
	}

	createListenerForScrollValue() {
		this.scrollValue.addListener(({ value }) => {
			// chi value nen nho flattenOffset truoc do  (hien la ben sau khi release)
			this.isTop = value < 1;
			if (this.heightScroll === 0 || this.heightContainer === 0) {
				this.isEnd = false;
			} else {
				this.isEnd = value > this.heightScroll - this.heightContainer;
			}
			// len den top hoac end thi dung velocity => snap (trong on end animation)
			if ((this.isTop || this.isEnd) && this.handlingVelocity) {
				this.handlingVelocity = false;
				// setTimeout(() => {
				this.scrollValue.stopAnimation();
				// }, 100);
			}

			this.mapToScrVarProp(value);
		});
	}

	createListenerForTransValue() {
		this.scrollContainerValue.addListener(({ value }) => {
			this.isContainerOnTop = value < 1;

			if (this.maxHeightContainer !== 0) {
				const panPoint = this.calPanPoint();
				this.isContainerOnPanPoint = Math.abs(value - panPoint) < 1;
			}
			this.mapToScrContainerVarProp(value);
		});
	}

	handleScrollValueVelocity(velocity) {
		this.handlingVelocity = true;
		Animated.decay(this.scrollValue, {
			velocity,
			deceleration: 0.994
		}).start(() => this.handleEndOfScroll());
	}

	handleEndOfScroll() {
		{
			const { _value, _offset } = this.scrollValue;
			const curContainerAniValue = _value + _offset;
			const maxContainerAniValue =
				this.heightScroll - this.heightContainer;

			if (curContainerAniValue < 0) {
				this.scrollValue.flattenOffset();
				this.snapScrollViewToTop(() => (this.handlingVelocity = false));
				console.log('handleNewPoint RELEASE SCROLL TOP');
				return;
			}

			if (
				(curContainerAniValue > maxContainerAniValue &&
					this.heightScroll !== 0 &&
					this.heightContainer !== 0) ||
				this.isExpand
			) {
				this.isExpand && (this.isExpand = false);
				this.scrollValue.flattenOffset();
				if (this.heightScroll > this.heightContainer) {
					return this.snapScrollViewToEnd(
						() => (this.handlingVelocity = false)
					);
				}
				return this.snapScrollViewToTop(
					() => (this.handlingVelocity = false)
				);
				// console.log('handleNewPoint RELEASE SCROLL END')
				// console.log('handleNewPoint RELEASE SCROLL END this.heightScroll', this.heightScroll)
				// console.log('handleNewPoint RELEASE SCROLL END this.heightContainer', this.heightContainer)
				// console.log('handleNewPoint RELEASE SCROLL END _value', _value)
				// console.log('handleNewPoint RELEASE SCROLL END _offset', _offset)
				// console.log('handleNewPoint RELEASE SCROLL END curContainerAniValue', curContainerAniValue)
				// console.log('handleNewPoint RELEASE SCROLL END maxContainerAniValue', maxContainerAniValue)
			}
			this.handlingVelocity = false;
		}
	}

	handleNewPoint(newY) {
		const curValue = newY;

		// check scroll down
		let isScrollDown = false;
		if (this.startPointUpDown) {
			isScrollDown = curValue - this.startPointUpDown > 0;
		}
		this.startPointUpDown = curValue;

		// neu container khong tren top thi luon keo no hoac
		// scrollview len toi top + dang keo xuong
		if (!this.isContainerOnTop || (this.isTop && isScrollDown > 0)) {
			if (!this.startPointTranY) {
				this.startPointTranY = curValue;

				// ghim lai scrollValue
				this.startPointScrValue = null;
				this.scrollValue.extractOffset();
			}
			const valueSet = curValue - this.startPointTranY;
			this.scrollContainerValue.setValue(valueSet);
			console.log('handleNewPoint container', this.scrollValue._value);
		} else {
			if (!this.startPointScrValue) {
				this.startPointScrValue = curValue;

				// ghim lai TransY
				this.startPointTranY = null;
				this.scrollContainerValue.extractOffset();
			}
			const valueSet = curValue - this.startPointScrValue;

			this.scrollValue.setValue(-valueSet);
			console.log('handleNewPoint scroll', this.scrollValue._value);
		}
	}

	calHeightContainer() {
		if (this._parent) {
			const heightSoftBar =
				Platform.OS === 'android'
					? ExtraDimensions.get('SOFT_MENU_BAR_HEIGHT') || 0
					: 0; /** fix loi che course of sale khi co soft bar */
			this._parent.measure((x, y, w, h, pX, pY) => {
				const curH = _.max([heightDevice - pY, 0]);
				this.maxHeightContainer = curH - heightSoftBar;
				this.heightContainer = curH - heightSoftBar;
				if (
					this.heightContainer &&
					this.heightScroll &&
					this.heightContainer >= this.heightScroll &&
					!this.viewFillUtilFull
				) {
					this.viewFillUtilFull = (
						<View style={{ height: heightDevice }} />
					);
					this.forceUpdate();
				}
				if (
					this.heightContainer &&
					this.heightScroll &&
					this.heightContainer < this.heightScroll &&
					this.viewFillUtilFull
				) {
					this.viewFillUtilFull = null;
					this.forceUpdate();
				}
			});
		}
	}

	calHeightScrollView({
		nativeEvent: {
			layout: { height }
		}
	}) {
		if (height) {
			this.heightScroll = height;
			this.handleEndOfScroll();
			this.viewFillUtilFull = null;
			if (
				this.heightContainer &&
				this.heightScroll &&
				this.heightContainer >= this.heightScroll &&
				!this.viewFillUtilFull
			) {
				this.viewFillUtilFull = (
					<View style={{ height: heightDevice }} />
				);
				this.forceUpdate();
			}
			if (
				this.heightContainer &&
				this.heightScroll &&
				this.heightContainer < this.heightScroll &&
				this.viewFillUtilFull
			) {
				this.viewFillUtilFull = null;
				this.forceUpdate();
			}
		}
	}

	moveContainer(value, cb) {
		Animated.timing(this.scrollContainerValue, {
			toValue: value,
			duration: 500
		}).start(() => {
			this.props.onEnd();
			cb && cb();
		});
	}

	moveContainer2(value, cb) {
		Animated.timing(this.scrollValue, {
			toValue: value,
			duration: 300
		}).start(cb);
	}

	snapContainerTopMiddle(cb) {
		if (this.position === PANEL_POSITION.MIDDLE) return;
		const panPoint = this.calPanPoint();
		this.moveContainer(panPoint, cb);
		this.updatePosition(PANEL_POSITION.MIDDLE);
	}

	snapContainerTopTop(cb) {
		this.scrollContainerValue.setOffset(0);
		this.moveContainer(0, cb);
		this.updatePosition(PANEL_POSITION.TOP);
	}

	snapScrollViewToTop(cb) {
		this.moveContainer2(0, cb);
	}

	snapScrollViewToEnd(cb) {
		this.moveContainer2(this.heightScroll - this.heightContainer, cb);
	}

	reset() {
		this.scrollValue.setOffset(0);
		this.scrollValue.setValue(0);
	}

	hideContainer() {
		// a
		this.scrollValue.setValue(0);
		this.scrollValue.setOffset(0);
		this.moveContainer(heightDevice, () => {
			this.init();
			this.scrollContainerValue.setOffset(0);
		});
		this.updatePosition(PANEL_POSITION.BOTTOM);

		// reset all
	}

	render() {
		const { style, isShow, children, ...props } = this.props;
		return (
			<View
				{...props}
				style={[
					style,
					{
						width: widthDevice,
						position: 'absolute'
					}
				]}
				ref={sef => {
					if (sef) {
						this._parent = sef;
					}
				}}
				onLayout={this.calHeightContainer}
				pointerEvents={props.pointerEvents || 'box-none'}
			>
				<Animated.View
					style={{
						marginTop: this.translateYAni,
						backgroundColor: 'transparent'
					}}
					{...this._panResponder.panHandlers}
				// pointerEvents="box-only"
				>
					<View
						ref={sef => {
							if (sef) {
								this._container = sef;
							}
						}}
						onLayout={this.calHeightScrollView}
					>
						{children}
					</View>
					{this.viewFillUtilFull}
				</Animated.View>
			</View>
		);
	}
}

NestedScrollView.defaultProps = {
	onEnd: () => null
};

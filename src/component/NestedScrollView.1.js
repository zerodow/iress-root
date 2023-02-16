import React, { PureComponent } from 'react';
import { ScrollView, View, Animated, Dimensions } from 'react-native';
import _ from 'lodash';

const { height: deviceHeight } = Dimensions.get('window');

const STATUS = {
	IS_TOP: 'IS_TOP',
	IS_MIDDLE: 'IS_MIDDLE',
	IS_HIDED: 'IS_HIDED',
	IS_SCROLLING: 'IS_SCROLLING',
	IS_SNAPPING_TO_TOP: 'IS_SNAPPING_TO_TOP',
	IS_SNAPPING_TO_MIDDLE: 'IS_SNAPPING_TO_MIDDLE'
};

const POS = {
	MIDDLE: 0
};

export default class NestedScrollView extends PureComponent {
	constructor(props) {
		super(props);
		this.ani = new Animated.Value(typeof props.initialValue === 'number' ? props.initialValue : deviceHeight);
		this.scrollY = new Animated.Value(0);
		this.scrollYForChildren = new Animated.Value(0);
		this.heightLayout = new Animated.Value(0);
		this.heightContent = new Animated.Value(0);

		this.bgAni = new Animated.Value(typeof props.initialValue === 'number' ? props.initialValue : deviceHeight);

		this.state = {
			heightScroll: 0
		};

		this.status = STATUS.IS_HIDED;
		this.isHided = !typeof props.initialValue === 'number';

		this.dicHeightAbs = {};
	}

	componentDidMount() {
		this.createAniListener();
		this.createScrollYListener();
		setTimeout(() => {
			this.scrollYForChildren = this._scroll && this._scroll.getNode()._scrollAnimatedValue;
		}, 1000);
	}

	createAniListener() {
		this.ani.addListener(({ value }) => {
			// handle parent animate value
			if (this.props.scrollContainerValue) {
				this.props.scrollContainerValue.setValue(value);
			}

			// handle status
			if (value > this.state.heightScroll) {
				this.status = STATUS.IS_HIDED;
			}

			if (value === 0) {
				this.status = STATUS.IS_TOP;
			}

			if (value === POS.MIDDLE) {
				this.status = STATUS.IS_MIDDLE;
			}

			// handle background
			if (this.status !== STATUS.IS_TOP || this.isHided) {
				this.bgAni.setValue(value);
			}
		});
	}

	createScrollYListener() {
		this.scrollY.addListener(({ value }) => {
			if (this.props.scrollContentValue) {
				this.props.scrollContentValue.setValue(value);
			}

			if (value < POS.MIDDLE / 2) {
				this.nestedStatus = STATUS.IS_SNAPPING_TO_MIDDLE;
			} else if (value >= POS.MIDDLE) {
				this.nestedStatus = STATUS.IS_SCROLLING;
			} else {
				this.nestedStatus = STATUS.IS_SNAPPING_TO_TOP;
			}

			if (
				this.status === STATUS.IS_TOP &&
				this.nestedStatus !== STATUS.IS_SCROLLING
			) {
				this.bgAni.setValue(POS.MIDDLE - value);
			}
		});
	}

	componentWillUnmount() {
		this.ani.removeAllListeners();
		this.scrollY.removeAllListeners();
	}

	createPromiseSnap(offset) {
		return new Promise(resolve => {
			if (this.scrollY._value === offset) return resolve();

			const idListener = this.scrollY.addListener(({ value }) => {
				if (value === offset) {
					resolve();
					this.scrollY.removeListener(idListener);
				}
			});

			this.snapToOffset(offset);
		});
	}

	showContainer = this.showContainer.bind(this);
	showContainer() {
		this.isHided = false;

		this.snapToOffset(POS.MIDDLE, false);
		Animated.timing(this.ani, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true
		}).start();
	}

	hideContainer = this.hideContainer.bind(this);
	hideContainer() {
		this.isHided = true;

		Animated.timing(this.ani, {
			toValue: deviceHeight,
			duration: 300,
			useNativeDriver: true
		}).start(() => this.snapToOffset(0, false));
	}

	snapContainerToTop() {
		const offset = POS.MIDDLE;
		return this.createPromiseSnap(offset);
	}

	async snapContainerToMiddle() {
		const offset = 0;

		await this.createPromiseSnap(offset);

		this.ani.setValue(POS.MIDDLE);
		this.snapToOffset(POS.MIDDLE, false);
	}

	snapToOffset(offset, animated = true) {
		this._scroll &&
			this._scroll.getNode().scrollTo({ y: offset, animated });
	}

	onScrollBeginDrag = this.onScrollBeginDrag.bind(this);
	onScrollBeginDrag() {
		this.isTouched = true;
		if (this.status === STATUS.IS_MIDDLE) {
			this.ani.setValue(0);
			this.snapToOffset(0, false);
		}
	}

	onTouchEnd = this.onTouchEnd.bind(this);
	async onTouchEnd() {
		this.isTouched = false;
		if (this.nestedStatus === STATUS.IS_SNAPPING_TO_TOP) {
			await this.snapContainerToTop();
		} else if (this.nestedStatus === STATUS.IS_SNAPPING_TO_MIDDLE) {
			await this.snapContainerToMiddle();
		} else {
			this.onEndReached();

			this.dicPromise = () => {
				this.onTouchEnd();
			};
		}
	}
	onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
	onMomentumScrollEnd() {
		// this.onEndReached();
		this.dicPromise && this.dicPromise();
		this.dicPromise = null;
	}

	onLayout = this.onLayout.bind(this);
	onLayout(e) {
		const { height } = e.nativeEvent.layout;
		// POS.MIDDLE = height / 2;
		this.props.setValueBeginTriggerScroll && this.props.setValueBeginTriggerScroll(height)
		this.setState(preState => {
			if (!preState.heightScroll && height) {
				this.snapToOffset(POS.MIDDLE, false);
			}

			return { heightScroll: height };
		});
	}

	onEndReached() {
		const check =
			Math.abs(
				this.scrollY._value +
				this.heightLayout._value -
				this.heightContent._value
			) < 1;
		if (check && this.props.onEndReached) {
			this.props.onEndReached();
		}
	}

	getChildren() {
		const sticky = [];
		const { children } = this.props;

		const newChildren = React.Children.map(children, (child, index) => {
			if (child.props.isAbsolute) {
				sticky.push(index + 1);
				return React.cloneElement(child, {
					onLayout: e =>
						(this.dicHeightAbs[index] = e.nativeEvent.layout.height)
				});
			}

			if (child.props.needMoreProps) {
				return React.cloneElement(child, {
					scrollValue: this.scrollYForChildren,
					getAbsHeights: () => this.dicHeightAbs
				});
			}

			return child;
		});

		return {
			sticky,
			children: newChildren
		};
	}

	render() {
		const { children, sticky } = this.getChildren();

		const { backgroundColor, ...styles } = this.props.style || {};
		return (
			<React.Fragment>
				<Animated.View
					style={{
						position: 'absolute',
						top: this.props.bgOffset || 33,
						height: this.state.heightScroll,
						left: 0,
						right: 0,
						backgroundColor,
						transform: [{ translateY: this.bgAni }]
					}}
					pointerEvents="none"
				/>
				<Animated.ScrollView
					{...this.props}
					ref={sef => (this._scroll = sef)}
					onLayout={this.onLayout}
					onScrollBeginDrag={this.onScrollBeginDrag}
					onTouchEnd={this.onTouchEnd}
					onMomentumScrollEnd={() => this.onMomentumScrollEnd()}
					stickyHeaderIndices={sticky}
					onScroll={Animated.event([
						{
							nativeEvent: {
								contentOffset: { y: this.scrollY },
								layoutMeasurement: {
									height: this.heightLayout
								},
								contentSize: { height: this.heightContent }
							}
						}
					])}
					scrollEventThrottle={16}
					style={{
						...styles,
						width: '100%',
						height: ' 100%',
						position: 'absolute',
						transform: [{ translateY: this.ani }]
					}}
					contentContainerStyle={{
						minHeight: this.state.heightScroll * 1.5 + 33
					}}
					pointerEvents={'box-none'}
					showsVerticalScrollIndicator={false}
				>
					<View style={{ height: POS.MIDDLE }} />
					{children}
				</Animated.ScrollView>
			</React.Fragment>
		);
	}
}

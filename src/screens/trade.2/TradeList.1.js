import { ScrollView, View, Animated, InteractionManager } from 'react-native';
import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import TradeActions from './trade.reducer';

const CHILDREN_INITED = 50;
const RANGER = 50;
class CustomScrollComp extends Component {
	constructor(props) {
		super(props);
		this.childShowedInfo = {
			startPoint: -1,
			endPoint: 0
		};
		this.chidlrenHeight = {};
		this.scrollHeight = 0;
		this.scrollY = new Animated.Value(0);
		this.addListenerForScrollValue();
		this.childrenRenderer = undefined;
		this.state = {
			indexChildRendered: CHILDREN_INITED
		};
	}
	componentWillReceiveProps(nextProps) {
		if (!_.isEqual(this.props.children, nextProps.children)) {
			this.handleInitedChildren(nextProps);
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		const { expandIndex: oldIndex, ...oldProps } = this.props;
		const { expandIndex: newIndex, ...newProps } = nextProps;
		if (oldIndex !== newIndex) {
			if (this._scrollView && newIndex >= 0) {
				setTimeout(() => {
					let totalHeight = 0;
					_.forEach(this.chidlrenHeight, (h, index) => {
						if (index < newIndex) {
							totalHeight += h;
						} else {
							return false;
						}
					});
					this._scrollView.scrollTo(totalHeight);
				}, 300);
			}
			return (
				!_.isEqual(oldProps, newProps) ||
				!_.isEqual(this.props.state, nextState)
			);
		}

		return !_.isEqual(this.props.state, nextState);
	}

	componentDidMount() {
		this.handleInitedChildren(this.props, true);
	}

	handleInitedChildren(props, isSetState) {
		const { children } = props;
		const childrenLength = React.Children.count(children);
		const newChildren = React.Children.map(children, (child, index) => {
			const viewProps = {
				children: React.cloneElement(child, {
					childShowedInfo: this.childShowedInfo
				}),
				onLayout: e => {
					this.chidlrenHeight[index] = e.nativeEvent.layout.height;
					if (index === childrenLength - 1) {
						setTimeout(() => {
							this.calShowedInfo(this.scrollY._value);
						}, 300);
						return;
					}
					if (index >= this.state.indexChildRendered - 1) {
						InteractionManager.runAfterInteractions(() =>
							this.setState(preState => ({
								indexChildRendered:
									preState.indexChildRendered + RANGER
							}))
						);
					}
				}
			};
			return React.createElement(View, viewProps);
		});
		this.childrenRenderer = newChildren;
		this.setState({ indexChildRendered: CHILDREN_INITED + 1 });
	}

	addListenerForScrollValue() {
		this.scrollY.addListener(({ value }) => this.calShowedInfo(value));
	}

	calShowedInfo(value) {
		let totalHeight = 0;
		let startPoint = -1;
		let endPoint = 0;
		_.forEach(this.chidlrenHeight, (childHeight = 50, index) => {
			totalHeight = totalHeight + childHeight;
			if (value < totalHeight + 13 && startPoint === -1) {
				startPoint = index;
			}
			if (value + this.scrollHeight < totalHeight) {
				endPoint = index;
				return false;
			}
		});
		if (endPoint < startPoint) {
			endPoint = _.size(this.chidlrenHeight) - 1;
		}
		const curInfo = {
			startPoint,
			endPoint
		};
		if (!_.isEqual(curInfo, this.childShowedInfo)) {
			this.childShowedInfo = curInfo;
			this.props.setShowedInfo(curInfo);
		}
	}

	render() {
		const { children, ...props } = this.props;
		const arrChildren = React.Children.toArray(this.childrenRenderer);
		const scrollProps = {
			...props,
			ref: sef => (this._scrollView = sef),
			children: _.slice(arrChildren, 0, this.state.indexChildRendered),
			onLayout: e => (this.scrollHeight = e.nativeEvent.layout.height),
			onScroll: Animated.event([
				{ nativeEvent: { contentOffset: { y: this.scrollY } } }
			])
		};

		return React.createElement(ScrollView, scrollProps);
	}
}

function mapStateToProps(state) {
	return {
		expandIndex: state.watchlist2.expandIndex
	};
}

const mapDispatchToProps = dispatch => ({
	setShowedInfo: (...p) => dispatch(TradeActions.setShowedInfo(...p))
});

const CustomScroll = connect(
	mapStateToProps,
	mapDispatchToProps
)(CustomScrollComp);

const TradeList = props => {
	return (
		<CustomScroll
			scrollEventThrottle={16}
			removeClippedSubviews={false}
			keyboardShouldPersistTaps="always"
		>
			{_.map(props.listPriceObject, (obj, index) =>
				props.renderRow(obj, index)
			)}
			{props.renderFooter()}
		</CustomScroll>
	);
};

export default TradeList;

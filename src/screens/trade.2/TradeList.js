import { ScrollView, View, Animated, InteractionManager } from 'react-native';
import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import TradeActions from './trade.reducer';

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
	}

	shouldComponentUpdate(nextProps) {
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
			return !_.isEqual(oldProps, newProps);
		}
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
					}
				}
			};
			return React.createElement(View, viewProps);
		});

		const scrollProps = {
			...props,
			ref: sef => (this._scrollView = sef),
			children: newChildren,
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

const TradeList = props => (
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

export default TradeList;

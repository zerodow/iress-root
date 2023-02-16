import React, { PureComponent } from 'react';
import {
	ScrollView,
	findNodeHandle,
	UIManager,
	View,
	DeviceEventEmitter,
	NativeAppEventEmitter,
	Platform
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import _ from 'lodash';

import { connect } from 'react-redux';

import ScrollViewMeasureActions from './scrollview.reducer.js';

class ScrollViewMeasure extends PureComponent {
	constructor(props) {
		super(props);
		this.props.resetScrollStack();
		this.childStatus = {};
		this.scrollOfset = 0;
		this.onScroll = this.onScroll.bind(this);
		this.onLayout = this.onLayout.bind(this);
		this.onContentSizeChange = this.onContentSizeChange.bind(this);

		this.state = {
			childAddIndex: 0
		};

		this.emitter =
			Platform.OS === 'android'
				? DeviceEventEmitter
				: NativeAppEventEmitter;
	}

	componentWillUnmount = () => {
		this.props.resetScrollStack();
	};

	componentDidMount = () => {
		this.setState({
			childAddIndex: 1
		});
	};

	onScroll(e) {
		if (this.props.onScroll) {
			this.props.onScroll(e);
		}
		if (this.props.disableCheckRealtime) return;

		const { y } = e.nativeEvent.contentOffset;
		this.scrollOfset = y;
		this.checkElementShowed();
	}

	onLayout(e) {
		if (this.props.onLayout) {
			this.props.onLayout(e);
		}
		setTimeout(() => {
			this.checkElementShowed();
		}, 300);
	}

	onContentSizeChange(e) {
		if (this.props.disableCheckRealtime) return;

		if (this.props.onContentSizeChange) {
			this.props.onContentSizeChange(e);
		}
		this.checkElementShowed();
	}

	checkElementShowed() {
		// get scroll measure
		UIManager.measureInWindow(
			findNodeHandle(this),
			(x, y, w, h) => (this.scrollViewHeight = h)
		);

		_.forEach(this.props.stackChild, (value, key) => {
			UIManager.measureLayout(
				findNodeHandle(value()),
				findNodeHandle(this),
				() => null, // error
				(x, y, w, h) => {
					const posAbs = y - this.scrollOfset;
					const isShowed =
						posAbs < this.scrollViewHeight && posAbs + h > 0;
					if (this.childStatus[key] !== isShowed) {
						this.childStatus[key] = isShowed;
						this.props.setChildShowed(key, isShowed);
					}
				}
			);
		});
	}

	renderLoadingComp(isLoading) {
		if (!isLoading) {
			// custom : call didAppear , willAppear at first
			if (!this.isFirst) {
				this.isFirst = true;
				// const { navigatorEventID: eventID } = this.props.navigator;
				// this.emitter.emit(eventID, {
				// 	id: 'willAppear'
				// });

				// this.emitter.emit(eventID, {
				// 	id: 'didAppear'
				// });
			}

			return null;
		}
		return (
			<View
				style={{
					width: '100%',
					height: '100%',
					position: 'absolute',
					backgroundColor: 'transparent'
				}}
			/>
		);
	}

	render() {
		const { children, ...props } = this.props;
		const curChildren = [];

		React.Children.map(children, (child, index) => {
			if (index > this.state.childAddIndex) return;
			const curChild = React.cloneElement(child, {
				ref: sef => {
					if (sef && child.props.setRef) {
						child.props.setRef(sef);
					}
					if (sef && this.state.childAddIndex === index) {
						setTimeout(() => {
							this.setState({ childAddIndex: index + 1 });
						}, 20);
					}
				}
			});

			curChildren.push(curChild);
		});

		const lengChild = React.Children.count(children);
		const isLoaded = lengChild === this.state.childAddIndex;
		return (
			<ScrollView
				{...props}
				scrollEventThrottle={16}
				keyboardShouldPersistTaps={'always'}
				style={{
					marginBottom: 0,
					backgroundColor: CommonStyle.backgroundColor
				}}
				onScroll={this.onScroll}
				showsVerticalScrollIndicator={false}
				onContentSizeChange={this.onContentSizeChange}
			>
				{curChildren}
				{/* {this.renderLoadingComp(!isLoaded)} */}
			</ScrollView>
		);
	}
}

const mapStateToProps = state => ({
	stackChild: state.scrollView.stackChild
});
const mapDispatchToProps = dispatch => ({
	setChildShowed: (...params) =>
		dispatch(ScrollViewMeasureActions.SvMeasureSetChildShowed(...params)),
	resetScrollStack: (...params) =>
		dispatch(ScrollViewMeasureActions.SvMeasureResetStack(...params))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ScrollViewMeasure);

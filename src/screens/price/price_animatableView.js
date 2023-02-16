import React, { Component } from 'react';
import { Animated } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { connect } from 'react-redux';

class AnimatableView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			animation: ''
		};
		this.heightAn = new Animated.Value(48);
		this.onAnimationEnd = this.onAnimationEnd.bind(this);
	}

	onAnimationEnd() {
		const { onPressWatchList, typePrice } = this.props;
		Animated.timing(this.heightAn, {
			duration: 200,
			toValue: 0
		}).start();
		if (typePrice) {
			this.setState({
				animation: 'pulse'
			});
		} else {
			onPressWatchList();
		}
	}

	render() {
		const { onPressWatchList, typePrice, ...props } = this.props;
		return (
			<Animatable.View
				style={{ backgroundColor: '#FFF' }}
				animation={this.state.animation}
				easing={'ease-in-cubic'}
				duration={1}
				onAnimationEnd={this.onAnimationEnd}
				{...props}
			/>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	onPressWatchList: (...p) =>
		dispatch(PriceActions.priceUniOnPressWatchList(...p))
});

export default connect(
	null,
	mapDispatchToProps
)(AnimatableView);

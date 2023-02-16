import React, { Component } from 'react';
import {
	TouchableOpacity,
	View,
	Animated,
	Text
} from 'react-native';
import {
	declareAnimation,
	declareParallelAnimation,
	declareSequenceAnimation
} from '../../lib/base/functionUtil';
import * as Animatable from 'react-native-animatable';
import CommonStyle from '~/theme/theme_controller'
export default class AnimatableError extends Component {
	constructor(props) {
		super(props);
		this.heightAnimation = new Animated.Value(0);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.heightAnimatableView > 0) {
			this.setState({});
		}
	}
	render() {
		return (
			this.props.heightAnimatableView === 0
				? <Animatable.View style={{}}>
					<View onLayout={event => {
						this.props.getHeightAnimatedView(event);
					}}>
						<Text>{this.props.errorText}</Text>
					</View>
				</Animatable.View>
				: <Animatable.View style={{ backgroundColor: 'red', color: 'white', marginTop: 48, marginHorizontal: 48, borderRadius: 4, height: this.props.heightAnimation }}>
					<Text style={{ textAlign: 'center', paddingHorizontal: 2, color: 'white', fontSize: CommonStyle.fontSizeS }}>{this.props.errorText}</Text>
				</Animatable.View>
		)
	}
}

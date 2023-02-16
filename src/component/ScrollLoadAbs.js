import React, { PureComponent } from 'react';
import { View, Animated } from 'react-native';
import _ from 'lodash';
import Immutable from 'seamless-immutable';

export default class ScrollLoadAbs extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			absoluteChildren: Immutable({})
		};
		this.scrollValue = props.scrollValue || new Animated.Value(0);
	}

	calLayout(
		{
			nativeEvent: { layout }
		},
		index
	) {
		const obj = {};
		obj[index] = {
			x: layout.x,
			y: layout.y,
			width: layout.width,
			height: layout.height
		};
		this.setState(preState => ({
			absoluteChildren: preState.absoluteChildren.merge(obj)
		}));
	}

	getChildreded() {
		return React.Children.map(this.props.children, (child, index) => {
			const absChild = this.state.absoluteChildren[index];
			if (absChild) {
				const { width, height } = absChild;
				return <View style={{ width, height }} />;
			} else {
				const { isAbsolute } = child.props;
				if (isAbsolute) {
					return (
						<View onLayout={e => this.calLayout(e, index)}>
							{child}
						</View>
					);
				}
				return child;
			}
		});
	}

	getAbsChildred() {
		const { absoluteChildren } = this.state;
		const children = React.Children.toArray(this.props.children);
		return _.map(
			absoluteChildren,
			({ width, height, x, y }, indexOfChild) => {
				const absChild = children[indexOfChild];
				return (
					<View
						key={indexOfChild}
						style={{
							position: 'absolute',
							width,
							height,
							left: x,
							top: y
						}}
					>
						<View onLayout={e => this.calLayout(e, indexOfChild)}>
							{absChild}
						</View>
					</View>
				);
			}
		);
	}

	render() {
		const {
			type: CompType,
			setRef,
			children,
			style,
			...props
		} = this.props;
		const curChildren = this.getChildreded();
		const curAbsChildren = this.getAbsChildred();
		return (
			<View
				style={{
					overflow: 'hidden',
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20
				}}
			>
				<Animated.View
					{...props}
					ref={setRef}
					style={[
						style,
						{
							transform: [
								{
									translateY: this.scrollValue.interpolate({
										inputRange: [-1, 0, 1],
										outputRange: [1, 0, -1]
									})
								}
							]
						}
					]}
				>
					{curChildren}
				</Animated.View>
				{curAbsChildren}
			</View>
		);
	}
}

ScrollLoadAbs.defaultProps = {
	type: View
};

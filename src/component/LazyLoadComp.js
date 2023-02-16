import React, { PureComponent } from 'react';
import { View, Animated } from 'react-native';
import _ from 'lodash';

export default class LazyLoadComp extends PureComponent {
	constructor(props) {
		super(props);
		this.calChildrenRender(props);
		this.scrollValue = props.scrollValue || new Animated.Value(0);
	}
	calChildrenRender(props) {
		this.state = {
			absoluteChildren: {},
			defaultChildren: {},
			renderChildren: {},
			measureChildren: {}
		};
		const { children } = props;
		React.Children.map(children, (child, index) => {
			const { isAbsolute } = child.props;

			const newChild = this.cloneChild(child, index);

			if (isAbsolute) {
				this.state.absoluteChildren[index] = newChild;
			}

			this.state.renderChildren[index] = {
				rendered: false,
				hoc: newChild
			};
		});

		// render first item at first
		const firstItem = this.state.renderChildren[0];
		this.state.renderChildren[0] = {
			...firstItem,
			rendered: true
		};
	}

	cloneChild(child, index) {
		const { setRef } = child;

		const getNewState = () => {
			// render next comp
			const obj = this.state.renderChildren;
			const prevItem = obj[index + 1];
			if (prevItem) {
				obj[index + 1] = {
					...prevItem,
					rendered: true
				};
			}

			return obj;
		};

		const newChild = React.cloneElement(child, {
			ref: sef => {
				setRef && setRef(sef);
				if (sef) {
					const newState = getNewState();
					this.setState.renderChildren = newState;
					this.forceUpdate();
				}
			}
		});

		return (
			<View
				onLayout={e =>
					(this.state.measureChildren[index] = e.nativeEvent.layout)
				}
			>
				{newChild}
			</View>
		);
	}

	getChildreded() {
		// hien chi su dung cho thang tren cung
		// sau them comp khac + tinh theo props

		const {
			absoluteChildren,
			renderChildren,
			measureChildren
		} = this.state;
		const result = [];
		_.forEach(renderChildren, (value, index) => {
			const mea = measureChildren[index];
			if (!!absoluteChildren[index] && mea) {
				result.push(<View style={{ height: mea.height }} />);
			} else {
				const { rendered, hoc } = value || {};
				if (rendered) {
					result.push(hoc || null);
				}
			}
		});
		return result;
	}

	getAbsChildred() {
		const { absoluteChildren, measureChildren } = this.state;

		const result = [];
		_.forEach(absoluteChildren, (value, key) => {
			const mea = measureChildren[key];
			if (mea) {
				result.push(
					<View
						style={{
							position: 'absolute',
							top: mea.y,
							width: '100%'
						}}
					>
						{React.cloneElement(value, { onLayout: undefined })}
					</View>
				);
			}
		});
		return result;
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
					overflow: 'hidden'
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

LazyLoadComp.defaultProps = {
	type: View
};

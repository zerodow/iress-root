import React, { PureComponent } from 'react';
import { TouchableWithoutFeedback, View, Animated } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'
class Numpad extends PureComponent {
	constructor(props) {
		super(props);

		this.opacityValue = new Animated.Value(0);

		this.backgroundOpacity = this.opacityValue.interpolate({
			inputRange: [0, 1],
			outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.2)']
		});
		this.textOpacity = this.opacityValue.interpolate({
			inputRange: [0, 1],
			outputRange: [1, 0.5]
		})
	}

	componentWillMount() {
		this.onPressIn = this.onPressIn.bind(this);
		this.onPressOut = this.onPressOut.bind(this);
	}

	onPressIn() {
		Animated.timing(this.opacityValue, {
			toValue: 1,
			duration: 0
		}).start();
	}

	onPressOut() {
		Animated.timing(this.opacityValue, {
			toValue: 0,
			duration: 0
		}).start();
	}

	render() {
		const { number, onPress } = this.props;
		let styles = {
			numpadContainer: {
				paddingHorizontal: 20,
				paddingVertical: 5
			},
			numpad: {
				height: 60,
				width: 60,
				borderRadius: 60,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: this.backgroundOpacity
			},
			numpadNumber: {
				color: CommonStyle.fontWhite,
				fontSize: 42,
				opacity: this.textOpacity
			},
			numpadNumber2: {
				color: CommonStyle.fontWhite,
				fontSize: 40,
				opacity: this.textOpacity
			}
		};
		switch (number) {
			case 'empty': {
				return (
					<View style={styles.numpadContainer}>
						<TouchableWithoutFeedback>
							<Animated.View style={styles.numpad}>
								<Animated.Text style={[styles.numpadNumber, {
									color: 'transparent'
								}]}>
									0
								</Animated.Text>
							</Animated.View>
						</TouchableWithoutFeedback>
					</View>
				);
			}
			case 'back': {
				return (
					<View style={styles.numpadContainer}>
						<TouchableWithoutFeedback
							onPress={() => {
								onPress();
							}}
							onPressIn={this.onPressIn}
							onPressOut={this.onPressOut}>
							<Animated.View style={styles.numpad}>
								<Animated.Text style={styles.numpadNumber}>
									<Icon
										name={'md-arrow-round-back'}
										size={styles.numpadNumber.fontSize}
										color={CommonStyle.fontWhite} />
								</Animated.Text>
							</Animated.View>
						</TouchableWithoutFeedback>
					</View>
				);
			}
			case 'delete': {
				return (
					<View style={styles.numpadContainer}>
						<TouchableWithoutFeedback
							onPress={(number) => {
								onPress(number);
							}}
							onPressIn={this.onPressIn}
							onPressOut={this.onPressOut}>
							<Animated.View style={styles.numpad}>
								<Animated.Text style={styles.numpadNumber}>
									<IconMaterial
										name={'backspace-outline'}
										size={styles.numpadNumber2.fontSize}
										color={CommonStyle.fontWhite} />
								</Animated.Text>
							</Animated.View>
						</TouchableWithoutFeedback>
					</View>
				);
			}
			default: {
				return (
					<View style={styles.numpadContainer}>
						<TouchableWithoutFeedback
							onPress={(number) => {
								onPress(number);
							}}
							onPressIn={this.onPressIn}
							onPressOut={this.onPressOut}>
							<Animated.View style={styles.numpad}>
								<Animated.Text style={styles.numpadNumber}>
									{number}
								</Animated.Text>
							</Animated.View>
						</TouchableWithoutFeedback>
					</View>
				);
			}
		}
	}
}

export default Numpad;

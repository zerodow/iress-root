import React, { Component } from 'react';
import { AppState, Keyboard, Platform, StyleSheet, TextInput, View } from 'react-native';
import PinBoxList from './pinbox_list';
import config from '../../config'
import { connect } from 'react-redux';
import { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

class Pin extends Component {
	constructor(props) {
		super(props);
		this.delayHidePin = 2000;
		this.timeout = null;
		this.isMount = false;
		this.state = {
			maxPinLength: 6,
			pinValue: '',
			pinJustEnter: '',
			position: 0,
			arrPin: ['_', '_', '_', '_', '_', '_'],
			isConnected: this.props.isConnected
		};
		this.onFocusPin = this.onFocusPin.bind(this);
		this.focusPinInput = this.focusPinInput.bind(this);
		this.removeTimeOut = this.removeTimeOut.bind(this);
		this.handleAppStateChange = this.handleAppStateChange.bind(this);
		Platform.OS === 'android' && AppState.addEventListener('change', this.handleAppStateChange);
	}

	componentDidMount() {
		this.props.onRef && this.props.onRef(this);
		this.isMount = true;
	}

	componentWillUnmount() {
		this.props.onRef && this.props.onRef(null);
		this.isMount = false;
		Platform.OS === 'android' && AppState.removeEventListener('change', this.handleAppStateChange);
	}

	handleAppStateChange(nextAppState) {
		if (nextAppState === 'active') {
		} else if (nextAppState === 'background' || nextAppState === 'inactive') {
			Keyboard.dismiss();
		}
	}

	removeTimeOut() {
		this.timeout && clearTimeout(this.timeout)
	}

	changeToStarCharacter(pinValue, pinJustEnter, position, arrPin) {
		this.removeTimeOut();
		for (let i = 0; i < position; i++) {
			arrPin[i] = '*'
		}
		this.timeout = setTimeout(() => {
			this.isMount && this.setState({
				pinValue,
				pinJustEnter,
				position,
				arrPin
			})
		}, this.delayHidePin)
	}

	onFocusPin = () => {
	};

	focusPinInput() {
	}

	onFocusPinWhenHideKeyBoard = () => {
		this.pinInput && this.pinInput.blur();
		setTimeout(() => {
			this.pinInput && this.pinInput.focus();
		}, 300)
	};

	onPinEntry = (pinValue) => {
		if (pinValue.length >= 0 && (isNaN(pinValue) === false) && pinValue !== ' ') {
			let pinJustEnter = pinValue.charAt(pinValue.length - 1);
			if (Platform.OS === 'android' && (pinJustEnter === ' ' || pinJustEnter === '-' || pinJustEnter === '.' || pinJustEnter === ',')) return false;
			let position = pinValue.length;
			let arrPin = this.state.arrPin;
			arrPin[position - 1] = pinJustEnter;
			this.isMount && this.setState({ pinValue, pinJustEnter, position, arrPin }, () => {
				this.onPinEntered();
				this.changeToStarCharacter(pinValue, pinJustEnter, position, arrPin)
			});
		}
	};

	onPinEntered = () => {
		if (this.state.pinValue.length <= this.state.maxPinLength) {
			if (this.state.pinValue.length === this.state.maxPinLength) {
				this.props.onPinCompleted && this.props.onPinCompleted(this.state.pinValue)
			} else if (this.state.pinValue.length === this.state.maxPinLength - 1) {
				this.props.onChangeBeforeComplete && this.props.onChangeBeforeComplete();
			}
		}
	};

	onNumpadPressed(numpad) {
		let pinValue = this.state.pinValue;
		switch (numpad) {
			case 'delete': {
				if (pinValue.length > 0) {
					pinValue = pinValue.slice(0, pinValue.length - 1);
					let pinJustEnter = pinValue.charAt(pinValue.length - 1);
					// if (Platform.OS === 'android' && (pinJustEnter === ' ' || pinJustEnter === '-' || pinJustEnter === '.' || pinJustEnter === ',')) return false;
					let position = pinValue.length;
					let arrPin = this.state.arrPin;
					arrPin[position - 1] = pinJustEnter;
					this.isMount && this.setState({ pinValue, pinJustEnter, position, arrPin }, () => {
						this.onPinEntered();
						this.changeToStarCharacter(pinValue, pinJustEnter, position, arrPin)
					});
				}
				break;
			}
			default: {
				if (pinValue.length < 6) {
					pinValue = pinValue + numpad;
					let pinJustEnter = pinValue.charAt(pinValue.length - 1);
					// if (Platform.OS === 'android' && (pinJustEnter === ' ' || pinJustEnter === '-' || pinJustEnter === '.' || pinJustEnter === ',')) return false;
					let position = pinValue.length;
					let arrPin = this.state.arrPin;
					arrPin[position - 1] = pinJustEnter;
					this.isMount && this.setState({ pinValue, pinJustEnter, position, arrPin }, () => {
						this.onPinEntered();
						this.changeToStarCharacter(pinValue, pinJustEnter, position, arrPin)
					});
				}
				break;
			}
		}
	}

	getPin() {
		// console.log('get pin is called');
		return this.state.pinValue;
	}

	setPin(pinCode) {
		// console.log('set pin is called');
		this.isMount && this.setState({
			pinValue: pinCode
		})
	}

	clearPin() {
		// console.log('clear pin is called');
		this.isMount && this.setState({
			pinValue: '',
			arrPin: ['_', '_', '_', '_', '_', '_']
		})
	}

	render() {
		return (
			<View style={[styles.pinView, this.props.pinViewStyle, {
				marginHorizontal: this.props.marginHorizontal !== undefined && this.props.marginHorizontal !== null ? this.props.marginHorizontal : 32,
				marginTop: this.props.marginTop !== undefined && this.props.marginTop !== null ? this.props.marginTop : 32
			}]}>
				<PinBoxList
					pinLength={this.state.maxPinLength}
					pinValueLength={this.state.pinValue.length}
					pinJustEnter={this.state.pinJustEnter}
					position={this.state.position}
					pinValue={this.state.pinValue}
					arrPin={this.state.arrPin}
					{...this.props}
				/>
			</View>
		);
	}
}

const styles = {};

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		input: {
			backgroundColor: 'red',
			position: 'absolute',
			right: -99,
			top: 30
		},
		inputTemp: {
			backgroundColor: 'transparent',
			position: 'absolute',
			top: 0,
			right: 32,
			left: 32,
			bottom: 0,
			width: 3,
			height: 3,
			color: 'transparent'
		},
		pinView: {
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'transparent'
		},
		pinPromptText: {
			marginBottom: 10
		}
	});

	PureFunc.assignKeepRef(styles, newStyle)
}

getNewestStyle();
register(getNewestStyle);

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected
	};
}

export default connect(mapStateToProps)(Pin);

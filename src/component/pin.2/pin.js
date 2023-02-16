import React, { Component } from 'react';
import { Text, TextInput, View, StyleSheet, Platform, AppState, Keyboard, PixelRatio } from 'react-native';
import PinBoxList from './pinbox_list';
import config from '../../config'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CommonStyle, { register } from '~/theme/theme_controller'
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
			arrPin: ['✽', '✽', '✽', '✽', '✽', '✽'],
			isConnected: this.props.isConnected
		};
		this.onFocusPin = this.onFocusPin.bind(this);
		this.onFocusPinWhenHideKeyBoard = this.onFocusPinWhenHideKeyBoard.bind(this)
		this.focusPinInput = this.focusPinInput.bind(this)
		this.removeTimeOut = this.removeTimeOut.bind(this);
		this.handleAppStateChange = this.handleAppStateChange.bind(this);
		Platform.OS === 'android' && AppState.addEventListener('change', this.handleAppStateChange);
	}

	componentDidMount() {
		this.props.onRef && this.props.onRef(this)
		this.isMount = true;
	}

	componentWillUnmount() {
		this.props.onRef && this.props.onRef(null)
		this.isMount = false;
		Platform.OS === 'android' && AppState.removeEventListener('change', this.handleAppStateChange);
	}

	// componentWillReceiveProps(nextProps) {
	//   if (nextProps.isConnected !== this.state.isConnected) {
	//     this.setState({
	//       isConnected: nextProps.isConnected
	//     }, () => {
	//       if (this.state.isConnected) {
	//         this.pinInput.blur()
	//         setTimeout(() => {
	//           this.pinInput.focus();
	//         }, 200)
	//       }
	//     })
	//   }
	// }

	handleAppStateChange(nextAppState) {
		if (nextAppState === 'active') {
			this.onFocusPin();
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
			arrPin[i] = '✽'
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
		// this.pinInput && this.pinInput.blur();
		setTimeout(() => {
			this.pinInput && this.pinInput.focus();
		}, 300)
	}

	focusPinInput() {
		setTimeout(() => {
			this.pinInput && this.pinInput.focus();
		}, 200)
	}

	onFocusPinWhenHideKeyBoard = () => {
		this.pinInput && this.pinInput.blur();
		setTimeout(() => {
			this.pinInput && this.pinInput.focus();
		}, 300)
	}

	onPinEntry = (pinValue) => {
		if (pinValue.length >= 0 && isNaN(pinValue) === false && pinValue !== ' ') {
			let pinJustEnter = pinValue.charAt(pinValue.length - 1)
			if (Platform.OS === 'android' && (pinJustEnter === ' ' || pinJustEnter === '-' || pinJustEnter === '.' || pinJustEnter === ',')) return false;
			let position = pinValue.length;
			let arrPin = this.state.arrPin
			arrPin[position - 1] = pinJustEnter
			this.isMount && this.setState({ pinValue, pinJustEnter, position, arrPin }, () => {
				this.onPinEntered();
				this.changeToStarCharacter(pinValue, pinJustEnter, position, arrPin)
			});
		}
	}

	onPinEntered = () => {
		if (this.state.pinValue.length <= this.state.maxPinLength) {
			if (this.state.pinValue.length === this.state.maxPinLength) {
				this.props.onPinCompleted && this.props.onPinCompleted(this.state.pinValue)
			} else if (this.state.pinValue.length === this.state.maxPinLength - 1) {
				this.props.onChangeBeforeComplete && this.props.onChangeBeforeComplete();
			}
		}
	}
	getPin() {
		console.log('get pin is called')
		return this.state.pinValue;
	}
	setPin(pincode) {
		console.log('set pin is called')
		this.isMount && this.setState({
			pinValue: pincode
		})
	}
	clearPin() {
		console.log('clear pin is called')
		this.pinInput.clear();
		this.isMount && this.setState({
			pinValue: ''
		})
	}
	render() {
		return (
			<View style={styles.container}>
				<View style={[styles.pinView, this.props.pinViewStyle, { marginHorizontal: this.props.marginHorizontal !== undefined && this.props.marginHorizontal !== null ? this.props.marginHorizontal : 32, marginTop: this.props.marginTop !== undefined && this.props.marginTop !== null ? this.props.marginTop : 20 }]}>
					<PinBoxList
						onFocusPinWhenHideKeyBoard={this.onFocusPinWhenHideKeyBoard}
						onFocusPin={this.onFocusPin}
						pinLength={this.state.maxPinLength}
						pinValueLength={this.state.pinValue.length}
						pinJustEnter={this.state.pinJustEnter}
						position={this.state.position}
						pinValue={this.state.pinValue}
						arrPin={this.state.arrPin}
						{...this.props}
					/>
				</View>
				<TextInput
					// editable={this.state.isConnected}
					caretHidden={false}
					underlineColorAndroid={'transparent'}
					selectionColor={'transparent'}
					tintColor={`transparent`}
					testID={`pinInput`}
					ref={ref => this.pinInput = ref}
					autoFocus={false}
					blurOnSubmit={false}
					enablesReturnKeyAutomatically={false}
					keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
					maxLength={this.state.maxPinLength}
					onChangeText={this.onPinEntry}
					value={this.state.pinValue}
					style={config.isDetoxTest ? styles.inputTemp : styles.input} />
			</View>
		);
	}
}

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			// marginTop: 20,
			// marginHorizontal: 16,
			// borderTopWidth: 1.5,
			// borderTopColor: 'rgba(0, 0, 0, 0.12)',
			// borderBottomWidth: 1.5,
			// borderBottomColor: 'rgba(0, 0, 0, 0.12)',
			// height: 50
		},
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
			backgroundColor: 'transparent',
			height: 50,
			borderTopWidth: 1,
			borderTopColor: 'rgba(0, 0, 0, 0.12)',
			borderBottomWidth: 1,
			borderBottomColor: 'rgba(0, 0, 0, 0.12)'
		},
		pinPromptText: {
			marginBottom: 10
		}
	});

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

function mapStateToProps(state, ownProps) {
	return {
		isConnected: state.app.isConnected
	};
}

export default connect(mapStateToProps)(Pin);

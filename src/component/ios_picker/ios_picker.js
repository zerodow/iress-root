import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
// import Picker from 'react-native-wheel-picker'

// var PickerItem = Picker.Item;
export default class TimePicker extends Component {
	constructor(props) {
		super(props);

		this._hours = [];
		this._minutes = [];
		this.getLabel = this.getLabel.bind(this);

		for (let j = 0; j < 24 * (this.props.loop ? 100 : 1); j++) {
			this._hours.push(j);
		}

		for (
			let j = 0;
			j < 60 * (this.props.loop ? 100 : 1);
			j += this._getInterval(this.props.minuteInterval || 1)
		) {
			this._minutes.push(j);
		}

		this.state = {
			selectedHour: this._getHourIndex(this.props.selectedHour || 0),
			selectedMinute: this._getMinuteIndex(
				this.props.selectedMinute || 0,
				this.props.minuteInterval || 1
			)
		};
	}

	updateHourMinute(selectedHour, selectedMinute) {
		this.setState({
			selectedHour: this._getHourIndex(selectedHour || 0),
			selectedMinute: this._getMinuteIndex(selectedMinute || 0)
		});
	}
	_getInterval = (interval) => {
		let matched = false;
		for (let i of [1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30]) {
			if (i === interval) {
				return interval;
			}
		}

		if (!matched) {
			return 1;
		}
	};

	_getHourIndex = (h) => {
		return (this.props.loop ? this._hours.length / 2 : 0) + h;
	};

	_getMinuteIndex = (m, interval) => {
		return (
			(this.props.loop
				? (this._minutes.length / 2) * this._getInterval(interval)
				: 0) + (m % this._getInterval(interval) === 0 ? m : 0)
		);
	};

	_getHourValue = (h) => {
		return h % 24;
	};

	_getMinuteValue = (m) => {
		return m % 60;
	};

	_onValueChangeCallback = () => {
		if ('onValueChange' in this.props) {
			this.props.onValueChange(
				this._getHourValue(this.state.selectedHour),
				this._getMinuteValue(this.state.selectedMinute)
			);
		}
	};

	_setHour = (hour) => {
		this.setState(
			{
				selectedHour: hour
			},
			() => {
				this._onValueChangeCallback();
			}
		);
	};

	_setMinute = (minute) => {
		this.setState(
			{
				selectedMinute: minute
			},
			() => {
				this._onValueChangeCallback();
			}
		);
	};

	getLabel(time, type = 'minute') {
		let _time =
			type === 'hour'
				? this._getHourValue(time).toString()
				: this._getMinuteValue(time).toString();
		if (_time < 10) {
			return '0' + _time;
		} else return _time;
	}

	render() {
		let hours = [];
		for (let hour of this._hours) {
			// hours.push(
			// 	<PickerItem
			// 		key={hour}
			// 		value={hour}
			// 		label={this.getLabel(hour, 'hour')}
			// 	/>
			// );
		}

		let minutes = [];
		for (let minute of this._minutes) {
			// minutes.push(
			// 	<PickerItem
			// 		key={minute}
			// 		value={minute}
			// 		label={this.getLabel(minute)}
			// 	/>
			// );
		}

		return (
			<View style={[styles.container, this.props.style]}>
				{/* <Picker
					style={{ width: '50%', height: 200 }}
					selectedValue={this.state.selectedHour}
					itemStyle={{
						color: 'white',
						fontSize: CommonStyle.fontSizeM
					}}
					onValueChange={this._setHour}
				>
					{hours}
				</Picker>
				<Picker
					style={{ width: '50%', height: 200 }}
					selectedValue={this.state.selectedMinute}
					itemStyle={{
						color: 'white',
						fontSize: CommonStyle.fontSizeM
					}}
					onValueChange={this._setMinute}
				>
					{minutes}
				</Picker> */}
			</View>
		);
	}
}

const styles = {};

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		container: {
			flexDirection: 'row',
			flex: 1
		}
	});

	PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

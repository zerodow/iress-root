import React, { Component } from 'react';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import timeagoInstance from '../../lib/base/time_ago';
import Enum from '../../enum';
import I18n from '../../modules/language/index';
import * as Controller from '../../memory/controller';
import * as Channel from '../../streaming/channel';
import * as Emitter from '@lib/vietnam-emitter';
import { dataStorage, func } from '../../storage';
import { Text } from 'react-native';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'

export default class TimeAgo extends Component {
	constructor(props) {
		super(props);
		this.state = {
			timeDisplay: timeagoInstance.format(this.props.updated, 'qe_local')
		};
		this.syncTimeEnableReadNew = this.syncTimeEnableReadNew.bind(this);
		this.autoCheckTimeAgo = this.autoCheckTimeAgo.bind(this);
		this.checkCurrentTimeAgo = this.checkCurrentTimeAgo.bind(this);
		this.getIntervalTimeAgo = this.getIntervalTimeAgo.bind(this);
		this.intervalTimeAgo = null;
		this.interval = null;
	}

	autoCheckTimeAgo() {
		this.interval = this.checkCurrentTimeAgo();
		this.intervalTimeAgo && clearInterval(this.intervalTimeAgo);
		this.intervalTimeAgo = setInterval(() => {
			this.actionAutoCheckTimeAgoInterval();
		}, this.interval);
	}

	actionAutoCheckTimeAgoInterval() {
		const interval = this.checkCurrentTimeAgo();
		if (interval === this.interval) {
			this.setState(
				{
					timeDisplay: timeagoInstance.format(
						this.props.updated,
						'qe_local'
					)
				},
				this.syncTimeEnableReadNew
			);
		} else {
			this.setState(
				{
					timeDisplay: timeagoInstance.format(
						this.props.updated,
						'qe_local'
					)
				},
				this.syncTimeEnableReadNew
			);
			this.interval = interval;
			this.intervalTimeAgo && clearInterval(this.intervalTimeAgo);
			this.intervalTimeAgo = setInterval(() => {
				this.actionAutoCheckTimeAgoInterval();
			}, this.interval);
		}
	}

	syncTimeEnableReadNew() {
		const { timeDisplay } = this.state;
		const minutes = I18n.t('minutesAgo');
		if (
			timeDisplay.indexOf(minutes) >= 0 &&
			this.state.timeDisplay.indexOf('20') >= 0
		) {
			const channel = Channel.getChannelSyncTimeEnableReadNews(
				this.props.newID
			);
			Emitter.emit(channel);
		}
	}

	checkCurrentTimeAgo() {
		let type = 'second';
		const justNow = I18n.t('justNow');
		const seconds = I18n.t('secondsAgo');
		const minute = I18n.t('minuteAgo');
		const minutes = I18n.t('minutesAgo');
		const hour = I18n.t('hourAgo');
		const hours = I18n.t('hoursAgo');
		const day = I18n.t('dayAgo');
		const days = I18n.t('daysAgo');

		if (
			this.state.timeDisplay.indexOf(justNow) >= 0 ||
			this.state.timeDisplay.indexOf(seconds) >= 0
		) {
			type = 'second';
		} else if (
			this.state.timeDisplay.indexOf(minute) >= 0 ||
			this.state.timeDisplay.indexOf(minutes) >= 0
		) {
			type = 'minute';
		} else if (
			this.state.timeDisplay.indexOf(hour) >= 0 ||
			this.state.timeDisplay.indexOf(hours) >= 0
		) {
			type = 'hour';
		} else if (
			this.state.timeDisplay.indexOf(day) >= 0 ||
			this.state.timeDisplay.indexOf(days) >= 0
		) {
			type = 'day';
		}

		return this.getIntervalTimeAgo(type);
	}

	getIntervalTimeAgo(type) {
		switch (type) {
			case 'minute':
				return Enum.TIME_AGO_INTERVAL.MINUTE;
			case 'hour':
				return Enum.TIME_AGO_INTERVAL.HOUR;
			case 'day':
				return Enum.TIME_AGO_INTERVAL.DAY;
			default:
				return Enum.TIME_AGO_INTERVAL.SECOND;
		}
	}

	componentDidMount() {
		this.autoCheckTimeAgo();
	}

	componentWillUnmount() {
		this.intervalTimeAgo && clearInterval(this.intervalTimeAgo);
	}

	render() {
		return (
			<TextLoad
				isLoading={this.props.isLoading}
				allowFontScaling={false}
				testID={`${this.props.newID}time`}
				style={[
					{ ...this.props.style }
				]}
				numberOfLines={1}
			>
				{this.state.timeDisplay}
			</TextLoad>
		);
	}
}

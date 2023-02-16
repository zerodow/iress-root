import React, { Component } from 'react';
import { View, Text } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import * as Emitter from '@lib/vietnam-emitter';
import * as NewsBusiness from '../../streaming/news';
import * as Util from '../../util';
import XComponent from '../../component/xComponent/xComponent';
export default class AnnouncementIcon extends XComponent {
	constructor(props) {
		super(props);
		//  bind function
		this.init = this.init.bind(this);
		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.bindAllFunc();

		//  init state and dic
		this.init();
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.isNewsToday !== nextProps.isNewsToday) {
			this.state.isNewsToday = nextProps.isNewsToday;
		}
		if (this.props.symbol !== nextProps.symbol) {
			this.unSubNewAnnouncementIcon()
			this.subNewAnnouncementIcon(nextProps.symbol)
		}
	}
	subNewAnnouncementIcon = this.subNewAnnouncementIcon.bind(this)
	subNewAnnouncementIcon(symbol) {
		const event = NewsBusiness.getChannelAnnouncementIcon(symbol);
		Emitter.addListener(event, this.dic.idForm, isNewsToday => {
			if (this.state.isNewsToday !== isNewsToday) {
				// this.setState({
				// 	isNewsToday
				// });
			}
		});
	}
	unSubNewAnnouncementIcon = this.unSubNewAnnouncementIcon.bind(this)
	unSubNewAnnouncementIcon() {
		const event = NewsBusiness.getChannelAnnouncementIcon(this.props.symbol);
		if (this.dic.idForm && event) {
			Emitter.deleteListener(event)
		}
	}
	init() {
		this.dic = {
			idForm: Util.getRandomKey()
		};

		this.state = {
			isNewsToday: this.props.isNewsToday || false
		};
	}

	bindAllFunc() {
		this.renderTextBorder = this.renderTextBorder.bind(this);
		this.subAlertNewsToday = this.subAlertNewsToday.bind(this);
	}

	componentDidMount = () => {
		super.componentDidMount();
		// Add event update A color text
		const symbol = this.props.symbol;
		const event = NewsBusiness.getChannelAnnouncementIcon(symbol);
		Emitter.addListener(event, this.dic.idForm, isNewsToday => {
			if (this.state.isNewsToday !== isNewsToday) {
				this.setState({
					isNewsToday
				});
			}
		});
		this.subAlertNewsToday();
	};

	componentWillUnmount = () => {
		super.componentWillUnmount();
	};

	subAlertNewsToday() {
		if (this.props.channelNewsToday) {
			const channel = this.props.channelNewsToday;
			Emitter.addListener(channel, this.dic.idForm, isNewsToday => {
				if (this.state.isNewsToday !== isNewsToday) {
					this.setState({
						isNewsToday
					}, () => {
						const x = 1
						console.log('DCM', this.state.isNewsToday)
					});
				}
			});
		}
	}

	renderTextBorder({ text, backgroundColor, color, isShow }) {
		if (isShow) {
			return (
				<View style={[this.props.containerStyle, { backgroundColor }]}>
					<Text style={[this.props.contentStyle, { color }]}>
						{text}
					</Text>
				</View>
			);
		}
		return <View />;
	}

	render() {
		const text = 'A';
		const backgroundColor = this.state.isNewsToday
			? CommonStyle.newsActive
			: CommonStyle.newsInactive;
		const color = CommonStyle.backgroundColor;
		const isShow = true;
		return this.renderTextBorder({ text, backgroundColor, color, isShow });
	}
}

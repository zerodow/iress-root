import React, { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import IonIcons from 'react-native-vector-icons/Ionicons';

import { showNewsDetail, logAndReport } from '../../lib/base/functionUtil';
import timeagoInstance from '../../lib/base/time_ago';
import styles from '../trade/style/trade';

export default class Announcement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			isDisabled: true
		};
		this.renderToLink = this.renderToLink.bind(this);
	}

	checkDataUpdated() {
		const { data } = this.props;
		const curTime = new Date().getTime();
		const enabledTime = data.updated + 1200000;

		if (enabledTime <= curTime) {
			this.setState({
				data,
				isDisabled: false
			});
		} else {
			const timeCount = enabledTime - curTime;
			this.setState({ data }, () => {
				setTimeout(() => {
					this.setState({
						isDisabled: false
					});
				}, timeCount);
			});
		}
	}

	componentDidMount() {
		try {
			this.checkDataUpdated();
		} catch (error) {
			logAndReport(
				'componentDidMount price Announcement exception',
				error,
				'componentDidMount Announcement'
			);
		}
	}

	renderToLink() {
		const { data } = this.state;
		showNewsDetail(data, this.props.navigator, this.props.app.isConnected);
	}

	renderMinAnnouncement() {
		const { isDisabled } = this.state;
		const { i } = this.props;
		return (
			<TouchableOpacity
				disabled={isDisabled}
				onPress={this.renderToLink}
				style={[
					styles.rowExpandNews2,
					{ borderBottomWidth: i === listLength - 1 ? 0 : 1 }
				]}
				key={i}
			>
				<View style={{ flexDirection: 'row', width: '100%' }}>
					{data.link ? (
						<TouchableOpacity
							testID={`${data.news_id}iconDownload`}
							style={{ width: '8%' }}
							onPress={() => console.log('dowload news')}
							disabled={isDisabled || !data.link}
						>
							<IonIcons
								name="md-download"
								size={20}
								color={isDisabled ? 'grey' : '#10a8b2'}
							/>
						</TouchableOpacity>
					) : (
						<View style={{ width: '8%' }} />
					)}
					{data.link && data.link ? (
						<Text
							style={[CommonStyle.textSubBlack, { width: '57%' }]}
						>
							{data.sign &&
							Array.isArray(data.sign) &&
							data.sign.includes('PriceSensitive')
								? `! ${data.title}`
								: data.title}
						</Text>
					) : (
						<Text
							style={[
								CommonStyle.textSubNormalBlack,
								{ width: '57%' }
							]}
						>
							{data.sign &&
							Array.isArray(data.sign) &&
							data.sign.includes('PriceSensitive')
								? `* ! ${data.title}`
								: `* ${data.title}`}
						</Text>
					)}
					<Text
						style={[
							CommonStyle.textSub,
							{
								textAlign: 'right',
								width: data.link ? '35%' : '35%'
							}
						]}
					>
						{timeagoInstance.format(data.updated, 'qe_local')}
					</Text>
				</View>
				{data.page_count && data.page_count > 0 ? (
					<View style={{ width: '100%', paddingTop: 6 }}>
						<Text style={CommonStyle.textFloatingLabel}>
							{data.page_count && data.page_count > 0
								? data.page_count > 1
									? `${data.page_count} pages`
									: `${data.page_count} page`
								: ''}
						</Text>
					</View>
				) : null}
			</TouchableOpacity>
		);
	}

	renderDefaultAnnouncement() {
		const { isDisabled } = this.state;
		const { i } = this.props;
		return (
			<TouchableOpacity
				disabled={isDisabled}
				onPress={this.renderToLink}
				style={[
					styles.rowExpandNews2,
					{ borderBottomWidth: i === 2 ? 0 : 1 }
				]}
				key={i}
			>
				<View style={{ flexDirection: 'row', width: '100%' }}>
					{data.link ? (
						<TouchableOpacity
							testID={`${data.news_id}iconDownload`}
							style={{ width: '8%' }}
							onPress={() => console.log('dowload news')}
							disabled={isDisabled || !data.link}
						>
							<IonIcons
								name="md-download"
								size={20}
								color={isDisabled ? 'grey' : '#10a8b2'}
							/>
						</TouchableOpacity>
					) : (
						<View style={{ width: '8%' }} />
					)}
					{data.link ? (
						<Text
							style={[CommonStyle.textSubBlack, { width: '57%' }]}
						>
							{data.sign &&
							Array.isArray(data.sign) &&
							data.sign.includes('PriceSensitive')
								? `! ${data.title}`
								: data.title}
						</Text>
					) : (
						<Text
							style={[
								CommonStyle.textSubNormalBlack,
								{ width: '57%' }
							]}
						>
							{data.sign &&
							Array.isArray(data.sign) &&
							data.sign.includes('PriceSensitive')
								? `! * ${data.title}`
								: `* ${data.title}`}
						</Text>
					)}
					<Text
						style={[
							CommonStyle.textSub,
							{
								textAlign: 'right',
								width: data.link ? '35%' : '35%'
							}
						]}
					>
						{timeagoInstance.format(data.updated, 'qe_local')}
					</Text>
				</View>
				{data.page_count && data.page_count > 0 ? (
					<View style={{ width: '100%', paddingTop: 6 }}>
						<Text style={CommonStyle.textFloatingLabel}>
							{data.page_count && data.page_count > 0
								? data.page_count > 1
									? `${data.page_count} pages`
									: `${data.page_count} page`
								: ''}
						</Text>
					</View>
				) : null}
			</TouchableOpacity>
		);
	}

	render() {
		const { data } = this.state;
		const { listLength } = this.props;
		if (!data) {
			return <View />;
		}
		if (listLength <= 3) {
			return this.renderMinAnnouncement();
		}

		return this.renderDefaultAnnouncement();
	}
}

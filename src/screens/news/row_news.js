import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	PixelRatio,
	Dimensions
} from 'react-native';
import styles from './style/news_search';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import timeagoInstance from '../../lib/base/time_ago';
import Icon from 'react-native-vector-icons/Ionicons';
import {
	logAndReport,
	checkTradingHalt,
	logDevice
} from '../../lib/base/functionUtil';
import I18n from '../../modules/language/';
import * as Business from '../../business';
import Flag from '../../component/flags/flag';
import { dataStorage } from '../../storage';
import TimeAgo from '../../component/time_ago/time_ago';
import XComponent from '../../component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '../../streaming/channel';
import * as Controller from '../../memory/controller';
import * as NewsBusiness from '../../streaming/news';
import ENUM from '../../enum';
import RedDot from '../../component/red_dot/red_dot';
import TradingHalt from '../../component/trading_halt/trading_halt';
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';

export default class RowNews extends XComponent {
	constructor(props) {
		super(props);
		this.init = this.init.bind(this);
		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.bindAllFunc();
		this.init();
	}

	init() {
		this.state = {
			data: this.props.data || [],
			isDisabled: Controller.getLiveNewStatus() === 0,
			unread: this.props.unread || false
		};
		this.dic = {
			tag: []
		};
	}

	bindAllFunc() {
		this.checkTag = this.checkTag.bind(this);
		this.disableMultiClick = this.disableMultiClick.bind(this);
		this.tagFilledValue = this.tagFilledValue.bind(this);
		this.handleChangeLiveNew = this.handleChangeLiveNew.bind(this);
		this.updateLiveNews = this.updateLiveNews.bind(this);
		this.compareTimeOpenLink = this.compareTimeOpenLink.bind(this);
	}

	checkTag(item) {
		const tag = [];
		if (item.type_news === 'News') {
			tag.push('N');
		} else {
			tag.push('A');
		}
		if (
			(item.tag && item.tag.indexOf('TradingHaltLifted') >= 0) ||
			(item.tag &&
				item.tag.indexOf('ReinstatementToOfficialQuotation')) >= 0
		) {
			tag.push('lifted');
		} else if (
			(item.tag && item.tag.indexOf('TradingHalt') >= 0) ||
			(item.tag && item.tag.indexOf('SuspensionFromOfficialQuotation')) >=
			0
		) {
			tag.push('halt');
		}
		return tag;
	}

	tagFilledValue(item) {
		switch (item) {
			case '$':
				return I18n.t('priceSensitive');
			case 'N':
				return I18n.t('News');
			case 'A':
				return I18n.t('announcementUpper');
			case 'lifted':
				return I18n.t('halfLiftedUpper');
			case 'halt':
				return I18n.t('haltUpper');
			default:
				return '';
		}
	}

	disableMultiClick() {
		// Link can click
		if (!this.state.isDisabled) {
			// Disable multi click
			this.setState(
				{
					isDisabled: true,
					unread: false
				},
				() => {
					this.props.renderToLink(this.state.data);
					setTimeout(() => {
						this.setState({
							isDisabled: false
						});
					}, 200);
				}
			);
		}
	}

	renderTag(item, i, obj) {
		try {
			const itemValue = this.tagFilledValue(item);
			const getTagDefaultStyle = i => {
				return {
					backgroundColor:
						item === '$' || item === 'halt'
							? '#FBD937'
							: item === 'N' || item === 'lifted'
								? '#43C3D4'
								: '#F28BB0',
					height: 16 * 1,
					marginRight: i > 0 ? 1 : 0,
					marginTop: 0
				};
			};
			return (
				<View
					testID={
						item === 'A'
							? `${obj.news_id}tagA`
							: `${obj.news_id}tagH`
					}
					style={[getTagDefaultStyle(i), { paddingHorizontal: 4 }]}
					key={i}
				>
					<Text allowFontScaling={false} style={CommonStyle.tagLabel}>
						{itemValue}
					</Text>
				</View>
			);
		} catch (error) {
			logAndReport('renderTag news exception', error, 'renderTag news');
		}
	}

	handleChangeLiveNew() {
		const channel = NewsBusiness.getChannelLiveNews();
		Emitter.addListener(channel, this.id, liveNews => {
			this.updateLiveNews(liveNews);
		});
	}

	updateLiveNews(liveNews) {
		if (liveNews) {
			this.setState({
				isDisabled: false
			});
		} else {
			const compareTimeOpenLink = this.compareTimeOpenLink(
				this.state.data
			);
			if (compareTimeOpenLink.isDisabled) {
				this.setState({
					isDisabled: true
				});
			}
		}
	}

	compareTimeOpenLink(item) {
		const curTime = new Date().getTime();
		let updatedTime = item.updated;
		if (typeof updatedTime === 'string') {
			updatedTime = new Date(item.updated).getTime();
		}
		const enabledTime = updatedTime + ENUM.TIME_OPEN_NEWS;
		if (enabledTime <= curTime) {
			return {
				isDisabled: false,
				timeCount: enabledTime - curTime
			};
		} else {
			return {
				isDisabled: true,
				timeCount: enabledTime - curTime
			};
		}
	}

	componentDidMount() {
		super.componentDidMount();
		this.handleChangeLiveNew();
		this.checkTimeOpenLink(this.state.data);
	}

	componentWillUnmount() {
		Emitter.deleteByIdEvent(this.id);
		super.componentWillUnmount();
	}

	checkTimeOpenLink(item) {
		if (item && item.updated) {
			const compareTimeOpenLink = this.compareTimeOpenLink(item);
			if (!compareTimeOpenLink.isDisabled) {
				this.setState({
					isDisabled: false
				});
			} else {
				const channel = Channel.getChannelSyncTimeEnableReadNews(
					item.news_id
				);
				Emitter.addListener(channel, this.id, () => {
					this.setState({
						isDisabled: false
					});
					Emitter.deleteByIdEvent(this.id);
				});
				// const { timeCount } = compareTimeOpenLink
				// setTimeout(() => {
				// 	this.setState({
				// 		isDisabled: false
				// 	})
				// 	Emitter.deleteByIdEvent(this.id)
				// }, timeCount)
			}
		}
	}

	renderDisplayNameColumn() {
		const item = this.state.data;
		const { symbol = '' } = item
		const displayName = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].display_name ? dataStorage.symbolEquity[symbol].display_name : symbol
		const flagIcon = Business.getFlag(item.symbol);
		return (
			<View style={{ flex: 3, marginRight: 8 }}>
				<View style={{ flexDirection: 'row' }}>
					<TradingHalt symbol={this.props.data.symbol} />
					<View style={{ width: '75%' }}>
						<Text
							testID={`${item.news_id}code`}
							allowFontScaling={false}
							numberOfLines={2}
							style={CommonStyle.textMain2}
						>
							{displayName.length > 7
								? Business.convertDisplayName(displayName)
								: `${displayName}`}
						</Text>
					</View>
					<View
						style={[
							{ alignItems: 'flex-end', marginTop: 1, flex: 1 }
						]}
					>
						<Flag type="flat" code={flagIcon} size={18} />
					</View>
				</View>
				<View>
					<Text
						allowFontScaling={false}
						testID={`${item.news_id}page`}
						style={CommonStyle.textFloatingLabel}
					>
						{item.page_count && item.page_count > 0
							? item.page_count > 1
								? `${item.page_count} ${I18n.t('pages')}`
								: `${item.page_count} ${I18n.t('page')}`
							: ''}
					</Text>
				</View>
			</View>
		);
	}

	renderTagAndTimeUpdate() {
		const item = this.state.data;
		return (
			<View style={{ flexDirection: 'row' }}>
				<View style={{ marginLeft: 4 }}>
					{item.sign && item.sign.includes('PriceSensitive') ? (
						<View
							testID={`sensitive`}
							style={{
								backgroundColor: '#FF6A6A',
								height: 16,
								marginTop: 1,
								paddingHorizontal: 4
							}}
						>
							<Text
								allowFontScaling={false}
								style={CommonStyle.tagLabel}
							>
								{I18n.t('sensitiveUpper')}
							</Text>
						</View>
					) : null}
				</View>
				<View style={{ flex: 1, paddingRight: 1 }}>
					<TimeAgo updated={item.updated} newID={item.news_id} />
				</View>
			</View>
		);
	}

	render() {
		const item = this.state.data;
		if (!item || item.length === 0) {
			return (
				<View
					style={{
						height: 50,
						paddingHorizontal: 16,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					{<Text style={CommonStyle.textNoData}>{I18n.t('noData')}</Text>}
				</View>
			);
		}
		this.dic.tag = this.checkTag(item);

		let content = null;
		if (this.dic.tag.length > 0) {
			content = this.dic.tag.map((e, i) => {
				return this.renderTag(e, i, item);
			});
		}

		return (
			<TouchableOpacityOpt
				onPress={this.disableMultiClick}
				disabled={this.state.isDisabled}
				timeDelay={ENUM.TIME_DELAY}
			>
				{this.props.index === 0 || this.props.index === '0' ? null : (
					<View
						style={{
							borderBottomWidth: 1,
							borderColor: CommonStyle.fontBorderGray,
							marginHorizontal: 16
						}}
					/>
				)}
				<View style={[styles.rowContainerNew]}>
					<RedDot newType={this.props.newType} newID={item.news_id} />
					{this.renderDisplayNameColumn()}
					<View
						style={{
							flex: 0.4,
							marginHorizontal: 4,
							marginVertical: 2
						}}
					>
						<View>
							{item.link ? (
								<TouchableOpacity
									testID={`${item.news_id}iconDownload`}
									onPress={this.disableMultiClick}
									disabled={this.state.isDisabled}
								>
									<Icon
										name="md-download"
										size={20}
										color={
											this.state.isDisabled
												? CommonStyle.fontSilver
												: CommonStyle.fontBlue
										}
									/>
								</TouchableOpacity>
							) : null}
						</View>
					</View>
					<View style={{ flex: 7 }}>
						<View style={{ marginLeft: 5 }}>
							{item.link ? (
								<Text
									allowFontScaling={false}
									testID={`${item.news_id}title`}
									style={CommonStyle.textSubNormalBlack}
								>
									{item.sign &&
										item.sign.includes('PriceSensitive')
										? `! ${item.title}`
										: item.title}
								</Text>
							) : (
									<Text
										allowFontScaling={false}
										testID={`${item.news_id}title`}
										style={CommonStyle.textSubNormalBlack}
									>
										{item.sign &&
											item.sign.includes('PriceSensitive')
											? `* ! ${item.title}`
											: `* ${item.title}`}
									</Text>
								)}
						</View>
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								marginLeft: 4
							}}
						>
							{content}
						</View>
						{this.renderTagAndTimeUpdate()}
					</View>
				</View>
			</TouchableOpacityOpt>
		);
	}
}

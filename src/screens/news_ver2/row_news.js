import React, { Component } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	PixelRatio,
	Dimensions,
	Platform
} from 'react-native';
import styles from './style/news_search';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import timeagoInstance from '../../lib/base/time_ago';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomIcon from '~/component/Icon'
import {
	logAndReport,
	checkTradingHalt,
	logDevice,
	checkNewTag
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
import * as Animatable from 'react-native-animatable'
import * as newsControl from './controller'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as newsActions from './news.actions';
import { getIcon } from '~s/alert_function/functionCommon';
const { TAB_NEWS } = ENUM
const styleTag = {
	position: 'absolute',
	right: -2,
	top: -2
}
class RowNews extends XComponent {
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
		this.disableMultiClick = this.disableMultiClick.bind(this);
		this.handleChangeLiveNew = this.handleChangeLiveNew.bind(this);
		this.updateLiveNews = this.updateLiveNews.bind(this);
		this.compareTimeOpenLink = this.compareTimeOpenLink.bind(this);
		this.renderNoData = this.renderNoData.bind(this);
		this.renderTitleNews = this.renderTitleNews.bind(this);
		this.renderButtonDownload = this.renderButtonDownload.bind(this);
		this.renderTag = this.renderTag.bind(this);
	}
	disableMultiClick() {
		// Link can click
		this.props.renderToLink(this.state.data);
	}

	renderTag() {
		try {
			return null
			if (!this.props.data || !this.props.data.tag) return null;
			const { tag } = this.props.data;
			const listTag = checkNewTag(tag);
			// const listTag = ['DIVIDEND', 'BUY_BACK', 'CAP_RECONSTRUCTION']
			if (!listTag || !listTag.length) return null;
			return <View style={styleTag}>
				<View style={{ display: 'flex', flexDirection: 'row' }}>
					{listTag.map(item => {
						return getIcon(item, null, { marginLeft: 4.5 })
					})}
				</View>
			</View>
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
			}
		}
	}

	renderDisplayNameColumn() {
		const item = this.state.data;
		const { symbol = '' } = item
		const displayName = Business.getSymbolName({ symbol })
		const flagIcon = Business.getFlag(item.symbol);
		return (
			<View style={{
				flex: 2.5,
				display: 'flex',
				flexDirection: 'column'
			}}>
				<View style={{
					flex: 1
				}}
				>
					<View style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						// justifyContent: 'center',
						flex: 1
					}}>
						<RedDot newType={this.props.newType} newID={item.news_id} />
						<TradingHalt symbol={this.props.data.symbol} />
						{/* fake unread news vs halt symbol */}
						{/* <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#df0000', marginLeft: 4 }} />
						<Text style={{ color: 'red', marginLeft: 4 }}>!</Text> */}
						<Text
							testID={`${item.news_id}code`}
							allowFontScaling={false}
							style={[CommonStyle.textMain2, { fontFamily: CommonStyle.fontPoppinsBold, marginLeft: 2 }]}
						>
							{displayName}
						</Text>
					</View>
				</View>
				<View style={{
					flex: 1,
					marginLeft: 4,
					// alignItems: 'center'
					justifyContent: 'center'
				}}>
					<Flag type="flat" code={flagIcon} size={18} />
				</View>
			</View>
		)
	}
	renderPageAndTime() {
		const item = this.state.data;
		const { isLoading } = this.props.news
		return <View style={{
			flex: 1,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center'
		}}>
			<View style={{ flex: 1 }}>
				<ViewLoad style={{ flex: 1 }} containerStyle={{ flex: 1 }} isLoading={isLoading}>
					<Text
						allowFontScaling={false}
						testID={`${item.news_id}page`}
						style={CommonStyle.textFloatingLabel3}
					>
						{item.page_count && item.page_count > 0
							? item.page_count > 1
								? `${item.page_count} ${I18n.t('pages')}`
								: `${item.page_count} ${I18n.t('page')}`
							: ''}
						<Text style={CommonStyle.textFloatingLabel3}> | </Text>
						<TimeAgo
							style={{ marginRight: 16 }}
							updated={item.updated}
							newID={item.news_id}
							isNews
						/>
					</Text>
				</ViewLoad>
			</View>
			{this.renderButtonDownload()}
		</View>
	}
	renderTitleNews() {
		const item = this.state.data;
		const { isLoading } = this.props.news
		const styleLineHeight = Platform.OS === 'android' ? { lineHeight: CommonStyle.fontSizeXS + 4 } : {}
		return <View style={{ flex: 1, justifyContent: 'center' }}>
			<ViewLoad isLoading={isLoading} containerStyle={{ alignItems: 'center' }}>
				{item.link ? (
					<Text
						numberOfLines={2}
						allowFontScaling={false}
						testID={`${item.news_id}title`}
						style={[{ fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsBold }, styleLineHeight]}
					>
						{item.sign &&
							item.sign.includes('PriceSensitive')
							? `! ${item.title}`
							: item.title}
					</Text>
				) : (
						<Text
							numberOfLines={2}
							allowFontScaling={false}
							testID={`${item.news_id}title`}
							style={[{ fontSize: CommonStyle.fontSizeXS, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsBold }, styleLineHeight]}
						>
							{item.sign &&
								item.sign.includes('PriceSensitive')
								? `* ! ${item.title}`
								: `* ${item.title}`}
						</Text>
					)}
			</ViewLoad>
		</View >
	}
	renderAlertNews() {
		const item = this.state.data;
		return <View style={{
			display: 'flex',
			flexDirection: 'column',
			flex: 0.5
		}}>
			<View style={{
				flex: 1,
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center'
			}}>
				<RedDot newType={this.props.newType} newID={item.news_id} />
				{/* <TradingHalt symbol={this.props.data.symbol} /> */}
				{/* fake unread news vs halt symbol */}
				{/* <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#df0000', marginLeft: 4 }} />
						<Text style={{ color: 'red', marginLeft: 4 }}>!</Text> */}
			</View>
			<View style={{ flex: 1, alignItems: 'center' }}></View>
		</View>
	}
	renderNoData() {
		return <View
			style={{
				height: 50,
				paddingHorizontal: 16,
				justifyContent: 'center',
				alignItems: 'center'
			}}
		>
			{<Text style={CommonStyle.textNoData}>{I18n.t('noData')}</Text>}
		</View>
	}
	renderButtonDownload() {
		const item = this.state.data;
		return <View>
			{item.link ? (
				<TouchableOpacity
					testID={`${item.news_id}iconDownload`}
					onPress={this.disableMultiClick}
					disabled={this.state.isDisabled}
				>
					<CustomIcon name="equix_download"
						size={20}
						color={
							this.state.isDisabled
								? CommonStyle.fontSilver
								: CommonStyle.color.modify
						} />
				</TouchableOpacity>
			) : null}
		</View>
	}
	setRef = this.setRef.bind(this)
	setRef(ref, index) {
		if (ref) {
			const item = this.state.data;
			this.props.setRefRowContent && this.props.setRefRowContent({
				ref,
				index,
				newID: item.news_id
			})
		}
	}
	renderRowTop = () => {
		const item = this.state.data;
		const { symbol = '' } = item
		const displayName = Business.getSymbolName({ symbol })
		const { isLoading } = this.props.news
		const currentTab = newsControl.getCurrentTab()
		return (
			<View style={{ flexDirection: 'row', paddingTop: 16, paddingBottom: 8, paddingRight: 8, alignItems: 'center' }}>
				<View style={{ width: '7%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
					{currentTab === TAB_NEWS.RELATED ? (<RedDot newType={this.props.newType} newID={item.news_id} />) : null}
					<View style={{ width: 4 }} />
					<TradingHalt symbol={this.props.data.symbol} />
				</View>
				<View style={{ width: '25%' }}>
					<TextLoad isLoading={isLoading}>
						<Text
							testID={`${item.news_id}code`}
							allowFontScaling={false}
							style={[CommonStyle.textMain2, { fontFamily: CommonStyle.fontPoppinsBold, fontSize: CommonStyle.fontSizeL }]}
						>
							{displayName}
						</Text>
					</TextLoad>
				</View>
				{this.renderTitleNews()}
			</View>
		)
	}
	renderRowBottom = () => {
		const item = this.state.data;
		const flagIcon = Business.getFlag(item.symbol);
		const { isLoading } = this.props.news
		return (
			<View style={{ flexDirection: 'row', paddingRight: 8, paddingBottom: 16 }}>
				<View style={{ width: '7%' }} />
				<View style={{ width: '25%' }}>
					<ViewLoad isLoading={isLoading}>
						<Flag type="flat" code={flagIcon} size={18} />
					</ViewLoad>
				</View>
				{this.renderPageAndTime()}
			</View>
		)
	}
	render() {
		const { index } = this.props
		const item = this.state.data;
		if (!item || item.length === 0) {
			this.renderNoData()
		}
		return (
			<Animatable.View
				ref={(ref) => this.setRef(ref, index)}
				animation={{
					easing: 'linear',
					0: {
						opacity: 1
					},
					1: {
						opacity: 1
					}
				}}
				style={{ marginTop: index === 0 ? 8 : 0 }}
				duration={1}>
				<TouchableOpacityOpt
					onPress={this.disableMultiClick}
					disabled={this.state.isDisabled}
					timeDelay={ENUM.TIME_DELAY}
				>
					<View style={[styles.rowContainerNew]}>
						{this.renderTag()}
						{/* {this.renderAlertNews()}
						{this.renderDisplayNameColumn()}
						<View style={{ flex: 7, marginTop: 14, display: 'flex', flexDirection: 'column' }}>
							{this.renderTitleNews()}
							{this.renderPageAndTime()}
						</View> */}
						{this.renderRowTop()}
						{this.renderRowBottom()}
					</View>
				</TouchableOpacityOpt>
			</Animatable.View>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		news: state.news,
		textFontSize: state.setting.textFontSize
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(newsActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(RowNews);

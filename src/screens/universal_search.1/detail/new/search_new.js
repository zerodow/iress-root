import React, { PureComponent } from 'react';
import { FlatList, View, Text, TouchableOpacity, Image } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { dataStorage } from '~/storage';
import I18n from '~/modules/language';
import { openSignIn, showNewsDetail } from '~/lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import styles from '@unis/style/universal_search';
import Enum from '~/enum';
import * as Controller from '~/memory/controller';
import RowNews from '~s/news/row_news';
import SearchNewActions from './search_new.reducer';
import * as RoleUser from '~/roleUser';
import LoadingComp from '~/component/loadingComp';
import AppState from '~/lib/base/helper/appState2';
import * as api from '../../../../api';
import Icon from 'react-native-vector-icons/Ionicons';
import TimeAgo from '~/component/time_ago/time_ago';
const TAGS = {
	NEWS: I18n.t('News'),
	ANNOUNCEMENT: I18n.t('announcementUpper'),
	LIFTED: I18n.t('halfLiftedUpper'),
	HALT: I18n.t('haltUpper'),
	...Enum.TAG_NEWS_STRING_BY_KEY
}; export class SearchNewWithoutLogin extends PureComponent {
	getText(text) {
		return I18n.t(text, {
			locale: this.props.language
		});
	}

	render() {
		return (
			<View
				style={{
					height: 60,
					justifyContent: 'center',
					alignItems: 'center',
					flexDirection: 'row'
				}}
			>
				<Text style={{ opacity: 0.87, color: CommonStyle.fontColor }}>
					{`${this.getText('newsPart1')} `}
				</Text>
				<Text style={{ color: '#007aff' }} onPress={openSignIn}>
					{`${this.getText('newsPart2')} `}
				</Text>
				<Text style={{ opacity: 0.87, color: CommonStyle.fontColor }}>
					{this.getText('newsPart3')}
				</Text>
			</View>
		);
	}
}

class RowComp extends PureComponent {
	constructor(props) {
		super(props);
		this.renderToLink = this.renderToLink.bind(this);
	}

	renderToLink(data) {
		const { news_id: newID = '' } = data;
		const { navigator, isConnected } = this.props;
		showNewsDetail(newID, navigator, isConnected);
	}

	render() {
		const { news_id: newId } = this.props.data;

		let check = false;
		if (Controller.getLoginStatus()) {
			const { list_news_unread: listUnread = {} } = dataStorage;
			check = listUnread[newId];
		}

		return (
			<RowNews
				index={this.props.index}
				key={newId}
				data={this.props.data}
				unread={!!check}
				id={newId}
				navigator={this.props.navigator}
				renderToLink={this.renderToLink}
				newType={Enum.TYPE_NEWS.RELATED}
			/>
		);
	}
}

export const Row = connect(state => ({
	isConnected: state.app.isConnected
}))(RowComp);

export class MoreComp extends PureComponent {
	getText(text) {
		return I18n.t(text, {
			locale: this.props.language
		});
	}

	render() {
		const { isMoreNews, loadMoreNewData } = this.props;

		if (isMoreNews) {
			return (
				<TouchableOpacity
					onPress={loadMoreNewData}
					style={[
						styles.rowExpandNews,
						{
							width: '100%',
							backgroundColor: CommonStyle.backgroundColor
						}
					]}
				>
					<Text
						style={{
							fontSize: CommonStyle.fontSizeS,
							color: CommonStyle.fontBlue
						}}
					>
						{this.getText('more')}
					</Text>
				</TouchableOpacity>
			);
		}
		return <View style={{ height: 16 }} />;
	}
}

export class ListEmpty extends PureComponent {
	render() {
		return (
			<View
				style={{
					height: 60,
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Text style={{ color: CommonStyle.fontColor }}>
					{I18n.t('noData', {
						locale: this.props.language
					})}
				</Text>
			</View>
		);
	}
}

export const More = connect(
	state => ({
		isMoreNews: state.searchNews.isMoreNews
	}),
	dispatch => ({
		loadMoreNewData: (...p) =>
			dispatch(SearchNewActions.loadMoreNewData(...p))
	})
)(MoreComp);

export class SearchNew extends PureComponent {
	constructor(props) {
		super(props);
		this.props.navigator.addOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);

		this.appState = new AppState(() => {
			this.props.getSnapshot();
		});
		this.symbol = props.symbol;
		this.state = {
			listNewsData: []
		}
		this.getTagFromItem = this.getTagFromItem.bind(this);
		this.renderRightRow = this.renderRightRow.bind(this);
		this.renderInfo = this.renderInfo.bind(this);
		this.renderSensitive = this.renderSensitive.bind(this);
		this.renderTitle = this.renderTitle.bind(this);
		this.renderExchange = this.renderExchange.bind(this);
		this.renderLeftRow = this.renderLeftRow.bind(this);
		this.onPress = this.onPress.bind(this);
		this.compareTimeOpenLink = this.compareTimeOpenLink.bind(this);
		this.renderRow = this.renderRow.bind(this);
	}

	componentWillReceiveProps = nextProps => {
		const { isConnected, symbol } = nextProps;
		const changeNerworkState =
			this.props.isConnected === false && isConnected === true;
		const changeSymbol = this.props.symbol !== symbol;
		if (changeNerworkState || changeSymbol) {
			this.props.getSnapshot();
		}
		if (changeSymbol) {
			nextProps.resetPageSizeNews();
		}
	};

	componentDidMount = () => {
		this.props.resetPageSizeNews();
		this.props.getSnapshot();
	};

	onNavigatorEvent(event) {
		switch (event.id) {
			case 'search_refresh':
				this.props.getSnapshot();
				break;
			case 'willAppear':
				this.props.resetPageSizeNews();
				this.props.getSnapshot();
				break;
			case 'didAppear':
				this.appState.addListenerAppState();
				break;
			case 'didDisappear':
				this.appState.removeListenerAppState();
				break;
			default:
				break;
		}
	}
	getTagFromItem(item) {
		const { tag = '', type_news: typeNews } = item;
		const result = [];
		if (typeNews === 'News') result.push(TAGS.NEWS);
		else result.push(TAGS.ANNOUNCEMENT);
		let arrTag = [];
		try {
			arrTag = JSON.parse(tag);
		} catch (error) {
			arrTag = [];
		}
		_.forEach(arrTag, t => {
			const value = TAGS[t];
			value && result.push(value);
		});
		return result;
	}
	renderRightRow(item) {
		let arrTag = this.getTagFromItem(item);
		let isMore = false;
		if (_.size(arrTag) > 3) {
			isMore = true;
		}
		arrTag = _.take(arrTag, 3);

		const content = _.map(arrTag, title => (
			<View
				key={title}
				style={{
					backgroundColor: '#dedede',
					borderRadius: 1,
					paddingHorizontal: 4,
					marginBottom: 2,
					width: '100%'
				}}
			>
				<Text
					style={{
						fontFamily: 'HelveticaNeue-CondensedBold',
						fontSize: CommonStyle.fontSizeXS,
						color: 'rgba(0, 0, 0, 0.54)'
					}}
					numberOfLines={2}
				>
					{_.upperCase(title)}
				</Text>
			</View>
		));
		return (
			<View style={{ width: '30%' }}>
				{content}
				{isMore && (
					<Text
						style={{
							marginTop: -12,
							fontSize: CommonStyle.fontSizeXXL,
							color: 'rgba(0, 0, 0, 0.54)'
						}}
					>
						...
					</Text>
				)}
				<View style={{ flex: 1 }} />
			</View>
		);
	}

	renderInfo(item) {
		const { updated, news_id: newId, page_count: pageCount = 0 } =
			item || {};

		const pageTitle =
			pageCount > 0 ? `${pageCount} ${I18n.t('pages')}` : '';
		// console.log('time updated==========================================>', item)
		return (
			<View style={{ flexDirection: 'row' }}>
				<TimeAgo
					updated={updated}
					newID={newId}
					style={{
						fontFamily: 'HelveticaNeue-Medium',
						fontSize: CommonStyle.font10,
						color: CommonStyle.fontColor
					}}
				/>
				<View style={{ flex: 1 }} />
				<Text
					style={{
						fontFamily: 'HelveticaNeue-Medium',
						fontSize: CommonStyle.font10,
						color: CommonStyle.fontColor
					}}
				>
					{pageTitle}
				</Text>
			</View>
		);
	}
	renderSensitive() {
		return (
			<View
				style={{
					width: 14,
					height: 14,
					backgroundColor: '#f67500',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<Text
					style={{
						fontFamily: 'HelveticaNeue-CondensedBold',
						fontSize: CommonStyle.fontSizeXS,
						color: 'white'
					}}
				>
					S
				</Text>
			</View>
		);
	}
	renderTitle(item, isDisabled) {
		const { sign, link, title, page_count: pageCount = 0 } = item || {};
		const isSensitive = _.includes(sign, 'PriceSensitive');

		let titleDisplay = title;
		if (isSensitive) {
			titleDisplay = '!' + titleDisplay;
		}
		if (!link) {
			titleDisplay = '*' + titleDisplay;
		}

		if (pageCount > 0) {
			titleDisplay = '   ' + titleDisplay;
		}

		if (isSensitive) {
			titleDisplay = '      ' + titleDisplay;
		}

		return (
			<View style={{ flex: 1 }}>
				<View
					style={{
						position: 'absolute',
						flexDirection: 'row',
						paddingTop: 3
					}}
				>
					{pageCount > 0 && (
						<View style={{ paddingRight: 10, paddingTop: 1 }}>
							<Icon
								name="md-download"
								size={12}
								color={isDisabled ? '#0000001e' : '#10a8b2'}
							/>
						</View>
					)}

					{isSensitive && this.renderSensitive()}
				</View>

				<Text
					style={{
						fontFamily: 'HelveticaNeue-Bold',
						fontSize: CommonStyle.fontSizeM,
						color: CommonStyle.fontColor
					}}
				>
					{titleDisplay}
				</Text>
			</View>
		);
	}
	renderExchange() {
		return (
			<View style={{ width: 35, height: 16 }}>
				<Image
					style={{ width: '100%', height: '100%' }}
					source={require('~/img/asx_logo.png')}
				/>
			</View>
		);
	}
	renderLeftRow(item, isDisabled) {
		return (
			<View style={{ flex: 1 }}>
				{this.renderExchange()}
				{this.renderTitle(item, isDisabled)}
				{this.renderInfo(item)}
			</View>
		);
	}
	onPress(data) {
		const { news_id: newID = '' } = data || {};
		const { navigator, isConnected } = this.props;
		showNewsDetail(newID, navigator, isConnected);
	}
	compareTimeOpenLink(item) {
		const curTime = new Date().getTime();
		let updatedTime = item.updated;
		if (typeof updatedTime === 'string') {
			updatedTime = new Date(item.updated).getTime();
		}
		const enabledTime = updatedTime + Enum.TIME_OPEN_NEWS;
		return enabledTime > curTime;
	}
	renderRow({ item, index }) {
		const onPress = () => this.onPress(item);
		const isDisabled = this.compareTimeOpenLink(item);
		return (
			<TouchableOpacity key={index} onPress={onPress}>
				<View
					style={{
						justifyContent: 'space-between',
						flexDirection: 'row',
						marginHorizontal: 16,
						paddingVertical: 3
					}}
				>
					{this.renderLeftRow(item, isDisabled)}
					<View style={{ width: 12 }} />
					{this.renderRightRow(item)}
				</View>
			</TouchableOpacity>
		);
	}
	render() {
		const isLogged = Controller.getLoginStatus();
		const { lang } = this.props.setting;
		if (!isLogged) {
			return <SearchNewWithoutLogin language={lang} />;
		}

		const { navigator, isLoading } = this.props;
		const { listNewsData } = this.props
		const hadRole = RoleUser.checkRoleByKey(
			Enum.ROLE_DETAIL.VIEW_NEWS_OF_SYMBOL_UNIVERSALSEARCH
		);
		if (_.isEmpty(listNewsData) || !hadRole) {
			return <ListEmpty language={lang} />;
		}
		return (
			<LoadingComp isLoading={isLoading}>
				<FlatList
					scrollEnabled={!this.props.scrollDisalbe}
					data={_.values(listNewsData)}
					renderItem={this.renderRow}
					ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
				/>
				<More language={lang} />
			</LoadingComp>
		);
	}
}

const mapStateToProps = state => ({
	setting: state.setting,
	isLoading: state.searchNews.isLoadingNews,
	listNewsData: state.searchNews.listNews,
	isConnected: state.app.isConnected,
	symbol: state.searchDetail.symbol
});

const mapDispatchToProps = dispatch => ({
	resetPageSizeNews: (...p) =>
		dispatch(SearchNewActions.resetPageSizeNews(...p)),
	getSnapshot: (...p) => dispatch(SearchNewActions.getNewData(...p))
});
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchNew);

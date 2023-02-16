import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { FlatList, View, Text, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';

import SearchNewActions from './search_new.reducer';
import TimeAgo from '~/component/time_ago/time_ago';
import I18n from '~/modules/language/';
import { showNewsDetail } from '~/lib/base/functionUtil';
import Enum from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller';
const TAGS = {
	NEWS: I18n.t('News'),
	ANNOUNCEMENT: I18n.t('announcementUpper'),
	LIFTED: I18n.t('halfLiftedUpper'),
	HALT: I18n.t('haltUpper'),
	...Enum.TAG_NEWS_STRING_BY_KEY
};

export class WatchListSearchNew extends PureComponent {
	constructor(props) {
		super(props);
		this.renderRow = this.renderRow.bind(this);
	}
	componentWillReceiveProps(nextProps) {
		if (this.props.symbol !== nextProps.symbol) {
			nextProps.resetPageSizeNews();
			this.getNewData(nextProps);
		}
	}

	componentDidMount() {
		this.getNewData(this.props);
	}

	getNewData(props) {
		const { symbol, getSnapshot, resetNewData } = props;
		if (symbol) {
			resetNewData();
			getSnapshot(symbol);
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
						color: '#000'
					}}
				>
					{titleDisplay}
				</Text>
			</View>
		);
	}

	renderInfo(item) {
		const { updated, news_id: newId, page_count: pageCount = 0 } =
			item || {};

		const pageTitle =
			pageCount > 0 ? `${pageCount} ${I18n.t('pages')}` : '';
		return (
			<View style={{ flexDirection: 'row' }}>
				<TimeAgo
					updated={updated}
					newID={newId}
					style={{
						fontFamily: 'HelveticaNeue-Medium',
						fontSize: CommonStyle.font10,
						color: '#00000054'
					}}
				/>
				<View style={{ flex: 1 }} />
				<Text
					style={{
						fontFamily: 'HelveticaNeue-Medium',
						fontSize: CommonStyle.font10,
						color: '#00000054'
					}}
				>
					{pageTitle}
				</Text>
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
		return <Text>abc</Text>
		const { listNewsData } = this.props;
		const arrData = _.values(listNewsData);
		const data = _.take(arrData, 3);
		return (
			<FlatList
				contentContainerStyle={{ backgroundColor: 'red' }}
				style={{ paddingTop: 16 }}
				data={data}
				renderItem={this.renderRow}
				ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
			/>
		);
	}
}

const mapStateToProps = state => ({
	lang: state.setting.lang,
	isLoading: state.searchNews.isLoadingNews,
	isConnected: state.app.isConnected,
	listNewsData: state.searchNews.listNews
});

const mapDispatchToProps = dispatch => ({
	resetPageSizeNews: (...p) =>
		dispatch(SearchNewActions.resetPageSizeNews(...p)),
	getSnapshot: (...p) => dispatch(SearchNewActions.getNewData(...p)),
	resetNewData: (...p) => dispatch(SearchNewActions.resetNewData(...p))
});
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(WatchListSearchNew);

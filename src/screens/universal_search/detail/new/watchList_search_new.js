import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
	FlatList,
	View,
	Text,
	Image,
	TouchableOpacity,
	Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import _ from 'lodash';
import CustomIcon from '~/component/Icon';
import SearchNewActions from './search_new.reducer';
import TimeAgo from '~/component/time_ago/time_ago';
import I18n from '~/modules/language/';
import {
	showNewsDetail,
	getInfoAndShowNewDetail,
	showUnavailableNew
} from '~/lib/base/functionUtil';
import * as ContentController from '~/screens/news_v3/controller/list_news_wrapper_controller/wrapper_content_controller.js';
import Enum from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as Controler from '~/memory/controller';
import {
	Text as TextLoad,
	View as ViewLoad
} from '~/component/loading_component';
import RecyclerListViewContent from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/RecyclerListViewConent.js';
import RowNew from './components/RowNews';
import * as NewsAction from '~/screens/news_v3/redux/news.actions.js';
import * as NewDetailController from '~/screens/news_v3/controller/NewDetailController';
import ProgressBar from '~/modules/_global/ProgressBar';
import * as ContentModel from '~/screens/news_v3/model/content.model.js';
import {
	setActiveScreen,
	setInactiveScreen
} from '~/manage/manageActiveScreen';
const { ACTIVE_STREAMING } = Enum;
const TAGS = {
	NEWS: I18n.t('News'),
	ANNOUNCEMENT: I18n.t('announcementUpper'),
	LIFTED: I18n.t('halfLiftedUpper'),
	HALT: I18n.t('haltUpper'),
	...Enum.TAG_NEWS_STRING_BY_KEY
};
class LeftRowNew extends PureComponent {
	render() {
		const {
			renderExchange,
			item,
			isDisabled,
			renderTitle,
			renderInfo
		} = this.props;
		return (
			<View style={{ flex: 1 }}>
				{renderExchange()}
				{renderTitle(item, isDisabled)}
				{renderInfo(item, isDisabled)}
			</View>
		);
	}
}
const mapStateToPropsLeftRowNewRedux = (state) => {
	return {
		textFontSize: state.setting.textFontSize
	};
};

const LeftRowNewRedux = connect(mapStateToPropsLeftRowNewRedux)(LeftRowNew);

export function getInforAndSnapshot(data) {
	const listSymbol = ContentController.getListSymbolUniq(data);
	ContentModel.updateListPreSymbol({ symbols: listSymbol });
	return new Promise(async (resolve, reject) => {
		try {
			const data = await ContentController.getIressFeedSnapshot(
				listSymbol
			);
			ContentController.addSymbolInfoToDic(data);
			resolve(ContentController.getObjectDataSnapShot(data));
		} catch (error) {
			resolve([]);
		}
	});
}
export class WatchListSearchNew extends PureComponent {
	constructor(props) {
		super(props);
		this.renderRow = this.renderRow.bind(this);
		this.state = {
			isLoadingSymbol: true,
			isLoadingNews: false
		};
	}
	setLoadingSymbolInfo = (isLoadingSymbol) => {
		this.setState({
			isLoadingSymbol,
			isLoadingNews: false
		});
	};
	componentWillReceiveProps(nextProps) {
		if (this.props.symbol !== nextProps.symbol) {
			nextProps.resetPageSizeNews();
			this.getNewData(nextProps);
		}
		if (
			!nextProps.isLoading &&
			nextProps.isLoading !== this.props.isLoading
		) {
			this.setLoadingSymbolInfo(true);
			getInforAndSnapshot(nextProps.listNewsData)
				.then((data) => {
					this.props.updateAffectedSymbol &&
						this.props.updateAffectedSymbol(data);
					this.setLoadingSymbolInfo(false);
				})
				.catch((e) => {
					this.setLoadingSymbolInfo(false);
				});
		}
	}

	componentDidMount() {
		// console.info('NEWS DIDMOUNT')
		// setActiveScreen(ACTIVE_STREAMING.NEWS)
		this.getNewData(this.props);
	}

	componentWillUnmount() {
		// console.info('NEWS UNMOUNT')
		// setInactiveScreen(ACTIVE_STREAMING.NEWS)
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
		_.forEach(arrTag, (t) => {
			const value = TAGS[t];
			value && result.push(value);
		});

		const arrAnnou = [];
		const arrHalt = [];
		const arrLifted = [];
		const arrDefault = [];

		_.forEach(arrTag, (t) => {
			if (t === TAGS.ANNOUNCEMENT) {
				arrAnnou.push(t);
			} else if (t === TAGS.HALT) {
				arrHalt.push(t);
			} else if (t === TAGS.LIFTED) {
				arrLifted.push(t);
			} else {
				arrDefault.push(t);
			}
		});

		return [...arrAnnou, ...arrHalt, ...arrLifted, ...arrDefault];
	}

	renderRightRow(item) {
		let arrTag = this.getTagFromItem(item);
		let isMore = false;
		if (_.size(arrTag) > 3) {
			isMore = true;
		}
		arrTag = _.take(arrTag, 3);

		const content = _.map(arrTag, (title) => (
			<View
				key={title}
				style={{
					backgroundColor: CommonStyle.fontBgChart,
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
						color: CommonStyle.fontDeepBlack2
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
					width: 17,
					height: 17,
					backgroundColor: '#f67500',
					alignItems: 'center',
					justifyContent: 'center',
					marginRight: 4
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

		const titleStyles = {
			fontFamily: CommonStyle.fontPoppinsBold,
			fontSize: CommonStyle.fontSizeXS,
			color: CommonStyle.fontColor
		};

		return (
			<View
				style={{
					flex: 1,
					alignItems: 'flex-start',
					paddingVertical: 8
				}}
			>
				{/* <View
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
				</View> */}

				<TextLoad
					isLoading={this.props.isLoadingBox}
					style={[
						titleStyles,
						{
							lineHeight:
								Platform.OS === 'android'
									? CommonStyle.fontSizeXS + 8
									: undefined
						}
					]}
				>
					{titleDisplay}
				</TextLoad>
			</View>
		);
	}

	renderInfo(item, isDisabled) {
		const {
			updated,
			news_id: newId,
			page_count: pageCount = 0,
			sign,
			title,
			link
		} = item || {};
		const isSensitive = _.includes(sign, 'PriceSensitive');

		let titleDisplay = title;
		if (isSensitive) {
			titleDisplay = '!' + titleDisplay;
		}
		if (!link) {
			titleDisplay = '*' + titleDisplay;
		}

		if (isSensitive) {
			titleDisplay = '      ' + titleDisplay;
		}
		const pageTitle =
			pageCount > 0 ? `${pageCount} ${I18n.t('pages')}` : '';
		return (
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				{/* <View style={{ flex: 1 }} /> */}

				<TextLoad
					isLoading={this.props.isLoadingBox}
					style={{
						opacity: 0.25,
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS,
						color: CommonStyle.fontColor
					}}
				>
					{pageTitle}
				</TextLoad>
				<Text
					style={{
						opacity: 0.25,
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeS,
						color: CommonStyle.fontColor,
						paddingHorizontal: 4
					}}
				>
					|
				</Text>
				<TimeAgo
					isLoading={this.props.isLoadingBox}
					updated={updated}
					newID={newId}
					style={{
						opacity: 0.25,
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeXS,
						color: CommonStyle.fontColor
					}}
				/>
				<View
					style={{ flex: 1, alignItems: 'flex-end', height: '100%' }}
				>
					<View
						style={{
							position: 'absolute',
							flexDirection: 'row',
							top: 0,
							bottom: 0,
							justifyContent: 'center',
							alignItems: 'center'
							// paddingTop: 3
						}}
					>
						{isSensitive && this.renderSensitive()}
						{pageCount > 0 && (
							<View style={{ alignItems: 'center' }}>
								<CustomIcon
									name="equix_download"
									size={18}
									color={
										isDisabled
											? CommonStyle.fontSilver
											: CommonStyle.color.modify
									}
								/>
							</View>
						)}
					</View>
				</View>
			</View>
		);
	}
	renderExchange = this.renderExchange.bind(this);
	renderTitle = this.renderTitle.bind(this);
	renderInfo = this.renderInfo.bind(this);
	renderLeftRow(item, isDisabled) {
		return (
			<LeftRowNewRedux
				isLoadingBox={this.props.isLoadingBox}
				renderExchange={this.renderExchange}
				renderTitle={this.renderTitle}
				renderInfo={this.renderInfo}
				item={item}
				isDisabled={isDisabled}
			/>
		);
		return (
			<View style={{ flex: 1 }}>
				{this.renderExchange()}
				{this.renderTitle(item, isDisabled)}
				{this.renderInfo(item, isDisabled)}
			</View>
		);
	}

	onPress(data) {
		const { isDisableShowNewDetail } = this.props;
		if (isDisableShowNewDetail) return;
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
	rowRenderer = this.rowRenderer.bind(this);
	rowRenderer(type, data, index) {
		return (
			<View
				style={{
					paddingHorizontal: 8
				}}
			>
				{this.renderItemSeparatorComponent()}
				<RowNew
					handleShowDetailNews={this.props.handleShowDetailNews}
					item={data}
					index={index}
					key={`row_new#${index}`}
				/>
			</View>
		);
	}
	renderRow({ item, index }) {
		const onPress = () => this.onPress(item);
		const isDisabled = Controler.getLiveNewStatus()
			? false
			: this.compareTimeOpenLink(item);
		return (
			<View
				style={{
					paddingHorizontal: 8
				}}
			>
				{/* {this.renderItemSeparatorComponent()} */}
				<RowNew
					isLoadingSymbol={this.state.isLoadingSymbol}
					handleShowDetailNews={this.handleShowNewDetail}
					item={item}
					index={index}
					key={`row_new#${index}`}
				/>
			</View>
		);
	}

	renderEmpty() {
		return (
			<View
				onLayout={this.props.onLayout}
				style={{
					paddingHorizontal: 16,
					height: 205,
					alignItems: 'center',
					justifyContent: 'center'
					// backgroundColor: CommonStyle.backgroundColor
				}}
			>
				<Text
					style={{
						color: CommonStyle.fontColor,
						fontFamily: CommonStyle.fontPoppinsRegular
					}}
				>
					{I18n.t('noData')}
				</Text>
			</View>
		);
	}
	handleShowNewDetail = this.handleShowNewDetail.bind(this);
	handleShowNewDetail(dataNews) {
		const { isDisableShowNewDetail } = this.props;
		if (isDisableShowNewDetail) return;
		const { navigator } = this.props;
		const error = NewDetailController.getNewsError(dataNews);
		return getInfoAndShowNewDetail({ dataNews, navigator, error });
	}
	loadMore = this.loadMore.bind(this);
	loadMore() {
		const { symbol } = this.props;
		this.setState({
			isLoadingNews: true
		});
		setTimeout(() => {
			this.props.getSnapshot(symbol);
		}, 100);
	}
	renderFooter = this.renderFooter.bind(this);
	renderFooter() {
		const { isMoreNews } = this.props;
		const { isLoadingNews } = this.state;
		if (isLoadingNews) {
			return (
				<View
					style={{
						backgroundColor: CommonStyle.color.bg,
						width: '100%',
						height: 50,
						justifyContent: 'center',
						alignItems: 'center'
					}}
				>
					<ProgressBar color={CommonStyle.fontWhite} />
				</View>
			);
		} else if (!isMoreNews) return null;
		else {
			return (
				<TouchableOpacity
					style={{ marginLeft: 16, marginTop: 8 }}
					onPress={this.loadMore}
				>
					<Text
						style={{
							fontFamily: CommonStyle.fontPoppinsRegular,
							fontSize: CommonStyle.font13,
							color: CommonStyle.color.modify
						}}
					>
						{I18n.t('more')}
					</Text>
				</TouchableOpacity>
			);
		}
	}
	render() {
		const { listNewsData, style } = this.props;
		if (_.isEmpty(listNewsData)) return this.renderEmpty();
		const data = _.values(listNewsData);
		// const arrData = _.values(listNewsData);
		// const data = _.take(arrData, 10);

		return (
			<FlatList
				scrollEnabled={false}
				onLayout={this.props.onLayout}
				style={[
					{
						paddingVertical: 8
						// backgroundColor: CommonStyle.backgroundColor1
					},
					style
				]}
				data={data}
				renderItem={this.renderRow}
				ListFooterComponent={this.renderFooter}
				ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
			/>
		);
	}
}

const mapStateToProps = (state) => ({
	isLoading: state.searchNews.isLoadingNews,
	isConnected: state.app.isConnected,
	listNewsData: state.searchNews.listNews,
	isMoreNews: state.searchNews.isMoreNews
});

const mapDispatchToProps = (dispatch) => ({
	resetPageSizeNews: (...p) =>
		dispatch(SearchNewActions.resetPageSizeNews(...p)),
	getSnapshot: (...p) => dispatch(SearchNewActions.getNewData(...p)),
	resetNewData: (...p) => dispatch(SearchNewActions.resetNewData(...p)),
	updateAffectedSymbol: (...p) =>
		dispatch(NewsAction.updateAffectedSymbol(...p))
});
export default connect(mapStateToProps, mapDispatchToProps)(WatchListSearchNew);

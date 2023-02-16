import React, { PureComponent } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
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

export class SearchNewWithoutLogin extends PureComponent {
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

	render() {
		const isLogged = Controller.getLoginStatus();
		const { lang } = this.props.setting;
		if (!isLogged) {
			return <SearchNewWithoutLogin language={lang} />;
		}

		const { listNewsData, navigator, isLoading } = this.props;
		const hadRole = RoleUser.checkRoleByKey(
			Enum.ROLE_DETAIL.VIEW_NEWS_OF_SYMBOL_UNIVERSALSEARCH
		);
		if (_.isEmpty(listNewsData) || !hadRole) {
			return <ListEmpty language={lang} />;
		}

		const result = [];
		return (
			<LoadingComp isLoading={isLoading}>
				<FlatList
					data={_.values(listNewsData)}
					renderItem={({ item, index }) => (
						<Row data={item} index={index} navigator={navigator} />
					)}
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

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import Animated from 'react-native-reanimated'

import SearchNewActions from './search_new.reducer';
import I18n from '~/modules/language/';
import Enum from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as Controler from '~/memory/controller';
import FlatList from '~s/watchlist/Animator/FLatListAni'
import Row from './search_new.row'

const {
	block,
	call,
	cond,
	eq
} = Animated;

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

		const { actived } = props
		this.listenerActivedChange = block([
			cond(
				eq(actived, 2),
				call([], () => this._list && this._list.start()),
				call([], () => this._list && this._list.hide())
			)
		])
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

	renderRow({ item }) {
		return <Row
			data={item}
			isConnected={this.props.isConnected}
			navigator={this.props.navigator} />
	}

	setRef = this.setRef.bind(this)
	setRef(sef) {
		this._list = sef
	}

	renderFooter = this.renderFooter.bind(this)
	renderFooter() {
		return (
			<Animated.Code exec={this.listenerActivedChange} />
		)
	}

	render() {
		const { listNewsData } = this.props;
		const data = _.values(listNewsData);

		if (_.isEmpty(data)) {
			return (
				<View
					style={{
						paddingHorizontal: 16,
						height: 205,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: CommonStyle.backgroundColor
					}}
				>
					<Text style={{ color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>
						{I18n.t('noData')}
					</Text>
				</View>
			);
		}
		return (
			<FlatList
				animation={'fadeInRight'}
				ref={this.setRef}
				scrollEnabled={false}
				numberListDelay={1}
				withoutDidmount
				contentContainerStyle={{ padding: 16 }}
				data={data}
				onLayout={this.props.onLayout}
				renderItem={this.renderRow}
				ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
				ListFooterComponent={this.renderFooter}
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

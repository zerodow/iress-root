import React, { PureComponent } from 'react';
import {
	View,
	TouchableWithoutFeedback,
	Text,
	LayoutAnimation
} from 'react-native';
import { connect } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import I18n from '~/modules/language';
import SCREEN from '../screenEnum';
import { Icon } from '../Component/Icon';
import styles from '~s/news/style/news_search';
import SearchBarCommon from '~/component/search_bar/search_bar';
import {
	showSearchCodeModal2,
	showSearchWatchlistModal
} from '~/navigation/controller.1';
import * as setTestId from '~/constants/testId';
import WatchListActions from '../reducers';
import CommonStyle, { register } from '~/theme/theme_controller';

class SearchBar extends PureComponent {
	onPress = this.onPress.bind(this);
	onPress() {
		const { screenSelected, typePriceBoard, setScreenActive } = this.props;
		switch (screenSelected) {
			// case SCREEN.WATCHLIST:
			// 	LayoutAnimation.easeInEaseOut();
			// 	setScreenActive(SCREEN.SEARCH_WATCHLIST);
			// 	break;
			case SCREEN.EDIT_WATCHLIST:
				// Timeout fix crash not stop clock after delete code
				setTimeout(() => {
					setScreenActive(SCREEN.SEARCH_WATCHLIST, { fromScreen: screenSelected, typePriceBoard })
				}, 100)
				break;
			case SCREEN.CATEGORIES_WATCHLIST:
			case SCREEN.SELECT_WATCHLIST:
				// Timeout fix crash not stop clock after delete code
				setTimeout(() => {
					setScreenActive(SCREEN.SEARCH_PRIBOARD, { fromScreen: screenSelected, typePriceBoard })
				}, 100)
				break;
			default:
				break;
		}
	}

	getSearchTitle() {
		const { screenSelected } = this.props;
		switch (screenSelected) {
			case SCREEN.WATCHLIST:
			case SCREEN.EDIT_WATCHLIST:
				return I18n.t('findSymbol');
			case SCREEN.CATEGORIES_WATCHLIST:
			case SCREEN.SELECT_WATCHLIST:
				return I18n.t('findWatchlist');
			default:
				return '';
		}
	}

	renderWithBorder(searchTitle) {
		return (
			<SearchBarCommon
				placeHolderStyle={{ opacity: 0.5 }}
				prStype={{
					backgroundColor: undefined,
					borderBottomWidth: 0,
					borderTopWidth: 0,
					paddingLeft: 0,
					paddingRight: 0
				}}
				onShowModalSearch={this.onPress}
				title={searchTitle}
				{...setTestId.testProp(`Id_NewsSearchBar`, `Label_NewsSearchBar`)}
			/>
		);
	}

	render() {
		const searchTitle = this.getSearchTitle();
		const { isBorder } = this.props;
		if (isBorder) return this.renderWithBorder(searchTitle);
		return (
			<TouchableWithoutFeedback onPress={this.onPress}>
				<View
					style={{
						height: 42,
						flexDirection: 'row',
						alignItems: 'center',
						borderRadius: 8,
						marginVertical: 8,
						backgroundColor: CommonStyle.searchInputBgColor2,
						flex: 1
					}}
				>
					<Icon
						name="ios-search"
						size={17}
						color={CommonStyle.fontColor}
						style={{ paddingLeft: 8 }}
					/>
					<View style={{ flex: 1, paddingHorizontal: 8 }}>
						<Text
							style={{
								fontSize: CommonStyle.fontSizeXS,
								fontFamily: CommonStyle.fontPoppinsRegular,
								color: CommonStyle.searchPlaceHolderColor
							}}
						>
							{searchTitle}
						</Text>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

const mapStateToProps = state => {
	const {
		screenSelected,
		screenParams
	} = state.watchlist3
	const { textFontSize } = state.setting
	const { typePriceBoard } = screenParams[screenSelected] || {}
	return ({
		screenSelected,
		typePriceBoard,
		textFontSize
	})
}

const mapDispatchToProps = dispatch => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SearchBar);

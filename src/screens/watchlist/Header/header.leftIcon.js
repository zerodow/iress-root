import React, { PureComponent } from 'react';
import { LayoutAnimation, UIManager, View } from 'react-native';
import { connect } from 'react-redux';

import Icon from '~/component/headerNavBar/icon';
import SCREEN from '../screenEnum';
import WatchListActions from '../reducers';
import I18n from '~/modules/language';
import Icon2 from '~/screens/watchlist/Component/Icon2.js'
import CommonStyle from '~/theme/theme_controller';
if (UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

class HeaderLeftIcon extends PureComponent {
	openMenu = this.openMenu.bind(this);
	openMenu() {
		const { navigator } = this.props;
		if (navigator) {
			navigator.toggleDrawer({
				side: 'left',
				animated: true
			});
		}
	}

	goToCategories = this.goToCategories.bind(this);
	goToCategories() {
		LayoutAnimation.easeInEaseOut();
		this.props.setScreenActive(SCREEN.CATEGORIES_WATCHLIST, { fromScreen: SCREEN.SELECT_WATCHLIST });
	}

	goToWatchList = this.goToWatchList.bind(this);
	goToWatchList() {
		LayoutAnimation.easeInEaseOut();
		this.props.setScreenActive(SCREEN.WATCHLIST);
	}

	getContent() {
		let content = null;
		switch (this.props.screenSelected) {
			case SCREEN.WATCHLIST:
				content = (
					<View style={{ alignSelf: 'flex-start' }}>
						<Icon2
							color={CommonStyle.fontColor}
							size={36}
							name="noun_menu"
							onPress={this.openMenu}
							hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
						// style={{
						// 	alignSelf: 'center'
						// }}
						/>
						{/* <Icon
							name="ios-menu"
							onPress={this.openMenu}
							size={34} /> */}
					</View>
				);
				break;
			case SCREEN.SELECT_WATCHLIST:
				content = (
					<Icon name="ios-arrow-back" onPress={this.goToCategories} />
				);
				break;
			case SCREEN.EDIT_WATCHLIST:
			case SCREEN.ADD_WATCHLIST:
			case SCREEN.CATEGORIES_WATCHLIST:
				content = (
					<Icon name="ios-arrow-back" onPress={this.goToWatchList} />
				);
				break;
			default:
				break;
		}
		return content;
	}

	render() {
		const content = this.getContent();
		return <View style={{ marginHorizontal: 8 }}>{content}</View>;
	}
}

const mapStateToProps = state => ({
	screenSelected: state.watchlist3.screenSelected
});

const mapDispatchToProps = dispatch => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(HeaderLeftIcon);

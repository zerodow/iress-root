import React, { PureComponent } from 'react';
import { View, LayoutAnimation, ActivityIndicator, Platform } from 'react-native';
import { connect } from 'react-redux';

import SCREEN from '../screenEnum';
import * as Controller from '~/memory/controller';
import { func } from '~/storage';
import * as RoleUser from '~/roleUser';
import Enum from '~/enum';
import WatchListActions from '../reducers';
import { Icon } from '../Component/Icon';
import I18n from '~/modules/language';
import CommonStyle, { register } from '~/theme/theme_controller';

const { FAVORITES } = Enum.TYPE_PRICEBOARD;

export class HeaderIcon extends PureComponent {
	constructor(props) {
		super(props);
		this.openMenu = this.openMenu.bind(this);
		this.goToWatchList = this.goToWatchList.bind(this);
		this.onPressEdit = this.onPressEdit.bind(this);
		this.onPressList = this.onPressList.bind(this);
		this.goToCategories = this.goToCategories.bind(this);
		this.goBack = this.goBack.bind(this);
		this.onNext = this.onNext.bind(this);
	}

	getRightButton() {
		const arr = [];
		const isStreamer = Controller.isPriceStreaming();
		const isLogin = Controller.getLoginStatus();
		const isStatic = func.checkCurrentPriceboardIsStatic(
			this.props.priceBoardSelected
		);
		const hadRole = RoleUser.checkRoleByKey(
			Enum.ROLE_DETAIL.C_E_R_WATCHLIST
		);

		if (this.props.isLoading) {
			return (
				<ActivityIndicator
					style={{ width: 24, height: 24 }}
					color={this.props.color || CommonStyle.fontColor}
				/>
			);
		}

		if (isLogin && !isStatic && hadRole) {
			arr.push(
				<Icon
					name="ios-create-outline"
					key={'create'}
					onPress={this.onPressEdit}
				/>
			);
		}

		arr.push(
			<View style={{ marginLeft: 16 }} key={'list'}>
				<Icon name="ios-list" onPress={this.onPressList} />
			</View>
		);

		if (!isStreamer) {
			content = (
				<Icon
					name="ios-refresh-outline"
					onPress={this.props.onRefresh}
				/>
			);
			arr.push(
				<View style={{ marginLeft: 16 }} key={'refresh'}>
					{content}
				</View>
			);
		}

		return arr;
	}

	openMenu() {
		const { navigator } = this.props;
		if (navigator) {
			navigator.toggleDrawer({
				side: 'left',
				animated: true
			});
		}
	}

	onPressEdit() {
		LayoutAnimation.easeInEaseOut();
		this.props.setScreenActive(SCREEN.EDIT_WATCHLIST);
	}

	onPressList() {
		LayoutAnimation.easeInEaseOut();
		const { typePriceBoard } = this.props;

		if (typePriceBoard === FAVORITES) {
			this.props.setScreenActive(SCREEN.CATEGORIES_WATCHLIST);
		} else {
			this.props.setScreenActive(SCREEN.SELECT_WATCHLIST);
		}
	}

	goToWatchList() {
		LayoutAnimation.easeInEaseOut();
		this.props.setScreenActive(SCREEN.WATCHLIST);
	}

	goToCategories() {
		LayoutAnimation.easeInEaseOut();
		this.props.setScreenActive(SCREEN.CATEGORIES_WATCHLIST);
	}

	goBack() {
		LayoutAnimation.easeInEaseOut();
		const { preScreen } = this.props.params || {};
		this.props.setScreenActive(preScreen || SCREEN.WATCHLIST);
	}

	onNext() {
		const { createPriceboard } = this.props.params;
		createPriceboard && createPriceboard();
		this.onPressEdit();
	}

	render() {
		const { canAdd } = this.props.params || {};
		switch (this.props.screenSelected) {
			case SCREEN.WATCHLIST:
				return (
					<React.Fragment>
						<Icon name="ios-menu" onPress={this.openMenu} />
						<View style={{ flex: 1 }} />
						{this.getRightButton()}
					</React.Fragment>
				);
			case SCREEN.CATEGORIES_WATCHLIST:
				return (
					<React.Fragment>
						<View style={{ flex: 1 }} />
						<Icon
							title={I18n.t('close')}
							onPress={this.goToWatchList}
						/>
					</React.Fragment>
				);
			case SCREEN.SELECT_WATCHLIST:
				return (
					<React.Fragment>
						<Icon
							name="ios-arrow-back"
							title={I18n.t('categories')}
							onPress={this.goToCategories}
						/>
						<View style={{ flex: 1 }} />
						<Icon title={'Close'} onPress={this.goToWatchList} />
					</React.Fragment>
				);
			case SCREEN.EDIT_WATCHLIST:
				return (
					<Icon name="ios-arrow-back" onPress={this.goToWatchList} />
				);

			case SCREEN.ADD_WATCHLIST:
				return (
					<React.Fragment>
						<Icon
							name="ios-arrow-back"
							onPress={this.goToWatchList}
						/>
						<View style={{ flex: 1 }} />
						<Icon
							title={'Next'}
							onPress={this.onNext}
							isDisable={!canAdd}
						/>
					</React.Fragment>
				);
			default:
				return null;
		}
	}
}

const mapStateToProps = state => {
	const {
		priceBoardSelected,
		typePriceBoard,
		screenSelected,
		screenParams,
		isLoading
	} = state.watchlist3;

	return {
		isLoading,
		priceBoardSelected,
		typePriceBoard,
		screenSelected,
		params: screenParams[screenSelected]
	};
};

const mapDispatchToProps = dispatch => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(HeaderIcon);

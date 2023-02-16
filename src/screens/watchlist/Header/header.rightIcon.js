import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { LayoutAnimation, UIManager, View } from 'react-native';

import Icon from '~/component/headerNavBar/icon';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SCREEN from '../screenEnum';
import { func, dataStorage } from '~/storage';
import * as Controller from '~/memory/controller';
import * as RoleUser from '~/roleUser';
import Enum from '~/enum';
import WatchListActions from '../reducers';
import I18n from '~/modules/language';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import CommonStyle from '~/theme/theme_controller';
import * as setTestId from '~/constants/testId';
import Icon2 from '../Component/Icon2';
import SortActions from './header.sort';
const RightAni = (props) => (
	<View
		{...props}
		style={{
			position: 'absolute',
			flexDirection: 'row',
			right: 16,
			opacity: props.isSelected ? 1 : 0,
			transform: [{ translateX: props.isSelected ? 0 : 100 }]
		}}
	/>
);

const { FAVORITES } = Enum.TYPE_PRICEBOARD;

class HeaderRightIcon extends PureComponent {
	// componentDidUpdate(prevProps, prevState) {
	//     if (this.props.screenSelected !== prevProps.screenSelected) {
	//         if (this.props.animator[this.props.screenSelected]) {
	//             this.props.animator[this.props.screenSelected].start();
	//         }
	//         if (this.props.animator[prevProps.screenSelected]) {
	//             this.props.animator[prevProps.screenSelected].start();
	//         }
	//     }
	// }

	onPressEdit = this.onPressEdit.bind(this);
	onPressEdit() {
		const nextScreenObj = {
			screen: 'equix.EditWatchList',
			backButtonTitle: ' ',
			animated: true,
			animationType: 'slide-horizontal',
			passProps: {},
			navigatorStyle: CommonStyle.navigatorSpecial
		};

		return this.props.navigator.push(nextScreenObj);
		this.props.setScreenActive(SCREEN.EDIT_WATCHLIST);
	}

	onPressList = this.onPressList.bind(this);
	onPressList() {
		const { navigator, changeAllowUnmount } = this.props;
		const screen = 'equix.CategoriesWL';
		changeAllowUnmount && changeAllowUnmount(false);
		dataStorage &&
			dataStorage.functionSnapToClose &&
			dataStorage.functionSnapToClose();
		navigator &&
			navigator.push({
				screen,
				navigatorStyle: {
					disabledBackGesture: true,
					...CommonStyle.navigatorSpecialNoHeader
				},
				passProps: {
					priceBoardSelected: this.props.priceBoardSelected
				},
				animated: true,
				animationType: 'slide-horizontal'
			});

		// reset data
		dataStorage.functionSnapToClose = () => { }
	}

	onSearch = this.onSearch.bind(this);
	onSearch() {
		const { setScreenActive, screenSelected } = this.props;
		setScreenActive(SCREEN.SEARCH_WATCHLIST, {
			fromScreen: screenSelected
		});
	}

	getRightButton() {
		const { priceBoard, priceBoardSelected, isLoadingErrorSystem } = this.props;
		const isLogin = Controller.getLoginStatus();
		const isIress =
			priceBoard &&
			priceBoardSelected &&
			priceBoard[priceBoardSelected] &&
			priceBoard[priceBoardSelected].isIress;
		const hadRole = RoleUser.checkRoleByKey(
			Enum.ROLE_DETAIL.C_E_R_WATCHLIST
		);

		let addWatchlistComp = null;

		if (isLogin && !isIress && hadRole) {
			addWatchlistComp = (
				<Icon2
					color={CommonStyle.fontColor}
					size={22}
					name="add"
					onPress={this.onPressEdit}
					style={{
						alignSelf: 'center'
					}}
				/>
			);
		}

		return (
			<React.Fragment>
				{/* {addWatchlistComp} */}
				<View style={{ marginLeft: 32 }} key={'circle'}>
					<TouchableOpacityOpt
						disabled={isLoadingErrorSystem}
						timeDelay={Enum.TIME_DELAY}
						onPress={this.onPressList}
						hitSlop={{
							top: 16,
							left: 16,
							bottom: 16,
							right: 16
						}}
						{...setTestId.testProp(
							`Id_test_list_wl`,
							`Label_test_list_wl`
						)}
					>
						<Icon2
							color={isLoadingErrorSystem ? CommonStyle.fontNearLight6 : CommonStyle.fontColor}
							size={23}
							name="noun_Book"
						/>
					</TouchableOpacityOpt>
				</View>
				{/* <View
                    style={{ marginLeft: 32, justifyContent: 'center' }}
                    key={'list'}
                >
                    <SortActions
                        showModal={this.props.showModal}
                        closeModal={this.props.closeModal}
                    />
                </View> */}
			</React.Fragment>
		);
	}

	goToWatchList = this.goToWatchList.bind(this);
	goToWatchList() {
		this.props.setScreenActive(SCREEN.WATCHLIST);
	}

	onNext = this.onNext.bind(this);
	onNext() {
		const { createPriceboard } = this.props.params;
		createPriceboard && createPriceboard();
		this.onPressEdit();
	}

	getContent() {
		let content = null;
		const { canAdd } = this.props.params || {};

		switch (this.props.screenSelected) {
			case SCREEN.WATCHLIST:
				content = this.getRightButton();
				break;
			case SCREEN.CATEGORIES_WATCHLIST:
				content = (
					<Icon
						textFontSize={this.props.textFontSize}
						title={I18n.t('close')}
						onPress={this.goToWatchList}
					/>
				);
				break;
			case SCREEN.SELECT_WATCHLIST:
				content = <Icon title={'Close'} onPress={this.goToWatchList} />;
				break;

			case SCREEN.ADD_WATCHLIST:
				content = (
					<Icon
						title={'Next'}
						onPress={this.onNext}
						isDisable={!canAdd}
					/>
				);
				break;
			default:
				content = <Icon title={'ABC'} isDisable />;
				break;
		}
		return content;
	}

	render() {
		const { canAdd } = this.props.params || {};
		const { screenSelected } = this.props;
		return (
			<React.Fragment>
				<View
					style={{ flexDirection: 'row', opacity: 0 }}
					pointerEvents="none"
				>
					{this.getContent()}
				</View>
				<RightAni isSelected={screenSelected === SCREEN.WATCHLIST}>
					{this.getRightButton()}
				</RightAni>
				<RightAni
					isSelected={screenSelected === SCREEN.CATEGORIES_WATCHLIST}
				>
					<Icon
						textFontSize={this.props.textFontSize}
						title={I18n.t('close')}
						onPress={this.goToWatchList}
					/>
				</RightAni>
				<RightAni
					isSelected={screenSelected === SCREEN.SELECT_WATCHLIST}
				>
					<Icon
						textFontSize={this.props.textFontSize}
						title={'Close'}
						onPress={this.goToWatchList}
					/>
				</RightAni>
				<RightAni isSelected={screenSelected === SCREEN.ADD_WATCHLIST}>
					<Icon
						textFontSize={this.props.textFontSize}
						title={'Next'}
						onPress={this.onNext}
						isDisable={!canAdd}
					/>
				</RightAni>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	const {
		typePriceBoard,
		screenSelected,
		screenParams,
		priceBoard
	} = state.watchlist3;
	const { textFontSize } = state.setting;
	const { priceBoardSelected } = state.priceBoard;
	return {
		priceBoard,
		priceBoardSelected,
		typePriceBoard,
		screenSelected,
		params: screenParams[screenSelected],
		textFontSize,
		isLoadingErrorSystem: state.errorSystem.isLoadingErrorSystem
	};
};

const mapDispatchToProps = (dispatch) => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(HeaderRightIcon);

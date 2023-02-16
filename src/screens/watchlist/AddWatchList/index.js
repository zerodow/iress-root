import React, { PureComponent } from 'react';
import {
	View,
	Text,
	TextInput,
	KeyboardAvoidingView,
	UIManager,
	LayoutAnimation
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import CONFIG from '~/config';
import CommonStyle from '~/theme/theme_controller';
import * as Util from '~/util';
import I18n from '~/modules/language';
import SCREEN from '../screenEnum';
import { dataStorage, func } from '~/storage';
import * as Business from '~/business';
import WatchListActions from '../reducers';

import FirstSubHeader from '../Component/FirstSubHeader';
import SecondSubHeader from '../Component/SecondSubHeader';
import SubHeader, { ConnectComp, ErrorComp } from '../Component/SubHeader';

if (UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}

export class AddWatchList extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			showError: false,
			errorInputPriceName: ''
		};
		this.watchlistName = '';
		this.onChangeText = this.onChangeText.bind(this);
	}

	componentDidMount() {
		this.props.setScreenActive(SCREEN.ADD_WATCHLIST, {
			canAdd: false,
			createPriceboard: () => this.createPriceboard()
		});
	}

	componentWillUpdate(nextProps, nextState) {
		if (
			this.props.isConnected !== nextProps.isConnected ||
			this.state.showError !== nextState.nextState
		) {
			LayoutAnimation.easeInEaseOut();
		}
	}

	moveToEditWatchList(id) {
		LayoutAnimation.easeInEaseOut();
		this.props.setScreenActive(SCREEN.EDIT_WATCHLIST);
	}

	createPriceboard() {
		if (this.state.errorInputPriceName) return;
		this.props.createPriceBoard({
			watchlistName: this.watchlistName,
			callback: (data) => {
				// func.setCurrentPriceboardId(data.watchlist);
				this.moveToEditWatchList(data);
			}
		});
	}

	checkDup(newText) {
		const { priceBoard, priceBoardSelected } = this.props;
		const { watchlist: priceBoardId } =
			priceBoard[priceBoardSelected] || {};

		return _.find(
			priceBoard,
			({ watchlist_name: WLName = '', watchlist }) =>
				WLName && WLName.toUpperCase() === newText.toUpperCase()
		);
	}

	onChangeText(text = '') {
		const newText = text.trim();
		let errorInputPriceName = '';

		if (!newText) {
			errorInputPriceName = I18n.t('watchlistRequiredWarning');
		}

		const isDup = this.checkDup(text);
		if (isDup) {
			errorInputPriceName = I18n.t('watchlistUniqueWarning');
		}

		if (errorInputPriceName === '') {
			this.watchlistName = newText;
			this.props.setScreenActive(SCREEN.ADD_WATCHLIST, {
				canAdd: newText !== ''
			});
		} else {
			this.props.setScreenActive(SCREEN.ADD_WATCHLIST, {
				canAdd: false
			});
		}

		this.setState({
			showError: !!errorInputPriceName,
			errorInputPriceName
		});

		if (errorInputPriceName) {
			if (this.timeoutError) {
				clearTimeout(this.timeoutError);
			}
			this.timeoutError = setTimeout(() => {
				this.setState({
					showError: false
				});
			}, 5000);
		}
	}

	renderNetworkWarning() {
		if (this.props.isConnected) return <View />;
		return (
			<SubHeader
				style={{ paddingTop: 4 }}
				zIndex={-9}
				bgAni={{
					backgroundColor: CommonStyle.color.network
				}}
			>
				<ConnectComp />
			</SubHeader>
		);
	}

	renderErrorInput() {
		if (!this.state.errorInputPriceName || !this.state.showError) {
			return <View />;
		}

		return (
			<SubHeader
				style={{ paddingTop: 4 }}
				zIndex={-10}
				bgAni={{
					backgroundColor: CommonStyle.color.error
				}}
			>
				<ErrorComp title={this.state.errorInputPriceName} />
			</SubHeader>
		);
	}

	renderHeader() {
		return (
			<React.Fragment>
				<FirstSubHeader />
				{this.renderNetworkWarning()}
				{this.renderErrorInput()}
			</React.Fragment>
		);
	}

	render() {
		const SwapComponent = Util.isIOS() ? KeyboardAvoidingView : View;
		const props = Util.isIOS() ? { behavior: 'padding' } : {};
		return (
			<React.Fragment>
				{this.renderHeader()}

				<SwapComponent style={{ flex: 1 }} {...props}>
					{/* {this.renderNetworkWarning()}
					{this.renderErrorInput()} */}

					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text
							style={{
								fontFamily: CommonStyle.fontPoppinsRegular,
								fontSize: CommonStyle.fontSizeS,
								color: CommonStyle.fontColor
							}}
						>
							{I18n.t('createWatchlistDesc')}
						</Text>
						<View style={{ height: 16 }} />
						<TextInput
							keyboardType={'default'}
							autoFocus={true}
							placeholder={I18n.t('createWatchlistPlaceholder')}
							placeholderTextColor={CommonStyle.fontGray2}
							// selectionColor={CommonStyle.fontColor}
							style={{
								width: '75%',
								fontSize: CommonStyle.font25,
								borderWidth: 0,
								marginHorizontal: 48,
								textAlign: 'center',
								color: CommonStyle.fontColor
							}}
							onChangeText={this.onChangeText}
							maxLength={100}
						/>
					</View>
				</SwapComponent>
			</React.Fragment>
		);
	}
	//  #endregion
}

const mapStateToProps = (state) => ({
	priceBoard: state.watchlist3.priceBoard,
	priceBoardSelected: state.watchlist3.priceBoardSelected,
	isConnected: state.app.isConnected,
	textFontSize: state.setting.textFontSize
});

const mapDispatchToProps = (dispatch) => ({
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p)),
	createPriceBoard: (...p) => dispatch.priceBoard.createPriceBoard(...p)
});

export default connect(mapStateToProps, mapDispatchToProps)(AddWatchList);

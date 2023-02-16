import React, { Component } from 'react';
import {
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	Platform,
	UIManager,
	LayoutAnimation
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import I18n from '~/modules/language';
import CONFIG from '~/config';
import * as Util from '~/util';
import * as Business from '~/business';
import { dataStorage, func } from '~/storage';
import WatchListActions from '../reducers';
import NotifyOrder from '~/component/notify_order/index';

import CommonStyle from '~/theme/theme_controller';

const { height: DEVICES_HEIGHT } = Dimensions.get('window');
if (Platform.OS === 'android') {
	if (UIManager.setLayoutAnimationEnabledExperimental) {
		UIManager.setLayoutAnimationEnabledExperimental(true);
	}
}
class ChangeNameComp extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showError: false,
			errorInputPriceName: '',
			isLoading: false
		};
		this.watchlistName = '';
	}

	renderCancelButton() {
		return (
			<TouchableOpacity
				onPress={() => {
					this.props.onCancel && this.props.onCancel();
				}}
				style={{
					flex: 1
				}}
			>
				<View
					style={{
						borderRadius: 100,
						borderWidth: 2,
						borderColor: CommonStyle.color.modify,
						paddingVertical: 10,
						alignItems: 'center'
					}}
				>
					<Text
						style={{
							fontFamily: CommonStyle.fontPoppinsRegular,
							color: CommonStyle.color.modify,
							fontSize: CommonStyle.font13
						}}
					>
						{I18n.t('cancel')}
					</Text>
				</View>
			</TouchableOpacity>
		);
	}

	renderOKButton() {
		const wrapperStyle = {
			borderRadius: 100,
			paddingVertical: 10,
			alignItems: 'center'
		};
		if (this.watchlistName && !this.state.errorInputPriceName) {
			wrapperStyle.borderWidth = 2;
			wrapperStyle.borderColor = CommonStyle.color.modify;
		} else {
			wrapperStyle.backgroundColor = `${CommonStyle.fontWhite}54`;
		}

		const textStyle = {
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.font13
		};
		if (this.watchlistName && !this.state.errorInputPriceName) {
			textStyle.color = CommonStyle.color.modify;
		} else {
			textStyle.color = CommonStyle.color.shadow;
		}

		let content = <Text style={textStyle}>{I18n.t('ok')}</Text>;
		if (this.state.isLoading) {
			content = <ActivityIndicator />;
		}

		return (
			<TouchableOpacity
				disabled={
					!this.watchlistName || !!this.state.errorInputPriceName
				}
				onPress={this.renamePriceboard}
				style={{
					flex: 1
				}}
			>
				<View style={wrapperStyle}>{content}</View>
			</TouchableOpacity>
		);
	}

	renderTitle() {
		return (
			<React.Fragment>
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font15,
						color: CommonStyle.fontWhite
					}}
				>
					{I18n.t('watchlistChangeTitle1')}
				</Text>

				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.font11,
						color: CommonStyle.fontWhite,
						opacity: 0.5,
						paddingTop: 8
					}}
				>
					{I18n.t('watchlistChangeTitle2')}
				</Text>
			</React.Fragment>
		);
	}

	renamePriceboard = this.renamePriceboard.bind(this);
	renamePriceboard() {
		if (this.state.errorInputPriceName) return;
		this.setState({
			isLoading: true
		});

		this.props.updatePriceBoard({
			watchlistName: this.watchlistName,
			callback: (data) => {
				func.setCurrentPriceboardId(data.watchlist);
				this.setState(
					{
						isLoading: false
					},
					() => this.props.onCancel && this.props.onCancel()
				);
			}
		});
	}

	createPriceboard = this.createPriceboard.bind(this);
	createPriceboard() {
		if (this.state.errorInputPriceName) return;
		this.setState({
			isLoading: true
		});
		this.props.createPriceBoard({
			watchlistName: this.watchlistName,
			callback: (data) => {
				func.setCurrentPriceboardId(data.watchlist);
				// this.moveToEditWatchList(data);
				this.setState(
					{
						isLoading: false
					},
					() => this.props.onCancel && this.props.onCancel()
				);
			}
		});
	}

	checkDup(newText) {
		const { priceBoard } = this.props;

		return _.find(
			priceBoard,
			({ watchlist_name: WLName = '' }) =>
				WLName && WLName.toUpperCase() === newText.toUpperCase()
		);
	}

	onChangeText = this.onChangeText.bind(this);
	onChangeText(text = '') {
		const newText = text.trim();
		let errorInputPriceName = '';

		const isDup = this.checkDup(text);
		if (isDup) {
			errorInputPriceName = I18n.t('watchlistUniqueWarning');
		}

		if (errorInputPriceName === '') {
			this.watchlistName = newText;
		}
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

	renderTextInput() {
		return (
			<View
				style={{
					backgroundColor: CommonStyle.color.dusk,
					borderRadius: 8,
					// height: 48,
					justifyContent: 'center',
					marginVertical: 24,
					paddingHorizontal: 16,
					width: '100%',
					paddingVertical: Platform.OS === 'android' ? 4 : 4
				}}
			>
				<TextInput
					keyboardType={'default'}
					autoFocus={true}
					placeholder={I18n.t('createWatchlistPlaceholder')}
					placeholderTextColor={CommonStyle.fontGray2}
					// selectionColor={CommonStyle.fontColor}
					underlineColorAndroid="transparent"
					style={{
						width: '100%',
						fontSize: CommonStyle.font25,
						borderWidth: 0,
						color: CommonStyle.fontColor,
						paddingVertical: 0
					}}
					onChangeText={this.onChangeText}
					maxLength={100}
				/>
			</View>
		);
	}

	renderError = this.renderError.bind(this);
	renderError() {
		if (this.state.errorInputPriceName) {
			return (
				<Text
					style={{
						fontFamily: CommonStyle.fontPoppinsRegular,
						fontSize: CommonStyle.fontSizeS,
						color: CommonStyle.color.error,
						textAlign: 'center'
					}}
				>
					{this.state.errorInputPriceName}
				</Text>
			);
		}
		return null;
	}

	render() {
		return (
			<TouchableOpacity
				activeOpacity={1}
				onPress={() => { }}
				style={{
					alignSelf: 'center',
					marginTop: DEVICES_HEIGHT / 5,
					width: '100%',
					paddingHorizontal: 18
				}}
			>
				<View
					style={{
						borderRadius: 8,
						backgroundColor: CommonStyle.color.dark,
						width: '100%',
						alignItems: 'center',
						paddingVertical: 16,
						paddingHorizontal: 24
					}}
				>
					{this.renderTitle()}
					{this.renderTextInput()}
					{this.renderError()}
					<View
						style={{
							flexDirection: 'row',
							marginTop: this.state.errorInputPriceName ? 16 : 0
						}}
					>
						{this.renderCancelButton()}
						<View style={{ width: 16 }} />
						{this.renderOKButton()}
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

const mapStateToProps = (state) => {
	const { priceBoardSelected, priceBoard } = state.watchlist3;
	return {
		priceBoard,
		priceBoardSelected
	};
};

const mapDispatchToProps = (dispatch) => ({
	updatePriceBoard: dispatch.priceBoard.updatePriceBoard,
	createPriceBoard: dispatch.priceBoard.createPriceBoard
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangeNameComp);

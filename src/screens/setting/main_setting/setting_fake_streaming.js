import React, { Component, PureComponent } from 'react';
import { View, Text, Dimensions, Animated, Platform } from 'react-native';
import I18n from '~/modules/language/index';
import SwitchButton from '~/screens/alert_function/components/SwitchButton';
import CommonStyle, { register, changeTheme } from '~/theme/theme_controller';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { dataStorage } from '~/storage';
import { Navigation } from 'react-native-navigation';
import ENUM from '~/enum';
import TransitionView from '~/component/animation_component/transition_view';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getKeyTranslate } from '~/invert_translate';
import * as Controller from '~/memory/controller';
import * as settingActions from '../setting.actions';
import * as loginActions from '~/screens/login/login.actions';
import * as ManageConnection from '~/manage/manageConnection';

class SettingTheme extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			theme: dataStorage.currentTheme,
			isFake: dataStorage.isFake
		};
	}

	renderSeperate = this.renderSeperate.bind(this);
	renderSeperate() {
		return (
			<View
				style={{
					height: 1,
					backgroundColor: CommonStyle.fontColorBorderNew,
					marginLeft: 16
				}}
			/>
		);
	}

	onDismissModal = this.onDismissModal.bind(this);
	onDismissModal() {
		Navigation.dismissModal({
			animation: true,
			animationType: 'none'
		});
	}

	onSelectTheme = this.onSelectTheme.bind(this);
	onSelectTheme(themeText) {
		const theme = getKeyTranslate(themeText);
		changeTheme(theme);
		Platform.OS === 'ios' && ManageConnection.reloadDrawer(theme);
		this.setState({
			theme
		});
		this.onDismissModal();
	}

	showModalTheme = this.showModalTheme.bind(this);
	showModalTheme() {
		const listTheme = [I18n.t('light'), I18n.t('dark')];
		const selectedTheme =
			this.state.theme === ENUM.THEME.LIGHT
				? I18n.t('light')
				: I18n.t('dark');
		this.themeRef.measure &&
			this.themeRef.measure((x, y, w, h, px, py) => {
				this.calMeasureThemeModal({ x, y, w, h, px, py });
				Navigation.showModal({
					screen: 'equix.PickerBottomV2',
					animated: true,
					animationType: 'none',
					navigatorStyle: {
						...CommonStyle.navigatorSpecialNoHeader,
						statusBarTextColorScheme:
							CommonStyle.statusBarTextScheme,
						screenBackgroundColor: 'transparent',
						modalPresentationStyle: 'overCurrentContext'
					},
					passProps: {
						title: '',
						textBtnCancel: '',
						listItem: listTheme,
						onCancel: this.onDismissModal,
						onPressBackdrop: this.onDismissModal,
						onSelect: this.onSelectTheme,
						top: this.top,
						height: this.height,
						value: selectedTheme
					}
				});
			});
	}

	calMeasureThemeModal = this.calMeasureThemeModal.bind(this);
	calMeasureThemeModal({ x, y, w, h, px, py }) {
		this.measureTheme = {
			x,
			y,
			w,
			h,
			px,
			py
		};
		this.top = h + py;
		this.height = h;
	}

	getValueThemes() {
		switch (this.state.theme) {
			case 'light':
				return 'Light';
			case 'dark':
				return 'Dark';
		}
	}

	onValueChange = this.onValueChange.bind(this);
	onValueChange() {
		this.setState(
			(p) => ({
				theme: p.theme,
				isFake: !p.isFake
			}),
			() => {
				dataStorage.isFake = this.state.isFake;
			}
		);
	}

	renderTheme = this.renderTheme.bind(this);
	renderTheme() {
		const { lang } = this.props.setting;
		return (
			<React.Fragment>
				<View
					testID=""
					// onPress={this.showModalTheme}
					setRef={(ref) => {
						if (ref) {
							this.themeRef = ref;
						}
					}}
					style={[
						CommonStyle.sectContent,
						{ justifyContent: 'space-between' }
					]}
				>
					<Text
						style={[CommonStyle.sectContentText, { width: '50%' }]}
					>
						{'Fake Streaming'}
					</Text>
					<View
						style={[
							{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'flex-end',
								width: '50%'
							}
						]}
					>
						<SwitchButton
							value={this.state.isFake}
							onValueChange={this.onValueChange}
							circleSize={24}
							barHeight={30}
							circleBorderWidth={0}
							backgroundActive={CommonStyle.fontColorSwitchTrue}
							backgroundInactive={CommonStyle.fontColorSwitchTrue}
							circleActiveColor={
								CommonStyle.fontColorButtonSwitch
							}
							circleInActiveColor={'#000000'}
							changeValueImmediately={true}
							changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
							innerCircleStyle={{
								alignItems: 'center',
								justifyContent: 'center'
							}} // style for inner animated circle for what you (may) be rendering inside the circle
							outerCircleStyle={{}} // style for outer animated circle
							renderActiveText={false}
							renderInActiveText={false}
							switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
							switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
							switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
							switchBorderRadius={16} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
						/>
					</View>
				</View>
				{this.renderSeperate()}
			</React.Fragment>
		);
	}

	render() {
		return this.renderTheme();
	}
}

function mapStateToProps(state) {
	return {
		setting: state.setting,
		tokenLogin: state.login.token,
		emailLogin: state.login.email,
		isConnected: state.app.isConnected
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(settingActions, dispatch),
		loginActions: bindActionCreators(loginActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingTheme);

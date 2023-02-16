import React, { PureComponent } from 'react';
import {
	View,
	StyleSheet,
	Platform,
	Text,
	Dimensions,
	TouchableOpacity
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import CommonStyle from '~/theme/theme_controller';
import * as FunctionUtil from '~/lib/base/functionUtil';
import IonIcons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import I18n from '~/modules/language/';
import { switchToTab } from '~/navigation/controller.1';
import { func, dataStorage } from '~/storage';
import * as setTestId from '~/constants/testId';
const { width: WIDTH_DEVICE, height: HEIGHT_DEVICE } = Dimensions.get('window');
const HEIGHT_TABBAR = 88;
const HEIGHT_TABS = HEIGHT_TABBAR - 30;

const svgColor = {
	tabColor: 'rgb(58, 66, 94)',
	bgColor: 'rgb(38, 43, 62)',
	iconColor: 'rgb(58, 66, 94)'
};

const ACTIVE_OPACITY_DEFAULT = 0.2;

export default class Tabs extends PureComponent {
	render() {
		const tabName = this.props.tabName || '';
		const iconName = this.props.iconName || '';
		const Icon = this.props.iconType || MaterialIcons;
		const selected = this.props.tabIndex === this.props.tabIndexSelected;
		if (!tabName) {
			return (
				<View
					style={[styles.container]}
					pointerEvents="box-none"
				></View>
			);
		}
		return (
			<TouchableOpacity
				style={styles.container}
				isDisable={this.props.isDisable}
				{...setTestId.testProp(this.props.idTest, this.props.labelTest)}
				activeOpacity={
					this.props.isDisable ? 1 : ACTIVE_OPACITY_DEFAULT
				}
				onPress={() => {
					if (this.props.isDisable) return;
					this.props.onPress && this.props.onPress();
				}}
			>
				{CommonStyle.icons[iconName] && CommonStyle.icons[iconName]({
					testID: `icon${tabName}`,
					size: 30,
					style: this.props.isDisable
									? CommonStyle.iconTabBarDisabled
									: selected
										? CommonStyle.iconTabBarSelected
										: CommonStyle.iconTabBar
					})}
				{/* <Icon
					testID={`icon${tabName}`}
					name={iconName}
					size={30}
					style={
						this.props.isDisable
							? CommonStyle.iconTabBarDisabled
							: selected
								? CommonStyle.iconTabBarSelected
								: CommonStyle.iconTabBar
					}
				/> */}

				<Text
					testID={`${tabName}`}
					allowFontScaling={false}
					style={
						this.props.isDisable
							? CommonStyle.textTabBarDisabled
							: selected
								? CommonStyle.textTabBarSelected
								: CommonStyle.textTabBar
					}
				>
					{I18n.t(tabName)}
				</Text>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: HEIGHT_TABS,
		backgroundColor: 'transparent'
	}
});

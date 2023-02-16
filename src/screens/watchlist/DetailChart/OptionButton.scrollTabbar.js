import React from 'react';
import { View, Text, ScrollView, Animated, I18nManager } from 'react-native';
import Button from 'react-native-scrollable-tab-view/Button';
import ScrollableTabBar from 'react-native-scrollable-tab-view/ScrollableTabBar';

import CommonStyle from '~/theme/theme_controller';
import { Icon } from '../Component/Icon';

export default class OptionCustomTabbar extends ScrollableTabBar {
	getInitialState() {
		return {
			...super.getInitialState(),
			settingHeight: 0
		};
	}

	renderTab1(name, page, isTabActive, onPressHandler, onLayoutHandler) {
		const textColor = isTabActive
			? CommonStyle.fontBlue1
			: CommonStyle.fontWhite;

		const fontFamily = isTabActive
			? CommonStyle.fontPoppinsBold
			: CommonStyle.fontPoppinsRegular;
		const opacity = isTabActive ? 1 : 0.5;

		return (
			<Button
				key={`${name}_${page}`}
				accessible={true}
				accessibilityLabel={name}
				accessibilityTraits="button"
				onPress={() => {
					this.props.onChange && this.props.onChange(name, page);
					onPressHandler(page);
				}}
				onLayout={onLayoutHandler}
			>
				<View
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						paddingVertical: 12,
						opacity,
						paddingHorizontal: 4
					}}
				>
					<Text
						style={{
							fontFamily: fontFamily,
							color: textColor,
							fontSize: CommonStyle.fontSizeXS
						}}
					>
						{name}
					</Text>
				</View>
			</Button>
		);
	}

	renderMainContent() {
		const tabUnderlineStyle = {
			position: 'absolute',
			height: 2,
			borderRadius: 2,
			backgroundColor: CommonStyle.fontBlue1,
			top: 0
		};

		const key = I18nManager.isRTL ? 'right' : 'left';
		const dynamicTabUnderline = {
			[`${key}`]: this.state._leftTabUnderline,
			width: this.state._widthTabUnderline
		};

		return (
			<View onLayout={this.onContainerLayout}>
				<ScrollView
					automaticallyAdjustContentInsets={false}
					ref={scrollView => {
						this._scrollView = scrollView;
					}}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					directionalLockEnabled={true}
					onScroll={this.props.onScroll}
					bounces={false}
					scrollsToTop={false}
				>
					<View>
						<View style={{ height: 1 }} />
						<View
							style={[
								{
									width: this.state._containerWidth,
									flexDirection: 'row',
									justifyContent: 'space-around',
									backgroundColor:
										CommonStyle.navigatorSpecial
											.navBarBackgroundColor3
								}
							]}
							ref={'tabContainer'}
							onLayout={this.onTabContainerLayout}
						>
							{this.props.tabs.map((name, page) => {
								const isTabActive =
									this.props.activeTab === page;
								return this.renderTab1(
									name,
									page,
									isTabActive,
									this.props.goToPage,
									this.measureTab.bind(this, page)
								);
							})}
						</View>
						<Animated.View
							style={[
								tabUnderlineStyle,
								dynamicTabUnderline,
								this.props.underlineStyle
							]}
						/>
					</View>
				</ScrollView>
			</View>
		);
	}

	onSettingLayout = this.onSettingLayout.bind(this);
	onSettingLayout(e) {
		const { height } = e.nativeEvent.layout;
		this.setState({
			settingHeight: height
		});
	}

	renderLeftContent() {
		return (
			<View style={{ height: '100%' }}>
				<View style={{ height: 1 }} />
				<View
					onLayout={this.onSettingLayout}
					style={{
						flex: 1,
						marginRight: 24,
						backgroundColor:
							CommonStyle.navigatorSpecial.navBarBackgroundColor3,
						paddingHorizontal: this.state.settingHeight / 2,
						borderTopRightRadius: this.state.settingHeight,
						borderBottomRightRadius: this.state.settingHeight,
						justifyContent: 'center'
					}}
				>
					<Icon
						name="md-settings"
						size={18}
						color={CommonStyle.fontSettingChart}
						onPress={this.props.onSetting}
					/>
				</View>
			</View>
		);
	}

	render() {
		return (
			<View style={{ flexDirection: 'row' }}>
				{this.props.renderRightContent &&
					this.props.renderRightContent()}
				<View style={{ flex: 1 }}>{this.renderMainContent()}</View>
				{this.renderLeftContent()}
			</View>
		);
	}
}

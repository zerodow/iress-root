import React, { PureComponent } from 'react';
import { View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBarDefault from 'react-native-underline-tabbar';
import _ from 'lodash';

import CommonStyle from '~/theme/theme_controller';

export default class ScrollBarUndeline extends PureComponent {
	constructor(props) {
		super(props);
		this.renderBar = this.renderBar.bind(this);
		this.defaultStyle = {
			wrapperStyle: {
				width: '100%',
				backgroundColor:
					CommonStyle.navigatorSpecial1.navBarBackgroundColor3
			},
			tabStyles: {
				paddingHorizontal: 4,
				marginLeft: 16,
				marginRight: 16
			},
			tabBarTextStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.fontSizeS,
				color: CommonStyle.fontColor
			},
			style: {
				borderBottomWidth: 0
			},
			activeTabTextStyle: {
				color: CommonStyle.fontBlue1,
				fontFamily: CommonStyle.fontPoppinsBold,
				fontSize: CommonStyle.fontSizeS
			}
		};
	}

	renderBar(listItem) {
		return listItem.map(e => {
			return (
				<View
					key={e.label}
					tabLabel={{ label: _.upperFirst(_.capitalize(e.label)) }}
				/>
			);
		});
	}

	onChangeTab(listItem, nextTab) {
		const { action, id } = listItem[nextTab];
		action && action(id);
	}

	render() {
		const { listItem } = this.props || [];
		return (
			<View
				style={[
					this.defaultStyle.wrapperStyle,
					this.props.wrapperStyle
				]}
			>
				<ScrollableTabView
					style={{ flex: 0 }}
					contentProps={{
						keyboardShouldPersistTaps: 'always'
					}}
					onChangeTab={tabInfo => {
						const { from, i } = tabInfo;
						this.onChangeTab(listItem, i);
					}}
					renderTabBar={() => (
						<TabBarDefault
							style={[this.defaultStyle.style, this.props.style]}
							tabStyles={{
								tab: [
									this.defaultStyle.tabStyles,
									this.props.tabStyles
								]
							}}
							tabBarTextStyle={[
								this.defaultStyle.tabBarTextStyle,
								this.props.tabBarTextStyle
							]}
							activeTabTextStyle={[
								this.defaultStyle.activeTabTextStyle,
								this.props.activeTabTextStyle
							]}
							underlineColor={CommonStyle.fontBlue1}
							underlineHeight={4}
							inactiveTextColor={CommonStyle.fontColor}
						/>
					)}
				>
					{this.renderBar(listItem)}
				</ScrollableTabView>
			</View>
		);
	}
}

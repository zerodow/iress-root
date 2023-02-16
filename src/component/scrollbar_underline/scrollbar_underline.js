import React, { PureComponent } from 'react';
import { View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from 'react-native-underline-tabbar';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '~/storage';

const Page = () => <View />;

const defaultUnderlineColor = '#44bbc3';

export default class ScrollBarUndeline extends PureComponent {
	constructor(props) {
		super(props);
		this.renderBar = this.renderBar.bind(this);
		this.defaultStyle = {
			wrapperStyle: {
				width: '100%',
				height: 47
			},
			tabStyles: {
				paddingHorizontal: 16,
				marginLeft: 0
			},
			tabBarTextStyle: {
				fontFamily: CommonStyle.fontPoppinsRegular,
				fontSize: CommonStyle.fontSizeS,
				color: CommonStyle.fontColor
			},
			style: {
				borderBottomColor: CommonStyle.fontBorderGray,
				borderBottomWidth: 1
			},
			activeTabTextStyle: {
				color: CommonStyle.color.modify,
				fontFamily: CommonStyle.fontPoppinsBold,
				fontSize: CommonStyle.fontSizeS
			}
		};
		this.state = {
			page: props.page || 0
		}
		this.resetPage = this.resetPage.bind(this)
	}

	renderBar(listItem) {
		return listItem.map(e => {
			return <Page key={e.label} tabLabel={{ label: e.label }} />;
		});
	}

	onChangeTab(listItem, nextTab) {
		const { action, id } = listItem[nextTab];
		action && action(id);
		this.setState({ page: nextTab })
	}

	setAnimationDirection = (from, to) => {
		if (from < to) {
			dataStorage.animationDirection = 'fadeInRight'
		} else if (from > to) {
			dataStorage.animationDirection = 'fadeInLeft'
		} else {
			dataStorage.animationDirection = 'fadeIn'
		}
	}

	resetPage() {
		this.setState({ page: 0 })
	}

	render() {
		const { listItem = [], initialPage = 0 } = this.props;
		return (
			<View style={[this.defaultStyle.wrapperStyle, this.props.wrapperStyle]}>
				<ScrollableTabView
					initialPage={initialPage}
					page={this.state.page}
					contentProps={{
						keyboardShouldPersistTaps: 'always'
					}}
					onChangeTab={tabInfo => {
						const { from, i } = tabInfo;
						console.log('dkm-onChangeTab', { from, i })
						this.setAnimationDirection(from, i)
						this.onChangeTab(listItem, i, from);
					}}
					renderTabBar={() => (
						<TabBar
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
							underlineColor={
								this.props.underlineColor ||
								defaultUnderlineColor
							}
							underlineHeight={
								this.props.underlineHeight || 2
							}
							underlineBottomPosition={
								this.props.underlineBottomPosition || 0
							}
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

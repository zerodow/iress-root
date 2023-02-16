import React, { PureComponent } from 'react';
import { View, StyleSheet, Platform, Text, Dimensions, Animated } from 'react-native';

import CommonStyle from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import * as FunctionUtil from '~/lib/base/functionUtil';

import Icon from './icon';

const SIZE = 35;
const { width } = Dimensions.get('screen')

/**
 * @description Render header for OM v2's UI.
 * List of optional props:
 * 1. renderLeftComp: left component, like back button
 * 2. renderContent: main title of the header
 * 3. renderRightComp: right component, like next button
 * 4. Styles:
 *  a. firstChildStyles: styles for first child component
 *  b. secondChildStyles: styles for second child component
 *  c. rootStyles: styles for upper header component
 *  d. childrenContainerStyles: styles for children's container
 *  e. style: styles for left component and title's container
 */
export default class HeaderNavBar extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			title: props.title || '',
			isHideRightComp: false
		};
		this.heightHeaderDefault = 0;
		this.setTitle = this.setTitle.bind(this);
		this.toggleDrawer = this.toggleDrawer.bind(this);
		this.props.setTitle && this.props.setTitle(this.setTitle);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.title !== nextProps.title) {
			this.state.title = nextProps.title;
		}
	}

	setTitle({ title, isHideRightComp }) {
		this.setState({ title, isHideRightComp });
	}

	toggleDrawer() {
		this.props.navigator &&
			this.props.navigator.toggleDrawer({
				side: 'left',
				animated: true
			});
	}

	renderLeftComp() {
		const { leftIcon, renderLeftComp } = this.props;
		let onLeftPress = () => { };
		if (renderLeftComp) {
			return renderLeftComp();
		} else {
			if ((leftIcon + '').includes('menu') && this.props.navigator) {
				onLeftPress = this.toggleDrawer;
			} else {
				onLeftPress = this.props.onLeftPress;
			}
			return (
				<View
					style={{
						width: 32,
						alignItems: 'flex-start',
						left: -8
					}}
				>
					<Icon name={leftIcon} onPress={onLeftPress} />
				</View>
			);
		}
	}
	renderContent() {
		const { title, renderContent } = this.props;
		if (renderContent) {
			return renderContent();
		} else {
			return <Text style={styles.title}
				ellipsizeMode='tail'
				numberOfLines={1} >{this.state.title}</Text>;
		}
	}
	renderRightComp() {
		const {
			rightIcon,
			onRightPress,
			rightTitle,
			renderRightComp
		} = this.props;
		if (renderRightComp) {
			return this.state.isHideRightComp ? null : renderRightComp();
		} else {
			return (
				<View
					style={{
						minWidth: 32
					}}
				>
					<Icon
						name={rightIcon}
						title={rightTitle}
						onPress={onRightPress}
					/>
				</View>
			);
		}
	}

	renderBackground(firstItem, secondItem) {
		if (!secondItem) return null;
		const newBG = this.props.bgAnim ? this.props.bgAnim.interpolate({
			inputRange: [0, 1],
			outputRange: ['#3a425e', this.props.secondChildStyles.backgroundColor || '#3a425e']
		}) : '#3a425e'
		return (
			<View
				style={[
					{
						position: 'absolute',
						width: '100%'
					}
				]}
			>
				<Animated.View style={[styles.secondBGColor, this.props.secondChildStyles, { backgroundColor: newBG }]}>
					<View style={{ opacity: 0 }}>{secondItem}</View>
				</Animated.View>

				<Animated.View
					style={[
						styles.firstChild,
						styles.secondBGColor,
						{
							left: 5,
							flexDirection: 'row'
						},
						this.props.firstChildStyles,
						{ backgroundColor: newBG }
					]}
				>
					<View style={{ opacity: 0 }}>{firstItem}</View>
				</Animated.View>
			</View>
		);
	}

	renderChild() {
		if (!this.props.children) return null;
		let firstItem = null;
		let secondItem = null;
		React.Children.forEach(this.props.children, (child, index) => {
			const content = child ? React.cloneElement(child) : null;
			if (index === 0) {
				firstItem = content;
			}

			if (index === 1) {
				secondItem = content;
			}
		});

		if (this.props.isFirstChild) {
			secondItem = firstItem;
			firstItem = this.renderDefaultHeader();
		}
		const newBG = this.props.bgAnim ? this.props.bgAnim.interpolate({
			inputRange: [0, 1],
			outputRange: ['#3a425e', this.props.secondChildStyles.backgroundColor || '#3a425e']
		}) : '#3a425e'
		return (
			<View>
				{this.renderBackground(firstItem, secondItem)}
				<View style={[styles.firstChild, this.props.firstChildStyles]}>
					{firstItem}
				</View>
				<View>
					<Animated.View
						style={[
							styles.secondBGColor,
							{
								height: '100%',
								position: 'absolute',
								width: 5
							},
							{ backgroundColor: newBG }
						]}>
					</Animated.View>
					{secondItem}
				</View>
			</View>
		);
	}

	renderDefaultHeader() {
		return (
			<View style={[styles.container, { ...this.props.style }]}>
				{this.renderLeftComp()}
				{this.renderContent()}
				<View
					style={[
						styles.leftComp,
						{
							borderColor: '#fff'
						},
						this.props.rightStyles
					]}
				>
					{this.renderRightComp()}
				</View>
			</View>
		);
	}

	onLayoutHeaderDefault({ nativeEvent: { layout } }) {
		this.heightHeaderDefault = layout.height
	}

	setHeightHeaderCb({ nativeEvent: { layout } }) {
		const heightHeader = layout.height + this.heightHeaderDefault;
		this.props.onLayout && this.props.onLayout(heightHeader)
	}

	render() {
		let content = null;
		if (!this.props.isFirstChild) {
			content = (
				<View onLayout={e => this.onLayoutHeaderDefault(e)} style={[styles.root, this.props.rootStyles]}>
					{this.renderDefaultHeader()}
				</View>
			);
		}
		return (
			<React.Fragment>
				{content}
				<View onLayout={e => this.setHeightHeaderCb(e)} style={this.props.childrenContainerStyles}>
					{this.renderChild()}
				</View>
			</React.Fragment>
		);
	}
}

const isIphone = Platform.OS === 'ios';
const isIphoneXorAbove = FunctionUtil.isIphoneXorAbove();
let marginTop = 0;
if (isIphone && isIphoneXorAbove) marginTop = 46;
if (isIphone && !isIphoneXorAbove) marginTop = 16;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
	root: {
		minHeight: SIZE,
		backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2
	},
	container: {
		flexDirection: 'row',
		marginTop,
		backgroundColor: 'transparent',
		alignItems: 'center'
	},
	title: {
		fontFamily: CommonStyle.fontPoppinsBold,
		fontSize: CommonStyle.fontSizeXXL,
		color: CommonStyle.navigatorSpecial.navBarSubtitleColor,
		width: width * 0.7
	},
	leftComp: {
		flex: 1,
		justifyContent: 'flex-end',
		flexDirection: 'row'
	},
	firstChild: {
		minHeight: SIZE,
		borderBottomRightRadius: CommonStyle.borderBottomRightRadius,
		overflow: 'hidden',
		paddingRight: SIZE,
		backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2
	},
	secondBGColor: {
		backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor3
	}
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

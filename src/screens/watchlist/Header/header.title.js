import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import I18n from '~/modules/language';

import CommonStyle from '~/theme/theme_controller';

class Title extends PureComponent {
	renderMainTitle(title) {
		const mainTitle = title || this.props.mainTitle;
		if (!mainTitle || mainTitle === '') return null;
		return (
			<Text
				style={{
					fontFamily: CommonStyle.fontMedium,
					fontWeight: '500',
					color: CommonStyle.navigatorSpecial.navBarTextColor,
					fontSize: CommonStyle.navigatorSpecial.navBarTextFontSize
				}}
			>
				{_.upperCase(mainTitle)}
			</Text>
		);
	}

	renderSubTitle() {
		const { subTitle } = this.props;
		if (!subTitle || subTitle === '') return null;
		return (
			<Text
				style={{
					fontFamily: CommonStyle.fontMedium,
					fontSize: CommonStyle.fontSizeS,
					color: CommonStyle.navigatorSpecial.navBarSubtitleColor
				}}
			>
				{this.props.subTitle}
			</Text>
		);
	}

	render() {
		return (
			<View
				style={{
					alignItems: 'center',
					justifyContent: 'center',
					position: 'absolute',
					width: '100%',
					height: '100%'
				}}
				pointerEvents="none"
			>
				{this.renderMainTitle()}
				{this.renderSubTitle()}
			</View>
		);
	}
}

const mapStateToProps = state => ({
	subTitle: state.watchlist3.subTitle,
	mainTitle: state.watchlist3.mainTitle
});

export default connect(mapStateToProps)(Title);

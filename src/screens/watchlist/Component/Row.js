import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
// const DEFAULT_COLOR = CommonStyle.fontColor;
const ACTIVED_COLOR = '#57e1f1';
const NEW_COLOR = '#359ee4';

export default class Row extends PureComponent {
	constructor(props) {
		super(props);
		this.DEFAULT_COLOR = CommonStyle.fontColor;
		this.color = this.DEFAULT_COLOR;
		this.setColor(props);
	}

	componentWillReceiveProps(nextProps) {
		this.setColor(nextProps);
	}

	setColor(props) {
		if (props.isActived) {
			this.color = ACTIVED_COLOR;
		} else {
			this.color = this.DEFAULT_COLOR;
		}
		if (props.isNewButton) {
			this.color = NEW_COLOR;
		}
	}

	render() {
		const { onPress, renderRightIcon, title } = this.props;
		return (
			<TouchableOpacity onPress={onPress}>
				<View
					style={{
						marginHorizontal: 16,
						padding: 16,
						flexDirection: 'row',
						backgroundColor:
							CommonStyle.navigatorSpecial.navBarBackgroundColor2,
						borderRadius: 8
					}}
				>
					<View style={{ flex: 1, justifyContent: 'center' }}>
						<Text
							style={{
								fontFamily: CommonStyle.fontPoppinsRegular,
								fontSize: CommonStyle.fontSizeS,
								color: this.color,
								paddingRight: 20
							}}
							numberOfLines={1}
						>
							{title}
						</Text>
					</View>
					<View
						style={{
							position: 'absolute',
							height: '100%',
							right: 16,
							top: 14,
							alignItems: 'center'
						}}
					>
						{renderRightIcon(this.color)}
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

Row.defaultProps = {
	onPress: () => null,
	renderRightIcon: () => null,
	title: ''
};

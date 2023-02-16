import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import * as Animatable from 'react-native-animatable';

import Enum from '../../enum';
import FlashingStyle from './flashing_style';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { formatNumberNew2 } from '../../lib/base/functionUtil';

const TrendEnum = {
	UP: 'UP',
	DOWN: 'DOWN'
};
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

class AniNumber extends PureComponent {
	render() {
		const {
			value,
			bgColor,
			textColor,
			typeFormRealtime,
			style
		} = this.props;
		const { animatedView, text: textStyle } =
			FlashingStyle[typeFormRealtime] || {};
		return (
			<Animatable.View
				ref={sef => this.props.setRef(sef)}
				style={[animatedView, { backgroundColor: bgColor, ...style }]}
				useNativeDriver
			>
				<Text
					style={[
						textStyle,
						{ color: textColor, textAlign: 'right' },
						this.props.textStyle
					]}
				>
					{value}
				</Text>
			</Animatable.View>
		);
	}
}

AniNumber.defaultProps = {
	setRef: () => null
};

export default class InternalFlashing extends React.Component {
	constructor(props) {
		super(props);
		this.trend = TrendEnum.UP;
	}
	shouldComponentUpdate(nextProps) {
		return !nextProps.isLoading;
	}

	// componentDidUpdate = () => {
	// 	this.startFlashing();
	// };

	componentWillReceiveProps = nextProps => {
		if (this.props.value < nextProps.value) {
			this.trend = TrendEnum.UP;
		}
		if (this.props.value > nextProps.value) {
			this.trend = TrendEnum.DOWN;
		}

		if (this.props.symbol !== nextProps.symbol || !this.props.value) {
			this.trend = TrendEnum.UP;
		}

		if (this.props.value !== nextProps.value && !nextProps.isLoading) {
			this.startFlashing();
		}
	};

	startFlashing() {
		const timming = this.props.timeFlashingr || Enum.TIME_FLASHING;
		if (this.fadeOutComp) {
			this.fadeOutComp.fadeOut(timming);
		}
		if (this.fadeInComp) {
			this.fadeInComp.fadeIn(timming);
		}
	}

	renderNoneValue() {
		const { defaultValue, typeFormRealtime } = this.props;
		const { text: textStyle } = FlashingStyle[typeFormRealtime] || {};
		let disValue = defaultValue || '--';
		if (defaultValue === '') {
			disValue = '';
		}
		return (
			<Text
				style={[
					textStyle,
					{
						paddingHorizontal: 4,
						textAlign: 'right'
					},
					this.props.textStyle
				]}
			>
				{disValue}
			</Text>
		);
	}

	render() {
		const { isStringValue } = this.props
		if (this.props.value || this.props.value === '') {
			const value = isStringValue
				? this.props.value
				: formatNumberNew2(
					this.props.value,
					PRICE_DECIMAL.SPECIFIC_PRICE
				);
			let color =
				this.trend === TrendEnum.UP
					? CommonStyle.fontGreen1
					: CommonStyle.fontRed1;
			if (value === '--') {
				color = CommonStyle.fontColor
			}
			const { typeFormRealtime, isFromWatchList } = this.props;

			const { text: textStyle } = FlashingStyle[typeFormRealtime] || {};

			const content = (
				<View>
					<Text
						style={[
							textStyle,
							{ textAlign: 'right', opacity: 0 },
							this.props.textStyle
						]}
					>
						{value}
					</Text>
					<AniNumber
						setRef={sef => (this.fadeOutComp = sef)}
						typeFormRealtime={typeFormRealtime}
						bgColor={color}
						textColor={'#fff'}
						value={value}
						style={{ opacity: 0 }}
						textStyle={this.props.textStyle}
					/>
					<AniNumber
						setRef={sef => (this.fadeInComp = sef)}
						typeFormRealtime={typeFormRealtime}
						bgColor={'transparent'}
						textColor={color}
						value={value}
						style={{ opacity: 1 }}
						textStyle={this.props.textStyle}
					/>
				</View>
			);
			if (isFromWatchList) return content;
			return <View style={{ flex: 1 }}>{content}</View>;
		}
		return this.renderNoneValue();
	}
}

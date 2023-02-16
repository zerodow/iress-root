import React from 'react';
import {
	View,
	ActivityIndicator,
	StyleSheet,
	Platform
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const ProgressBar = (props) => {
	const { style = {}, size = 'small' } = props
	return <View style={[styles.progressBar, style]}>
		{
			<ActivityIndicator
				size={size}
				style={[{ width: 24, height: 24 }]}
				color={props.color || CommonStyle.fontColor} />
		}
	</View>
}

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
		progressBar: {
			flex: 1,
			justifyContent: 'center'
		}
	});

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default ProgressBar;

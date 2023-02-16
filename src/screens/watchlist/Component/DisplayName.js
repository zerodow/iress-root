import React, { Component } from 'react';
import { Text, StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

let DisplayName = ({ title }) => (
    <Text style={styles.container} numberOfLines={1}>
        {title}
    </Text>
);

DisplayName = React.memo(DisplayName);

export default DisplayName;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.font15,
        color: CommonStyle.fontColor,
        paddingRight: 8
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

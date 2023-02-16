import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native'

import PropTypes from 'prop-types'
import CommonStyle from '~/theme/theme_controller';
const WrapperComponent = props => {
    const styles = {
        flex: 1,
        backgroundColor: CommonStyle.backgroundColor1
    };
    if (Platform.OS === 'ios') {
        return <View {...props} style={[styles, props.style]} />;
    } else {
        return (
            <KeyboardAvoidingView
                {...props}
                enabled={false}
                behavior="height"
                style={[styles, props.style]}
            />
        );
    }
};
WrapperComponent.propTypes = {}
WrapperComponent.defaultProps = {}
export default WrapperComponent

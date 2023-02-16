import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux';

const HandleDisableTouchabled = () => {
    const isLoadingCheckVetting = useSelector(state => state.newOrder.isloadingCheckVetting)
    return (
        <View pointerEvents={isLoadingCheckVetting ? 'box-only' : 'none'} style={[StyleSheet.absoluteFillObject, { zIndex: 999999999 }]} />
    );
}
HandleDisableTouchabled.propTypes = {};

export default HandleDisableTouchabled;

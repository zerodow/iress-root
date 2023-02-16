import React, { } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types'
import CommonStyle, { register } from '~/theme/theme_controller';
import I18n from '~/modules/language'
import { useSelector } from 'react-redux'
const Connecting = () => {
    const isConnected = useSelector(state => state.app.isConnected)
    if (isConnected) return null
    return (
        <View style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            alignItems: 'center',
            backgroundColor: CommonStyle.color.error
        }}>
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.font11,
                color: CommonStyle.fontColor
            }}>{`${I18n.t('connecting')}...`}</Text>
        </View>
    )
        ;
}
Connecting.propTypes = {};

export default Connecting;

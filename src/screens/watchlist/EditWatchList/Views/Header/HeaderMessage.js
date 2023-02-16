import React, { useEffect, useState, useCallback, useImperativeHandle } from 'react';
import { Text, View, StyleSheet, LayoutAnimation, UIManager } from 'react-native';
import PropTypes from 'prop-types'
import CommonStyle, { register } from '~/theme/theme_controller';
import I18n from '~/modules/language'
import { useSelector } from 'react-redux'
import { animate } from '~/screens/news_v3/helper/animation.js'
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const HeaderMessage = React.forwardRef((props, ref) => {
    const isConnected = useSelector(state => state.app.isConnected)
    const [text, setText] = useState('')
    useEffect(() => {
        if (!isConnected) {
            animate()
            setText(`${I18n.t('connecting')}...`)
        } else {
            // animate()
            setText('')
        }
    }, [isConnected])
    const showMessage = useCallback(({ msg, type }) => {
        animate()
        setText(msg)
    }, [])
    const hideMessage = useCallback(() => {
        animate()
        setText('')
    }, [])
    useImperativeHandle(ref, () => ({
        showMessage,
        hideMessage
    }), []);
    if (text === '') return null
    return (
        <View style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            alignItems: 'center',
            backgroundColor: CommonStyle.color.error,
            marginTop: 8
        }}>
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.font11,
                color: CommonStyle.fontDark
            }}>{text}</Text>
        </View>
    );
})
HeaderMessage.propTypes = {}
HeaderMessage.defaultProps = {}
export default HeaderMessage

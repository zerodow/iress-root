import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native'
import PropTypes from 'prop-types'
import { BoxCheck } from '~/component/add_and_search_symbol/Views/Content.js'
import CommonStyle, { register } from '~/theme/theme_controller';
import SvgIcon from '~/component/svg_icon/SvgIcon.js';
const listCode = [
    {
        code: 25001,
        message: 'No request ID was specified in the SOAP request parameters'
    },
    {
        code: 25002,
        message: 'The specified request ID was not found on the server'
    },
    {
        code: 25003,
        message: 'The request with the specified request ID has already ended'
    },
    {
        code: 25004,
        message: 'The request failed to be parsed correctly'
    },
    {
        code: 25006,
        message: 'The service session referenced in the request is no longer valid'
    }, {
        code: 25007,
        message: 'Maximum number of queued update rows has been reached (default 10,000 rows), the request has been forcibly ended'
    },
    {
        code: 25009,
        message: 'Invalid service session key specified'
    },

    {
        code: 25010,
        message: 'The bookmarks specified in the request failed to parse'
    },
    {
        code: 25011,
        message: 'Not allowed to create multiple service sessions to the same server'
    },
    {
        code: 25012,
        message: 'Invalid server name specified'
    },
    {
        code: 25013,
        message: 'No session key was provided in request'
    },
    {
        code: 25014,
        message: 'Invalid session key specified'
    },
    {
        code: 25015,
        message: 'Internal error, server is offline'
    },
    {
        code: 25016,
        message: 'Maximum number of active sessions reached (default 20,000 sessions), no more session can be created'
    },
    {
        code: 25017,
        message: 'Internal session allocation error'
    },
    {
        code: 25018,
        message: 'Invalid Iress session key or service session key specified'
    },
    {
        code: 25019,
        message: 'Invalid Iress session key or service session key specified'
    },
    {
        code: 25020,
        message: 'Login failed'
    },
    {
        code: 25021,
        message: 'Internal error, request is in use'
    },
    {
        code: 25022,
        message: 'Request cannot be made because user is not logged in'
    },
    {
        code: 25023,
        message: 'Internal error, request ID not found'
    },
    {
        code: 25024,
        message: 'The specified request ID was for a different request type'
    },

    {
        code: 25025,
        message: 'The request is no longer watching for updates'
    },
    {
        code: 25026,
        message: 'Maximum number of active requests for the session has been reached, no more new requests can be made'
    },
    {
        code: 25027,
        message: 'The request with the specified request ID has already finished'
    },
    {
        code: 25028,
        message: 'The request with the specified request ID has expired'
    },
    {
        code: 25031,
        message: 'The request was terminated because of a session logout request'
    },
    {
        code: 25032,
        message: 'The request timed out while waiting for a response from the server'
    },
    {
        code: 25033,
        message: 'The service session was terminated'
    },
    {
        code: 25035,
        message: 'The server is offline'
    }
]
export const errorSettingModel = {
    code: null,
    message: null,
    numberRetrySuccess: 5
}
const Item = ({ code, message, codeSelected, setCodeSelected }) => {
    const isSelected = code === codeSelected
    const onCheck = useCallback(() => {
        errorSettingModel.code = code
        errorSettingModel.message = message
        setCodeSelected(code)
    })
    return (
        <TouchableOpacity style={{ width: '100%' }} onPress={onCheck}>
            <View style={{
                flexDirection: 'row',
                paddingHorizontal: 16,
                marginTop: 16
            }}>
                {
                    !isSelected ? <SvgIcon size={24} color={CommonStyle.fontColor} name='untick' /> : <SvgIcon color={CommonStyle.fontColor} size={24} name='done' />
                }
                <Text style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    color: CommonStyle.fontColor,
                    flex: 1,
                    paddingLeft: 16
                }}>{`${message}-(${code})`}</Text>
            </View>
        </TouchableOpacity>
    )
}
const ErrorSystemSetting = () => {
    const [codeSelected, setCodeSelected] = useState(errorSettingModel.code)
    return (
        <ScrollView>
            <View style={{
                alignItems: 'center'
            }}>
                {
                    listCode.map((el) => {
                        return <Item {...el} setCodeSelected={setCodeSelected} codeSelected={codeSelected} />
                    })
                }
                <Text style={{
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    color: CommonStyle.fontColor,
                    flex: 1,
                    marginTop: 16,
                    textAlign: 'center'
                }}>Setting retry time success</Text>
                <TextInput style={{ color: CommonStyle.fontColor }} defaultValue={errorSettingModel.numberRetrySuccess.toString()} keyboardType='number-pad' onChangeText={(text) => {
                    errorSettingModel.numberRetrySuccess = isNaN(parseInt(text)) ? 5 : parseInt(text)
                    console.info('errorSettingModel.numberRetrySuccess', errorSettingModel.numberRetrySuccess)
                }} placeholderTextColor={CommonStyle.fontNearLight6} placeholder='Enter time retry for success' />
            </View>
        </ScrollView>
    )
}
ErrorSystemSetting.propTypes = {}
ErrorSystemSetting.defaultProps = {}
const styles = StyleSheet.create({})
export default ErrorSystemSetting

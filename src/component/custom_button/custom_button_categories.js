import React, { Component } from 'react'
import {
    View, Text, Platform, TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/Ionicons'
import I18n from '../../modules/language'
import CommonStyle, { register } from '~/theme/theme_controller'

export default class CustomButtonCategories extends Component {
    static propTypes = {
        hideText: PropTypes.bool,
        onPress: PropTypes.func
    }

    render() {
        return (
            <TouchableOpacity onPress={() => this.props.onPress({ type: 'NavBarButtonPress', id: 'backPress' })}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon
                        style={{ marginTop: 2 }}
                        name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
                        size={36}
                        color={CommonStyle.btnColor} />
                    {
                        this.props.hideText
                            ? <Text style={{ color: '#fff', fontSize: CommonStyle.fontSizeM, paddingLeft: 5, marginTop: 10 }}>{'        '}</Text>
                            : <Text style={{ color: CommonStyle.btnColor, fontSize: CommonStyle.fontSizeM, paddingLeft: 5, marginTop: 10 }}>{(I18n.t('categories'))}</Text>
                    }
                </View>
            </TouchableOpacity>
        )
    }
}

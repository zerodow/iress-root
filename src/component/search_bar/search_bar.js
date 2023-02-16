import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import I18n from '~/modules/language/index'
import styles from './styles/index';
import CustomIcon from '~/component/Icon'
import CommonStyle, { register } from '~/theme/theme_controller'

export default ({
    isBorder = false,
    onShowModalSearch,
    disabled = false,
    testID,
    title,
    prStype,
    onReset,
    prStypeClose,
    placeHolderStyle,
    isShowReset
}) => {
    return (
        <View testID={testID || 'search-bar-button-common'} style={[styles.searchBarContainer, { marginTop: 8 }, prStype || {}]}>
            <TouchableOpacity disabled={disabled} style={styles.searchBar} onPress={onShowModalSearch}>
                <CustomIcon name='equix_search' style={styles.iconSearch} />
                <Text style={[
                    styles.searchPlaceHolder,
                    title
                        ? { color: CommonStyle.fontColor, opacity: 1 }
                        : {},
                    placeHolderStyle]}>{title || I18n.t('search')}</Text>
                {
                    isShowReset
                        ? <View style={{ flex: 1, height: '100%', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    onReset && onReset()
                                }}
                                hitSlop={{
                                    top: 16,
                                    left: 16,
                                    right: 16,
                                    bottom: 16
                                }}
                            >
                                <Icon
                                    testID="iconCancelSearchCode"
                                    name="ios-close-circle"
                                    style={[CommonStyle.iconCloseLight]}
                                />
                            </TouchableOpacity>
                        </View>
                        : <View />
                }
            </TouchableOpacity>
        </View>
    )
}

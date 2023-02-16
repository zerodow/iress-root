import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import I18n from '~/modules/language/index'
import CommonStyle, { register } from '~/theme/theme_controller'
import styles from './styles/index'
export default ({ isBorder = false, onShowModalSearch, disabled = false, testID, title }) => {
    return (
        <View testID={testID || 'search-bar-button-common'} style={styles.searchBarContractNotes}>
            <TouchableOpacity disabled={disabled} style={styles.searchBar1} onPress={onShowModalSearch}>
                <View style={{ flex: 5, flexDirection: 'row', paddingRight: 8 }}>
                    <Icon name='ios-search' style={styles.iconSearch} />
                    <Text style={[styles.searchPlaceHolder1, { paddingTop: 2 }]}>{title || `${I18n.t('search')}`}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', flex: 2, paddingRight: 8 }}>
                    <Icon
                        testID="iconCancelSearchCode"
                        name="ios-close-circle"
                        style={CommonStyle.iconCloseLight}
                    />
                </View>
            </TouchableOpacity>
        </View>
    )
}

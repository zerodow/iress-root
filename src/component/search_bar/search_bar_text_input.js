import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import styles from './styles/index'
import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/index'
import Icon from 'react-native-vector-icons/Ionicons';
import CustomIcon from '~/component/Icon'
export default ({
    testID,
    onChangeText,
    onReset,
    onDismissModal,
    textSearch,
    isShowCanelButton = true,
    styleContainer,
    onFocusInput,
    textRightButton,
    renderCustomTextInput,
    placeholder,
    setRefTextInput
}) => {
    return (
        <View testID={testID && 'search-bar-text-input'} style={[styles.searchBarContainerNoBorder, { backgroundColor: CommonStyle.ColorTabNews, height: 68 }, styleContainer]}>
            <View style={[styles.searchBarNoBorder, { backgroundColor: CommonStyle.backgroundNewSearchBar, borderRadius: 8, height: 42 }]}>
                <CustomIcon name='equix_search' style={[styles.iconSearch]} />
                {/* <Icon testID='SearchIcon' name='ios-search' style={[styles.iconSearch]} /> */}
                {
                    (renderCustomTextInput && renderCustomTextInput()) || (
                        <TextInput
                            ref={(ref) => {
                                ref && setRefTextInput && setRefTextInput(ref)
                            }}
                            // selectionColor={CommonStyle.fontColor}
                            testID='SearchInput'
                            style={[styles.inputStyle, { color: CommonStyle.fontColor }]}
                            underlineColorAndroid='transparent'
                            // autoFocus={true} // nen tu quan li focus thong qua ref
                            returnKeyType="search"
                            placeholder={placeholder || I18n.t('search')}
                            onFocus={onFocusInput}
                            placeholderTextColor={'rgba(255,255,255,0.3)'}
                            onChangeText={onChangeText}
                            value={textSearch}
                        />
                    )
                }
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onReset}
                >
                    <Icon
                        testID="iconCancelSearchCode"
                        name="ios-close-circle"
                        style={CommonStyle.iconCloseLight}
                    />
                </TouchableOpacity>
            </View>
            {
                isShowCanelButton && (<TouchableOpacity testID='SearchCancelButton' style={styles.buttonCancel} onPress={onDismissModal}>
                    <Text style={CommonStyle.rightTextBold}>{textRightButton || I18n.t('cancel')}</Text>
                </TouchableOpacity>)
            }
        </View>
    )
}

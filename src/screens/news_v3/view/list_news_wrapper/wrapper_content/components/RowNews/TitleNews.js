import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Langue
import I18n from '~/modules/language/';
// Component
import Ionicons from 'react-native-vector-icons/Ionicons'
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
// Enum
import Enum from '~/enum'
export default ({ title, tags }) => {
    return (
        <NewsWrapperContext.Consumer>
            {({ isLoading, isLoadingAfter }) => Platform.OS === 'android' ? (
                <ViewLoading style={{ flexDirection: 'row' }} isLoading={isLoadingAfter || isLoading}>
                    {
                        tags === Enum.SIGN_NEWS.PRICE_SENSITIVE ? (
                            <Text numberOfLines={1} style={{
                                fontSize: CommonStyle.fontSizeS,
                                fontFamily: CommonStyle.fontPoppinsBold,
                                color: CommonStyle.fontColor,
                                alignSelf: 'baseline',
                                lineHeight: CommonStyle.fontSizeL * 1 + 8
                            }}>
                                <Ionicons name='md-alert' color={CommonStyle.colorProduct} size={18} style={{ alignSelf: 'flex-start' }} />
                                {`  ${title}`}
                            </Text>
                        ) : (
                                <Text numberOfLines={1} style={{
                                    fontSize: CommonStyle.fontSizeS,
                                    fontFamily: CommonStyle.fontPoppinsBold,
                                    color: CommonStyle.fontColor,
                                    alignSelf: 'baseline',
                                    lineHeight: CommonStyle.fontSizeL * 1 + 8
                                }}>
                                    {`${title}`}
                                </Text>
                            )
                    }
                </ViewLoading>) : (
                    <ViewLoading style={{ flexDirection: 'row' }} isLoading={isLoadingAfter || isLoading}>
                        {
                            tags === Enum.SIGN_NEWS.PRICE_SENSITIVE ? (
                                <Text numberOfLines={1} style={{
                                    fontSize: CommonStyle.fontSizeS,
                                    fontFamily: CommonStyle.fontPoppinsBold,
                                    color: CommonStyle.fontColor,
                                    alignSelf: 'baseline'
                                }}>
                                    <Ionicons name='md-alert' color={CommonStyle.colorProduct} size={18} style={{ alignSelf: 'flex-start' }} />
                                    {`  ${title}`}
                                </Text>
                            ) : (
                                    <Text numberOfLines={1} style={{
                                        fontSize: CommonStyle.fontSizeS,
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        color: CommonStyle.fontColor,
                                        alignSelf: 'baseline'
                                    }}>
                                        {`${title}`}
                                    </Text>
                                )
                        }
                    </ViewLoading>

                )}
        </NewsWrapperContext.Consumer>

    )
}

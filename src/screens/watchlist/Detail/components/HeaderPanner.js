import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { connect } from 'react-redux';

import * as Controller from '~/memory/controller';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { LoadingIcon, RefreshIcon, CloseIcon } from './';
import Shadow from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'

import { useLoadingErrorSystem } from '~/component/error_system/Hook/Redux'
import { calculateLineHeight } from '~/util'
const Info = ({ onClose, c2rIcon, styleContent, styleBorderRadius = {}, title, styleHeader }) => {
    const [Shadow, onLayout] = useShadow()
    const { isLoadingErrorSystem } = useLoadingErrorSystem()
    return <View style={{ zIndex: 10 }}>
        <Shadow />
        <View
            onLayout={onLayout}
            style={[styles.content, styleContent, {
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                borderBottomWidth: 0,
                borderColor: 'transparent'
            }, styleBorderRadius]}>
            <View style={styles.subContent}>
                {c2rIcon}
                <View style={{
                    flex: 1,
                    alignItems: 'center'
                }}>
                    <TextLoading
                        isLoading={isLoadingErrorSystem}
                        numberOfLines={1}
                        style={[
                            CommonStyle.titlePanel,
                            {
                                textAlign: 'center',
                                opacity: title ? 1 : 0
                            },
                            styleHeader,
                            Platform.OS === 'ios' ? {} : { lineHeight: calculateLineHeight(CommonStyle.fontSizeM) } // Anh thanh bao khong doi fontSize
                        ]}
                    >
                        {title || 0}
                    </TextLoading>
                </View>

                <CloseIcon onPress={onClose} />
            </View>
            {/* <View style={{ height: 8 }} />
        {this.renderSeperate()} */}
        </View>
    </View>
}

export class HeaderPanner extends Component {
    renderC2RIcon() {
        const isStreaming = Controller.isPriceStreaming();
        if (isStreaming) return <View style={{ minWidth: 50 }} />;
        return (
            <View
                style={{
                    paddingHorizontal: 16
                }}
            >
                {this.props.isLoading ? (
                    <LoadingIcon />
                ) : (
                        <RefreshIcon onPress={this.props.onRefresh} />
                    )}
            </View>
        );
    }

    // renderSeperate() {
    //     return (
    //         <View style={styles.seperateWrapper}>
    //             <View style={styles.seperate} />
    //         </View>
    //     );
    // }

    render() {
        const { title, onLayout = () => { }, styleHeader, isHideShadow = false, styleBorderRadius = {} } = this.props;
        if (isHideShadow) {
            return (
                <View style={[styles.content, this.props.styleContent,
                {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0
                }
                ]}>
                    <View style={styles.subContent}>
                        {this.renderC2RIcon()}
                        <Text
                            numberOfLines={1}
                            style={[
                                CommonStyle.titlePanel,
                                {
                                    flex: 1,
                                    textAlign: 'center',
                                    opacity: title ? 1 : 0
                                },
                                styleHeader
                            ]}
                        >
                            {title || 0}
                        </Text>
                        <CloseIcon onPress={this.props.onClose} />
                    </View>
                    {/* <View style={{ height: 8 }} />
                        {this.renderSeperate()} */}
                </View>
            );
        }
        return (
            <View onLayout={onLayout}>
                <Shadow heightShadow={40} />
                <Info
                    title={title}
                    styleHeader={styleHeader}
                    styleBorderRadius={styleBorderRadius}
                    styleContent={this.props.styleContent}
                    onClose={this.props.onClose}
                    c2rIcon={this.renderC2RIcon()} />
            </View>
        );
    }
}

const styles = {};

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        seperate: {
            width: '100%',
            height: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
        },
        seperateWrapper: {
            width: '100%',
            backgroundColor: CommonStyle.backgroundColor
        },
        dragIcon: {
            alignSelf: 'center',
            marginBottom: 4,
            marginTop: 0
        },
        subContent: {
            flexDirection: 'row',
            // flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        content: {
            zIndex: 9,
            backgroundColor: CommonStyle.backgroundColor,
            // flex: 1,
            paddingTop: 8,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        iconContent: {
            right: 16,
            height: '100%',
            position: 'absolute',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center'
        },
        bg: {
            height: '100%',
            width: '100%',
            position: 'absolute',
            backgroundColor: CommonStyle.backgroundColor
        }
    });

    PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);
const mapStateToProps = (state) => ({
    isLoading: state.watchlist3.detailLoading
});

export default connect(mapStateToProps)(HeaderPanner);

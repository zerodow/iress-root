import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Keyboard
} from 'react-native';

import Shadow from '~/component/shadow';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import I18n from '@module/language/';
import Icon from '~s/watchlist/Component/Icon2';

export default class SerchHeader extends Component {
    onDone = this.onDone.bind(this)
    onDone() {
        Keyboard.dismiss()
        this.props.onDone && this.props.onDone()
    }

    clearText = this.clearText.bind(this)
    clearText() {
        this._textInput && this._textInput.setNativeProps({
            text: ''
        })
    }

    renderSearchText() {
        return (
            <View style={styles.searchContainer}>
                <CommonStyle.icons.search
                    name="search"
                    size={16}
                    color={CommonStyle.fontTextChart}
                />
                <TextInput
                    ref={ref => this._textInput = ref}
                    onChangeText={this.props.onChangeText}
                    style={styles.input}
                    placeholder={I18n.t('search')}
                    placeholderTextColor={CommonStyle.fontNearLight6}
                    // selectionColor={CommonStyle.fontWhite}
                />
            </View>
        );
    }

    renderDoneButton() {
        return (
            <TouchableOpacity onPress={this.onDone}>
                <Text style={styles.done}>{I18n.t('done')}</Text>
            </TouchableOpacity>
        );
    }

    render() {
        const { title } = this.props;
        return (
            <React.Fragment>
                <Shadow heightShadow={40} />
                <View style={[styles.content, this.props.styleContent]}>
                    <View style={styles.subContent}>
                        {this.renderSearchText()}
                        {this.renderDoneButton()}
                    </View>
                </View>
            </React.Fragment>
        );
    }
}

const styles = {};

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            padding: 8,
            backgroundColor: CommonStyle.color.dusk,
            borderRadius: 8
        },
        subContent: {
            paddingHorizontal: 16,
            flexDirection: 'row',
            // flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        content: {
            zIndex: 9,
            backgroundColor: CommonStyle.backgroundColor,
            // flex: 1,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingTop: 8,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)'
        },
        done: {
            paddingLeft: 16,
            fontFamily: CommonStyle.fontPoppinsMedium,
            fontSize: CommonStyle.font13,
            color: CommonStyle.fontWhite
        },
        input: {
            paddingVertical: 0,
            paddingLeft: 8,
            flex: 1,
            fontSize: CommonStyle.font11,
            height: 17,
            fontFamily: CommonStyle.fontPoppinsRegular,
            color: CommonStyle.fontWhite
        }
    });

    PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

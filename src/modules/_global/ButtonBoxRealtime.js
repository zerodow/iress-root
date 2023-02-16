import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, PixelRatio } from 'react-native';
import styles from './styles/ButtonBox';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { formatNumber, checkPropsStateShouldUpdate, roundFloat, formatNumberNew2ClearZero } from '../../lib/base/functionUtil';
import I18n from '../language/';
import { func, dataStorage } from '../../storage';
import XComponent from '../../component/xComponent/xComponent';
import { connect } from 'react-redux';
import * as Util from '../../util';
import * as Controller from '../../memory/controller';
import * as Emitter from '@lib/vietnam-emitter';
import ENUM from '../../enum';
import * as RoleUser from '../../roleUser';
import config from '../../config'

class ButtonBoxRealtime extends XComponent {
    static propTypes = {
        componentChild: PropTypes.func.isRequired,
        login: PropTypes.object.isRequired,
        isLoading: PropTypes.bool,
        channelLoadingTrade: PropTypes.string,
        isConnected: PropTypes.bool.isRequired,
        onPress: PropTypes.func.isRequired,
        width: PropTypes.string,
        buy: PropTypes.bool,
        field1: PropTypes.string.isRequired,
        field2: PropTypes.string.isRequired,
        value1: PropTypes.object.isRequired,
        value2: PropTypes.object.isRequired,
        formatFunc1: PropTypes.func.isRequired,
        formatFunc2: PropTypes.func.isRequired,
        channelLv1FromComponent: PropTypes.string
    };

    constructor(props) {
        super(props);

        this.onLoading = this.onLoading.bind(this);

        this.dic = {
            isLoading: Util.getBooleanable(this.props.isLoading, false),
            emailDefault: config.username
        };
    }

    shouldComponentUpdate(nextProps) {
        return this.props.isConnected !== nextProps.isConnected;
    }

    componentDidMount() {
        super.componentDidMount();

        Emitter.addListener(this.props.channelLoadingTrade, this.id, this.onLoading);
    }

    onLoading(data) {
        if (this.dic.isLoading === data) return;
        this.dic.isLoading = data;
        this.setState();
    }

    isDisableAll() {
        const user = Controller.getUserInfo()
        return dataStorage.isNotHaveAccount ||
            !this.props.login.isLogin ||
            (user && (user.email === this.dic.emailDefault)) ||
            !this.props.isConnected ||
            dataStorage.loginUserType === 'REVIEW' ||
            !RoleUser.checkRoleByKey(ENUM.ROLE_DETAIL.PERFORM_BUY_SELL_BUTTON) ||
            !func.isAccountActive();
    }

    render() {
        const ComponentChild = this.props.componentChild;
        if (this.isDisableAll()) {
            return (
                <TouchableOpacity style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    width: this.props.width,
                    // height: 56,
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 15,
                    paddingRight: 15,
                    borderRadius: CommonStyle.borderRadius
                }}
                    testID={this.props.testID}
                    disabled={true}
                    onPress={this.props.onPress}>
                    <View style={{ width: '100%' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text testID={`${this.props.testID}-leftRow1`} style={{ width: '50%', color: 'white', fontFamily: CommonStyle.fontLight, opacity: 1, alignItems: 'flex-end', fontSize: this.props.buy ? CommonStyle.fontSizeS : CommonStyle.fontSizeM }}>{this.props.buy ? I18n.t('bidVol') : I18n.t('sellUpper')}</Text>
                            <Text testID={`${this.props.testID}-rightRow1`} style={{ width: '50%', color: 'white', fontFamily: CommonStyle.fontLight, opacity: 1, alignItems: 'flex-end', textAlign: 'right', fontSize: this.props.buy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS }}>{this.props.buy ? I18n.t('buyUpper') : I18n.t('askVol')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <ComponentChild
                                testID={`${this.props.testID}-leftRow2`}
                                numberOfLines={1}
                                style={{ width: '50%', color: 'white', fontFamily: CommonStyle.fontMedium, opacity: 1, lineHeight: 20, fontSize: this.props.buy ? CommonStyle.fontSizeS : CommonStyle.fontSizeM }}
                                field={this.props.field1}
                                parentID={this.id}
                                formatFunc={this.props.formatFunc1}
                                value={this.props.value1}
                                channelLv1FromComponent={this.props.channelLv1FromComponent}
                                isLoading={this.props.isLoading}
                                channelLoadingTrade={this.props.channelLoadingTrade}
                            />
                            <ComponentChild
                                testID={`${this.props.testID}-rightRow2`}
                                numberOfLines={1}
                                style={{ width: '50%', color: 'white', fontFamily: CommonStyle.fontMedium, opacity: 1, lineHeight: 20, textAlign: 'right', fontSize: this.props.buy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS }}
                                field={this.props.field2}
                                parentID={this.id}
                                formatFunc={this.props.formatFunc2}
                                value={this.props.value2}
                                channelLv1FromComponent={this.props.channelLv1FromComponent}
                                isLoading={this.props.isLoading}
                                channelLoadingTrade={this.props.channelLoadingTrade}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity style={{
                    flex: 1,
                    backgroundColor: this.props.buy ? (this.props.disabledColor ? 'rgba(0, 0, 0, 0.3)' : '#00b800') : (this.props.disabledColor ? 'rgba(0, 0, 0, 0.3)' : '#df0000'),
                    width: this.props.width,
                    // height: 56,
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingLeft: 15,
                    paddingRight: 15,
                    borderRadius: CommonStyle.borderRadius
                }}
                    testID={this.props.testID}
                    disabled={this.dic.isLoading}
                    onPress={this.props.onPress}>
                    <View testID={this.props.testId} style={{ width: '100%' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text testID={`${this.props.testID}-leftRow1`} style={[styles.whiteText, { alignItems: 'flex-end', fontSize: this.props.buy ? 14 : 16 }]}>{this.props.buy ? I18n.t('bidVol') : I18n.t('sellUpper')}</Text>
                            <Text testID={`${this.props.testID}-rightRow1`} style={[styles.whiteText, { alignItems: 'flex-end', textAlign: 'right', fontSize: this.props.buy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS }]}>{this.props.buy ? I18n.t('buyUpper') : I18n.t('askVol')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <ComponentChild
                                testID={`${this.props.testID}-leftRow2`}
                                style={[styles.whiteText, { lineHeight: 20, fontSize: this.props.buy ? 14 : 16 }]}
                                field={this.props.field1}
                                parentID={this.id}
                                formatFunc={this.props.formatFunc1}
                                value={this.props.value1}
                                channelLv1FromComponent={this.props.channelLv1FromComponent}
                                isLoading={this.props.isLoading}
                                channelLoadingTrade={this.props.channelLoadingTrade}
                            />
                            <ComponentChild
                                testID={`${this.props.testID}-rightRow2`}
                                style={[styles.whiteText, { lineHeight: 20, textAlign: 'right', fontSize: this.props.buy ? CommonStyle.fontSizeM : CommonStyle.fontSizeS }]}
                                field={this.props.field2}
                                parentID={this.id}
                                formatFunc={this.props.formatFunc2}
                                value={this.props.value2}
                                channelLv1FromComponent={this.props.channelLv1FromComponent}
                                isLoading={this.props.isLoading}
                                channelLoadingTrade={this.props.channelLoadingTrade}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        }
    }
};

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(ButtonBoxRealtime);

import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

import I18n from '~/modules/language';
import Row from './Row';
import SCREEN from '../screenEnum';
import WatchListActions from '../reducers';
import CommonStyle from '~/theme/theme_controller';
import AniComp from '../Animator';
import ENUM from '~/enum';
import * as Controller from '~/memory/controller';
import * as RoleUser from '~/roleUser';

const { ROLE_DETAIL } = ENUM;

class CreateRower extends PureComponent {
    role = RoleUser.checkRoleByKey(ROLE_DETAIL.C_E_R_WATCHLIST);
    onPress = this.onPress.bind(this);

    onPress() {
        const { setScreenActive, onPress, screenSelected } = this.props;
        if (onPress) {
            onPress();
        }
        setScreenActive(SCREEN.ADD_WATCHLIST, { preScreen: screenSelected });
    }

    renderLeftIcon() {
        return <Icon name="ios-add-circle" size={20} color="#00b800" />;
    }

    render() {
        const isLogin = Controller.getLoginStatus();
        if (!isLogin || !this.role) return null;
        return (
            <TouchableOpacity onPress={this.onPress}>
                <AniComp
                    startAtFirst
                    style={{
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: 8,
                        paddingBottom: 16
                    }}
                >
                    <Icon name="ios-add-circle" size={20} color="#00b800" />
                    <Text
                        style={{
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeS,
                            color: CommonStyle.fontColor
                        }}
                        numberOfLines={1}
                    >
                        {I18n.t('createNewWatchList')}
                    </Text>
                </AniComp>
            </TouchableOpacity>
        );
    }
}

const mapStateToProps = (state) => ({
    screenSelected: state.watchlist3.screenSelected
});

const mapDispatchToProps = (dispatch) => ({
    setScreenActive: (...p) =>
        dispatch(WatchListActions.watchListSetScreenActived(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateRower);

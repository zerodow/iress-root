import React, { Component } from 'react';
import {
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    Platform
} from 'react-native';
import Animated from 'react-native-reanimated';
import { connect } from 'react-redux';

import Icon from 'react-native-vector-icons/Ionicons';
import I18n from '~/modules/language/';
import IconComp from '~/component/headerNavBar/icon';
import WatchListActions from '../reducers';

import Icon2 from '../Component/Icon2';
import CommonStyle from '~/theme/theme_controller';
import * as setTestId from '~/constants/testId';

const { width: DEVICES_WIDTH } = Dimensions.get('window');

const { Value } = Animated;

class SortActions extends Component {
    _top = new Value(0);
    _right = new Value(0);
    _width = new Value(0);
    _height = new Value(0);

    onSortPress = this.onSortPress.bind(this);
    onSortPress() {
        const { sortType, changeSortType, closeModal } = this.props;
        const cb = () => {
            if (sortType === -1) {
                changeSortType(0);
            }
            if (sortType === 0) {
                changeSortType(1);
            }
            if (sortType === 1) {
                changeSortType(-1);
            }
        };

        closeModal && closeModal(cb);
    }

    renderSymbolSort() {
        const { sortType } = this.props;

        let checked = null;
        let sortIcon = null;
        if (sortType === 0 || sortType === 1) {
            checked = (
                <IconComp
                    isDisable
                    useCustomIcon
                    name="equix_check"
                    size={10}
                    style={[
                        {
                            color: CommonStyle.color.modify
                        }
                    ]}
                />
            );
        }

        if (sortType === 0) {
            sortIcon = (
                <CommonStyle.icons.arrowUp
                    name="md-arrow-dropup"
                    color={CommonStyle.fontGreen}
                    size={24}
                    style={[
                        {
                            color: CommonStyle.fontGreen,
                            alignSelf: 'center'
                        }
                    ]}
                />
            );
        }

        if (sortType === 1) {
            sortIcon = (
                <CommonStyle.icons.arrowDown
                    name="md-arrow-dropdown"
                    size={24}
                    color={CommonStyle.fontRed}
                    style={[
                        {
                            color: CommonStyle.fontRed,
                            alignSelf: 'center'
                        }
                    ]}
                />
            );
        }

        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16
                }}
            >
                <Text
                    style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font13,
                        color: CommonStyle.fontWhite,
                        paddingRight: 16
                    }}
                >
                    {I18n.t('symbols')}
                </Text>
                {sortIcon}
                <View style={{ flex: 1 }} />
                {checked}
            </View>
        );
    }

    renderSortRow() {
        return (
            <View
                style={{
                    minWidth: (DEVICES_WIDTH / 3) * 2
                }}
            >
                {this.renderSymbolSort()}
            </View>
        );
    }

    renderSortComp = this.renderSortComp.bind(this);
    renderSortComp() {
        return (
            <React.Fragment>
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: Animated.sub(this._top, this._height),
                        right: 16
                    }}
                >
                    <Icon2
                        onPress={this.onPress}
                        color={CommonStyle.fontColor}
                        size={20}
                        name="sort"
                        {...setTestId.testProp(
                            `Id_test_search_wl`,
                            `Label_test_search_wl`
                        )}
                    />
                </Animated.View>

                <Animated.View
                    style={{
                        position: 'absolute',
                        top: Animated.add(this._top, 8),
                        right: 16
                    }}
                >
                    <View
                        style={{
                            borderRadius: 8,
                            backgroundColor: CommonStyle.color.dusk,
                            alignItems: 'center',
                            paddingVertical: 16
                        }}
                    >
                        <TouchableOpacity
                            onPress={this.onSortPress}
                            style={{ flex: 1 }}
                        >
                            {this.renderSortRow()}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </React.Fragment>
        );
    }

    onPress = this.onPress.bind(this);
    onPress() {
        if (this.props.showModal) {
            this.props.showModal(this.renderSortComp);
        }
    }

    onLayout = this.onLayout.bind(this);
    onLayout(e) {
        setTimeout(() => {
            this._main.measure && this._main.measure((x, y, width, height, pageX, pageY) => {
                this._height = new Value(height);
                this._top = new Value(pageY + height);
                this._right = new Value(DEVICES_WIDTH - pageX - width);
            });
        }, 300);

        // const { x, y, width, height } = e.nativeEvent.layout;
    }

    render() {
        return (
            <View ref={(sef) => (this._main = sef)} onLayout={this.onLayout}>
                <Icon2
                    onPress={this.onPress}
                    color={CommonStyle.fontColor}
                    size={20}
                    name="sort"
                    {...setTestId.testProp(
                        `Id_test_search_wl`,
                        `Label_test_search_wl`
                    )}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { sortType } = state.watchlist3;
    return {
        sortType
    };
};

const mapDispatchToProps = (dispatch) => ({
    changeSortType: (...p) =>
        dispatch(WatchListActions.watchListChangeSortType(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(SortActions);

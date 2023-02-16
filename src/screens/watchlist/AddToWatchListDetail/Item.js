import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';

export default class Item extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return (
            !_.isEqual(this.props, nextProps) ||
            !_.isEqual(this.state, nextState)
        );
    }

    getStatus() {
        const { data, symbol, exchange } = this.props;
        const { value } = data || {};
        let isInclude = false;
        _.forEach(value, (item) => {
            isInclude =
                isInclude ||
                (symbol === item.symbol && exchange === item.exchange);
        });
        return isInclude;
    }

    renderIcon(isInclude) {
        if (!isInclude) return null;
        return (
            <Icon
                name="md-checkmark"
                size={14}
                color={CommonStyle.color.modify}
            />
        );
    }

    render() {
        const { data, onPress, symbol, exchange } = this.props;
        const { watchlist_name: watchlistName, watchlist } = data || {};

        const isInclude = this.getStatus();
        const containerStyles = isInclude
            ? styles.includeContainer
            : styles.container;

        const curOnPress = () =>
            onPress &&
            onPress({ symbol, exchange, watchlistId: watchlist, isInclude });
        return (
            <TouchableOpacity onPress={curOnPress}>
                <View style={containerStyles}>
                    <Text style={styles.title} numberOfLines={1}>
                        {watchlistName}
                    </Text>
                    {this.renderIcon(isInclude)}
                </View>
            </TouchableOpacity>
        );
    }
}

const defaultContainer = {
    marginHorizontal: 8,
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
};

const styles = {};

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        container: {
            ...defaultContainer,
            borderColor: CommonStyle.color.dusk
        },
        includeContainer: {
            ...defaultContainer,
            borderColor: CommonStyle.color.modify
        },
        title: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.font13,
            color: CommonStyle.fontWhite,
            flex: 1
        }
    });

    PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

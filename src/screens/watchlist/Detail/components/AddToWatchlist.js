import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';

import Icon from '../../Component/Icon2';

import CommonStyle from '~/theme/theme_controller';

const AddToWatchlist = ({ isDisable, onPress = () => { } }) => {
    return (
        <TouchableOpacity disabled={isDisable} onPress={onPress}>
            <CommonStyle.icons.add
                style={{ paddingLeft: 16, opacity: isDisable ? 0.4 : 1 }}
                name={'add'}
                size={20}
                color={CommonStyle.colorProduct}
            />
        </TouchableOpacity>
    );
};

export default AddToWatchlist;

const styles = StyleSheet.create({
    item: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    },
    icon: {
        width: 22,
        height: 22
    },
    iconDisable: {
        width: 22,
        height: 22,
        opacity: 0.5
    }
});

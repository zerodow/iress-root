import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import PropTypes from 'prop-types'
import CommonStyle, { register } from '~/theme/theme_controller'
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Navigation } from 'react-native-navigation';
import Enum from '~/enum';
const Icon = () => <CommonStyle.icons.cheDown style={{
    textAlign: 'center',
    alignSelf: 'center'
}} name={'md-arrow-dropdown'} color={CommonStyle.fontNearLight6} size={14} />;

const listData1 = [
    {
        label: 'Market To Limit',
        value: 'mkt'
    },
    {
        label: 'Limit',
        value: 'lm'
    },
    {
        label: 'Stop Loss',
        value: 'st'
    }
];
const listData2 = [
    {
        label: 'Market To Limit1',
        value: 'mkt'
    },
    {
        label: 'Limit1',
        value: 'lm'
    },
    {
        label: 'Stop Loss1',
        value: 'st'
    }
];

const useShowModal = ({ setValue, selectedValue, layoutInput, data, refTextInput, styleValue }) => useCallback(() => {
    if (data.length === 1) return
    return new Promise((resolve) => {
        refTextInput.current &&
            refTextInput.current.measure && refTextInput.current.measure((x, y, width, height, pageX, pageY) => {
                layoutInput.current.y = pageY;
                layoutInput.current.x = pageX;
                layoutInput.current.width = width;
                Navigation.showModal({
                    screen: 'equix.SelectionModal',
                    animated: false,
                    animationType: 'none',
                    navigatorStyle: {
                        ...CommonStyle.navigatorModalSpecialNoHeader,
                        modalPresentationStyle: 'overCurrentContext'
                    },
                    passProps: {
                        data,
                        layoutInput,
                        selectedValue,
                        onClose: () => {
                            Navigation.dismissModal({
                                animationType: 'none'
                            })
                        },
                        onSelected: setValue,
                        styleValue
                    }
                })
            });
    })
}, [data, selectedValue])
const useOnChangeDefaultValue = function ({ defaultValue, setSetSelected }) {
    return useEffect(() => {
        setSetSelected(defaultValue)
    }, [defaultValue])
}

const SelectionButton = ({ onShow, onHide, title, defaultValue, data = [], onCbSelect, styleValue, layout, disabled }) => {
    const [selectedValue, setSetSelected] = useState(defaultValue)
    let layoutInput = useRef({});
    const refTextInput = useRef({});

    const setValue = useCallback((value) => {
        setSetSelected(value)
        onCbSelect && onCbSelect(value.key, value)
    }, [])
    const onShowModal = useShowModal({ setValue, selectedValue, layoutInput, data, refTextInput, styleValue })

    useOnChangeDefaultValue({ defaultValue, setSetSelected })
    return (
        <View style={[
            {
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 8
            },
            layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutRowWrapperBasic : CommonStyle.layoutRowWrapperAdvance
        ]}>
            <Text style={[CommonStyle.titleInput, layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance]}>{title}</Text>
            <View
                collapsable={false}
                ref={refTextInput}
                style={[
                    {
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: disabled ? CommonStyle.color.disabled : CommonStyle.color.dusk,
                        backgroundColor: disabled ? CommonStyle.color.disabled : CommonStyle.backgroundColor
                    },
                    layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
                ]}
            >
                <TouchableOpacityOpt
                    timeDelay={1000}
                    hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
                    disabled={data.length <= 1 || disabled}
                    onPress={onShowModal}
                    testID='selection'
                    style={{
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        flexDirection: 'row',
                        borderRadius: 4
                    }}
                >
                    <Text
                        style={[{
                            fontSize: CommonStyle.fontSizeS,
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            color: CommonStyle.fontColor,
                            alignSelf: 'center',
                            flex: 1,
                            textAlign: 'center'
                        }, styleValue]}
                    >
                        {selectedValue && selectedValue.label}
                    </Text>
                    {data.length === 1 ? null : <Icon />}
                </TouchableOpacityOpt>
            </View>
        </View>
    );
};
SelectionButton.PropTypes = {
    onShow: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired

};

export default SelectionButton;

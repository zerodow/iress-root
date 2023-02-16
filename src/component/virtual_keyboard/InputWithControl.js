import React, {
    useEffect,
    useState,
    useCallback,
    useRef,
    useMemo,
    useImperativeHandle
} from 'react';
import { View, Text, Platform } from 'react-native';
import PropTypes from 'prop-types';
import * as Emitter from '@lib/vietnam-emitter';

import TextInput from '~/component/textinput_avoid_keyboard/TextInput';
import IconCustom from '~/component/svg_icon/SvgIcon.js';

import * as Util from '~/util';
import CommonStyle, { register } from '~/theme/theme_controller';
import {
    Channel as ChannelKeyBoard,
    getChannelChangeText,
    getChannelDeleteText,
    getChannelChangeTextFromSlider
} from '~/component/virtual_keyboard/Keyboard.js';
import { checkMaxDecimal, checkDuplicateDot, checkDotAtStart } from './Controller'
const isIos = Platform.OS === 'ios';
const IncreaseButton = ({ onPress, text, limitNumberLength = 16 }) => {
    const currentRef = useRef({});
    const [isDisabled, setDisabled] = useState(true);
    const limitNumber = new Array(limitNumberLength)
        .fill(9)
        .reduce((pre, next) => {
            return pre.toString() + next.toString();
        }, '');
    useEffect(() => {
        if (text >= limitNumber) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [text]);
    return (
        <IconCustom
            onPressIn={() => {
                currentRef.current = setInterval(() => {
                    onPress && onPress();
                }, 150);
            }}
            onPressOut={() => {
                if (currentRef.current) {
                    clearInterval(currentRef.current);
                }
            }}
            onPress={() => {
                onPress && onPress();
            }}
            style={{
                paddingRight: 8
            }}
            hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
            size={20}
            timeDelay={1}
            color={
                isDisabled
                    ? CommonStyle.fontNearLight7
                    : CommonStyle.fontNearLight6
            }
            name={'nounPlus'}
            disabled={isDisabled}
        />
    );
};
const ReductionButton = ({ onPress, text }) => {
    const currentRef = useRef();
    const [isDisabled, setDisabled] = useState(true);
    useEffect(() => {
        if (parseFloat(text) === 0) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }, [text]);
    return (
        <IconCustom
            onPressIn={() => {
                currentRef.current = setInterval(() => {
                    onPress && onPress();
                }, 500);
            }}
            onPressOut={() => {
                if (currentRef.current) {
                    clearInterval(currentRef.current);
                }
            }}
            onPress={() => {
                onPress && onPress();
            }}
            hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
            timeDelay={1}
            style={{
                paddingLeft: 8
            }}
            size={20}
            color={
                isDisabled
                    ? CommonStyle.fontNearLight7
                    : CommonStyle.fontNearLight6
            }
            name={'nounRemove'}
            disabled={isDisabled}
        />
    );
};

export const useListennerChangeText = function ({
    dic,
    setText,
    onChangeText,
    inputId,
    decimal
}) {
    return useEffect(() => {
        Emitter.addListener(
            getChannelChangeText(inputId),
            null,
            ({ newText: text }) => {
                if (isIos) {
                    let newText = dic.current.text.toString() + text.toString();
                    if (checkMaxDecimal({ text: newText, decimal }) || checkDuplicateDot({ text: newText }) || checkDotAtStart({ text: newText })) return
                    dic.current.text = newText;
                    setText && setText(newText);
                } else {
                    const currentText = dic.current.text.toString();
                    const selection = dic.current.selection.start;
                    const leftString = currentText.slice(0, selection);
                    const rightString = currentText.slice(
                        selection,
                        currentText.length
                    );
                    let newText = leftString + text.toString() + rightString;
                    if (checkMaxDecimal({ text: newText, decimal }) || checkDuplicateDot({ text: newText }) || checkDotAtStart({ text: newText })) return
                    dic.current.text = newText;
                    setText && setText(newText);
                }
            }
        );
        return () => {
            Emitter.deleteEvent(getChannelChangeText(inputId));
        };
    }, [inputId]);
};
export const useListennerDeleteText = function ({ dic, inputId, setText }) {
    return useEffect(() => {
        Emitter.addListener(getChannelDeleteText(inputId), null, () => {
            if (isIos) {
                const newText = dic.current.text.toString().slice(0, -1);
                dic.current.text = newText;
                setText(newText);
            } else {
                const currentText = dic.current.text.toString();
                const selection = dic.current.selection.start;
                const leftString = currentText.slice(0, selection).slice(0, -1);
                const rightString = currentText.slice(
                    selection,
                    currentText.length
                );

                let newText = leftString + rightString;

                dic.current.text = newText;
                setText(newText);
            }
        });
        return () => {
            Emitter.deleteEvent(getChannelDeleteText(inputId));
        };
    }, [inputId]);
};
const InputWithControl = React.forwardRef(
    (
        {
            styleWrapper,
            styleText,
            propsTextInput = {},
            formatValue,
            step = 1,
            decimal = 0,
            alias = '',
            allowNegative,
            ...rest
        },
        ref
    ) => {
        const [text, changeText] = useState(rest.defaultValue);
        const inputId = useMemo(() => {
            return `input#${Util.getRandomKey()}`;
        }, []);
        const dic = useRef({
            text: rest.defaultValue || '0',
            selection: { start: 0, end: 0 }
        });
        const defaultValue = useMemo(() => {
            return rest.defaultValue || '0';
        }, []);
        const refView = useRef();
        const refTextInput = useRef();

        const onFocus = useCallback(() => {
            refView.current.measure((x, y, width, height, pageX, pageY) => {
                Emitter.emit(ChannelKeyBoard.CHANGE_THIS_KEYBOARD, {
                    preText: 0,
                    isShowKeyBoard: true,
                    inputId,
                    isMapSlider: false,
                    coordinates: { x, y, width, height, pageX, pageY }
                });
            });
            rest.onFocus && rest.onFocus(refTextInput.current);
        }, [text]);
        const onBlur = useCallback(() => {
            rest.onBlur && rest.onBlur(refTextInput.current);
        }, [text]);
        const setText = useCallback((text) => {
            text = formatValue ? formatValue(text) : text;
            dic.current.text = text;
            changeText(text);
            rest && rest.onChangeText && rest.onChangeText(text);
        });
        const onReduction = useCallback(() => {
            let newText = isNaN(
                parseFloat(parseFloat(dic.current.text).toFixed(decimal))
            )
                ? 0
                : parseFloat(parseFloat(dic.current.text).toFixed(decimal));
            newText = newText - step;
            newText = parseFloat(parseFloat(newText).toFixed(decimal));
            newText = newText <= 0 && !allowNegative ? '0' : newText.toString();
            dic.current.text = newText;
            setText(newText);
        }, []);
        const onIncrease = useCallback(() => {
            let newText = isNaN(
                parseFloat(parseFloat(dic.current.text).toFixed(decimal))
            )
                ? 0
                : parseFloat(parseFloat(dic.current.text).toFixed(decimal));
            newText = newText + step;
            newText = parseFloat(parseFloat(newText).toFixed(decimal));
            newText = newText.toString();
            dic.current.text = newText;
            setText(newText);
        });
        const onSelectionChange = useCallback(
            ({
                nativeEvent: {
                    selection: { start, end }
                }
            }) => {
                dic.current.selection = { start, end };
            },
            []
        );
        useListennerChangeText({
            dic,
            setText,
            inputId,
            decimal
        });
        useListennerDeleteText({
            dic,
            setText,
            inputId
        });
        useImperativeHandle(ref, () => ({
            updateDic: (update) => {
                dic.current = { ...dic.current, ...update };
            },
            getWrapperIntance: () => refTextInput.current,
            getRef: () => refView.current,
            getDic: () => dic.current,
            changeText: (p) => changeText(p)
        }));
        return (
            <View
                collapsable={false}
                style={[
                    {
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: CommonStyle.fontBorder,
                        backgroundColor: CommonStyle.backgroundColor,
                        paddingVertical: 5,
                        flexDirection: 'row',
                        alignItems: 'center'
                    },
                    styleWrapper
                ]}
                ref={refView}
            >
                <ReductionButton text={text} onPress={onReduction} />
                <TextInput
                    showSoftInputOnFocus={false}
                    ref={refTextInput}
                    style={[
                        {
                            fontSize: CommonStyle.fontSizeS,
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            color: CommonStyle.fontColor,
                            textAlign: 'center',
                            flex: 1,
                            padding: 0,
                            margin: 0
                        },
                        styleText
                    ]}
                    onSelectionChange={onSelectionChange}
                    {...rest}
                    defaultValue={defaultValue}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onChangeText={(text) => {
                        dic.current.text = text;
                    }}
                    onChange={({
                        nativeEvent: { eventCount, target, text }
                    }) => {
                        dic.current.text = text;
                    }}
                    value={`${text}${alias}`}
                />
                <IncreaseButton
                    limitNumberLength={16}
                    text={text}
                    onPress={onIncrease}
                />
            </View>
        );
    }
);
InputWithControl.propTypes = {};
InputWithControl.defaultProps = {};
export default InputWithControl;

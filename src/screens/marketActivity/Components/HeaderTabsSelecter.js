import React, {
    useState,
    useEffect,
    useLayoutEffect,
    useRef,
    useCallback
} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
    LayoutAnimation,
    ScrollView
} from 'react-native';
import _ from 'lodash';

import { useShadow } from '~/component/shadow/SvgShadow';
import { useSelector } from 'react-redux';
import CommonStyle from '~/theme/theme_controller';

const { width: DEVICE_WIDTH } = Dimensions.get('window');

const userMeasured = (node, item) => {
    const [curWidth, setMeasure] = useState(0);

    const onLayout = () => {
        const cb = (x, y, width, height, px, py) => {
            if (Math.abs(curWidth - width) > 3) {
                setMeasure({ width, pageX: px });
            }
        };
        node && node().measure(cb);
    };

    return [curWidth, onLayout];
};

const Item = ({ item, keyActive, setWidth, style, actived, onPress }) => {
    const mainRef = useRef();
    const [measure, onLayout] = userMeasured(() => mainRef.current, item);

    useEffect(() => setWidth && setWidth(measure, keyActive), [measure]);
    return (
        <TouchableOpacity
            onPress={() => onPress(keyActive)}
            style={{
                flex: 1,
                alignItems: 'center'
            }}
        >
            <View
                ref={mainRef}
                onLayout={onLayout}
                style={{
                    alignSelf: 'center'
                }}
            >
                <View style={{ position: 'absolute' }}>
                    <Text
                        style={{
                            padding: 8,
                            fontSize: CommonStyle.font11,
                            color: actived === keyActive ? CommonStyle.color.modify : CommonStyle.fontColor,
                            fontFamily:
                                actived === keyActive
                                    ? CommonStyle.fontPoppinsBold
                                    : CommonStyle.fontPoppinsRegular,
                            opacity: actived === keyActive ? 1 : 0.7
                        }}
                    >
                        {item}
                    </Text>
                </View>
                <Text
                    style={{
                        padding: 8,
                        fontSize: CommonStyle.font11,
                        color: CommonStyle.color.modify,
                        fontFamily: CommonStyle.fontPoppinsBold,
                        opacity: 0
                    }}
                >
                    {item}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const UnderLine = ({ actived = 76, size, extra }) => {
    useLayoutEffect(() => {
        LayoutAnimation.easeInEaseOut();
    }, [actived]);
    if (!size[actived]) return null;
    return (
        <View
            style={{
                position: 'absolute',
                width: size[actived].width,
                left: size[actived].pageX,
                bottom: 0,
                height: 5,
                borderRadius: 8,
                backgroundColor: CommonStyle.color.modify
            }}
        />
    );
};

const getFirstItem = (tabs) => {
    let result = null;
    _.forEach(tabs, (item, key) => !result && (result = key));

    return result;
};

const HeaderTabsSelecter = ({
    onSelected,
    tabs,
    isExtraViewShadow,
    extraViewStyle,
    zIndex = 999
}) => {
    const dic = useRef({
        timeout: null
    });
    const [Shadow, onLayout] = useShadow();
    const firstItem = getFirstItem(tabs);
    const [actived, setActived] = useState(firstItem);
    const [size, setSize] = useState({});
    const [extraPadding, setExtraPadding] = useState(0);

    // const { marketGroup } = useSelector((state) => state.marketActivity);
    // const modeFunc = (item) => item.group_name === 'Mode';
    // const data = _.groupBy(marketGroup, modeFunc)['true'];

    const setWidth = (width, key) => {
        setSize((p) => {
            p[key] = width; // {width,px}
            return { ...p };
        });
    };

    useEffect(() => {
        setActived(firstItem);
        !_.isEmpty(tabs) && onSelected && onSelected(firstItem);
    }, [tabs]);

    if (_.isEmpty(tabs)) return null;

    const onPress = (key) => {
        setActived(key);
        dic.current.timeout && clearTimeout(dic.current.timeout);
        dic.current.timeout = setTimeout(() => {
            onSelected && onSelected(key);
        }, 100);
    };
    useLayoutEffect(() => {
        LayoutAnimation.easeInEaseOut();
    }, [actived]);
    return (
        <View style={{
            zIndex: zIndex || 999
        }}>
            <Shadow />
            <View
                onLayout={onLayout}
                style={{
                    flexDirection: 'row',
                    zIndex: 10,
                    backgroundColor: CommonStyle.color.dark
                }}
            >
                {_.map(tabs, (item, key) => {
                    return (
                        <Item
                            onPress={onPress}
                            actived={actived}
                            item={item}
                            keyActive={key}
                            setWidth={setWidth}
                            style={{ paddingHorizontal: extraPadding }}
                        />
                    );
                })}
                <UnderLine actived={actived} size={size} extra={extraPadding} />
            </View>
            {/* {isExtraViewShadow ? (
                <View style={[{ height: 6 }, extraViewStyle]} />
            ) : null} */}
        </View>
    );
};
const styles = StyleSheet.create({
    contentContainer: {
        minWidth: DEVICE_WIDTH
    }
});

export default React.memo(HeaderTabsSelecter);

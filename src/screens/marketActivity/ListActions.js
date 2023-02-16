import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useCallback,
    useRef
} from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import Interactable from '~s/watchlist/Animator/Interactable';

import LeftInteractable from './LeftInteractable';

export const ACTIONS_WIDTH = 100;
export const DELETE_WIDTH = 68;

const getSnapPoint = ({ damping, tension }) => {
    return [
        {
            x: 0,
            damping: 1 - damping,
            tension: tension
        },
        {
            x: ACTIONS_WIDTH,
            damping: 1 - damping,
            tension: tension
        }
    ];
};

const LeftContent = ({ _deltaX, height, symbol, exchange, onAddToWl }) => {
    if (!height) return null;
    return (
        <LeftInteractable
            height={height}
            _deltaX={_deltaX}
            symbol={symbol}
            exchange={exchange}
            onAddToWl={onAddToWl}
        />
    );
};

const ListActions = (
    { damping, tension, symbol, exchange, children, onAddWl, onSnapToPoint },
    ref
) => {
    const _interactable = useRef();
    const [_deltaX] = useState(() => new Animated.Value(0));
    const [height, setHeight] = useState(0);

    const curOnAddToWl = () => onAddWl && onAddWl({ symbol, exchange });

    const snapPoints = getSnapPoint({ damping, tension });

    const onLayout = useCallback((e) => {
        setHeight(e.nativeEvent.layout.height);
    }, []);

    const onSnap = ({ nativeEvent: { x, state } }) => {
        x !== 0 &&
            onSnapToPoint &&
            onSnapToPoint(() => _interactable.current && _interactable.current.snapTo && _interactable.current.snapTo({ index: 0 }));
    };

    return (
        <View onLayout={onLayout}>
            <LeftContent
                onAddToWl={curOnAddToWl}
                _deltaX={_deltaX}
                height={height}
                symbol={symbol}
                exchange={exchange}
            />
            <Interactable.View
                ref={_interactable}
                isSibling
                horizontalOnly
                snapPoints={snapPoints}
                animatedValueX={_deltaX}
                onSnap={onSnap}
            >
                {children}
            </Interactable.View>
        </View>
    );
};

ListActions.defaultProps = {
    damping: 1 - 0.7,
    tension: 300
};

export default ListActions;

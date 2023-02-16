import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated'
import Ionicons from 'react-native-vector-icons/Ionicons';

import CommonStyle, { register } from '~/theme/theme_controller'

const { height: heightDevices } = Dimensions.get('window')
const Label = ({ label }) => <Text>{label}</Text>;
const Icon = () => <CommonStyle.icons.cheDown style={{
  textAlign: 'center',
  alignSelf: 'center'
}} name={'md-arrow-dropdown'} color={CommonStyle.color.modify} size={14} />;

const useShowOrHide = function ({ opacity }) {
  return useCallback(({ isShow, cb }) => {
    if (isShow) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.ease)
      }).start(() => {
        cb && cb()
      })
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease)
      }).start(() => {
        cb && cb()
      })
    }
  }, [])
}
const useOnPressBackground = function ({ onShowHide, onClose, dic }) {
  return useCallback(() => {
    if (!dic.current.isShow) return
    onShowHide && onShowHide({
      isShow: false,
      cb: () => {
        onClose && onClose()
      }
    })
    dic.current.isShow = false
  }, [])
}
const Selection = ({ children, style, layoutInput, onSelected, onClose, data, selectedValue, styleValue, ...rest }) => {
  const opacity = useMemo(() => {
    return new Animated.Value(0)
  }, [])
  const [isShow, setIsShow] = useState(false)
  const refViewItem = useRef()
  const dic = useRef({ showUp: false, isShow: true, heightItem: 32.5, heightPerItem: 32.5 })

  const onShowHide = useShowOrHide({ opacity })
  const onPressBackground = useOnPressBackground({ onShowHide, onClose, dic })

  useEffect(() => {
    if (isShow) {
      onShowHide({ isShow: true })
    }
  }, [isShow])

  if (!layoutInput) return null

  const handleSelect = useCallback((value) => {
    if (!dic.current.isShow) return
    onShowHide({
      isShow: false,
      cb: () => {
        onClose && onClose()
        onSelected && onSelected(value)
      }
    })
    dic.current.isShow = false
  }, [])
  const heightAllView = dic.current.heightPerItem * data.length
  return (
    <Animated.View
      onStartShouldSetResponder={onPressBackground}
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: CommonStyle.fontDefaultColorOpacity },
        { opacity }
      ]}
      onLayout={() => {
        refViewItem.current && refViewItem.current.measure && refViewItem.current.measure((x, y, w, h, pX, pY) => {
          const tmp = h + layoutInput.current.y
          if (tmp > heightDevices) {
            dic.current.heightItem = h
            dic.current.showUp = true
          }
          setIsShow(true)
        })
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={dic.current.showUp ? {
          maxHeight: layoutInput.current.y - 100,
          zIndex: 1000000,
          marginTop: layoutInput.current.y - heightAllView < 100 ? 100 : layoutInput.current.y - heightAllView,
          marginLeft: layoutInput.current.x
        } : {
          marginTop: layoutInput.current.y,
          marginLeft: layoutInput.current.x,
          zIndex: 1000000
        }}
      >
        <View style={{
          height: dic.current.heightPerItem * data.length + 2 + 1 // 2 la border tren duoi, 1 la border o giua
        }}>
          {data.map((el1, key1) => {
            return (
              <View
                ref={refViewItem}
                style={{
                  position: 'absolute',
                  zIndex: data.length - key1,
                  borderRadius: 8,
                  borderWidth: 1,
                  width: layoutInput.current.width,
                  borderColor: CommonStyle.color.dusk,
                  backgroundColor: CommonStyle.backgroundColor2
                  // top: dic.current.showUp ? layoutInput.current.y - dic.current.heightItem : layoutInput.current.y,
                  // left: layoutInput.current.x
                }}
              >
                {data.slice(0, key1 + 1).map((el1) => (
                  <TouchableOpacity
                    onLayout={e => {
                      dic.current.heightPerItem = e.nativeEvent.layout.height
                    }}
                    onPress={() => {
                      handleSelect && handleSelect(el1);
                    }}
                    testID='selection'
                    style={{
                      paddingVertical: 5,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      borderRadius: 8
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={[{
                        fontSize: CommonStyle.font11,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color: CommonStyle.fontBlue1,
                        alignSelf: 'center',
                        flex: 1,
                        textAlign: 'center'
                      }, styleValue]}
                    >
                      {el1.label}
                    </Text>
                    {el1.key === selectedValue.key && <Icon />}
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>

    </Animated.View >
  );
};

export default Selection;

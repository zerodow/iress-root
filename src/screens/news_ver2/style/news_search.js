import { Platform, StyleSheet, Dimensions, PixelRatio } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../../config';
const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        rowContainer: {
            backgroundColor: 'red',
            // height: 56,
            alignItems: 'center',
            paddingVertical: 6,
            flexDirection: 'column',
            borderBottomWidth: 1,
            borderColor: 'red',
            width: '100%',
            paddingHorizontal: 16
        },
        rowContainerNew: {
            // New Style
            backgroundColor: CommonStyle.ColorTabNews,
            // height: 85,
            // alignItems: 'flex-start',
            // paddingVertical: 6,
            // flexDirection: 'row',
            // borderBottomWidth: 1,
            // borderColor: '#0000001e',
            // width: '100%',
            // paddingHorizontal: 16,
            borderRadius: 8,
            marginHorizontal: 16
            // marginVertical: 4
        },
        dropDownRow: {
            height: 41,
            justifyContent: 'center',
            width: 160,
            paddingLeft: 10
        },
        iconSearch: {
            color: '#8e8e93',
            fontSize: CommonStyle.iconSizeS,
            paddingRight: CommonStyle.paddingDistance2
        },
        searchPlaceHolder: {
            color: '#8e8e93',
            fontSize: CommonStyle.fontSizeS,
            fontFamily: CommonStyle.fontFamily
        },
        searchBar: {
            borderWidth: 1,
            borderColor: CommonStyle.fontBorderGray,
            height: 30,
            borderRadius: CommonStyle.borderRadius,
            flexDirection: 'row',
            alignItems: 'center'
        },
        searchBarContainer: {
            height: 44,
            paddingLeft: CommonStyle.paddingDistance2,
            paddingRight: CommonStyle.paddingDistance2,
            borderBottomWidth: 1,
            borderColor: CommonStyle.fontBorderGray,
            backgroundColor: CommonStyle.backgroundColor,
            justifyContent: 'center'
        },
        searchBarContainer2: {
            height: 40,
            width: '100%',
            flexDirection: 'row',
            marginTop: CommonStyle.marginSize - 4,
            alignItems: 'center',
            paddingLeft: CommonStyle.paddingDistance2,
            backgroundColor: config.colorVersion,
            shadowColor: 'rgba(76,0,0,0)',
            shadowOffset: {
                width: 0,
                height: 0.5
            }
        },
        whiteText: {
            color: '#FFFFFF',
            fontSize: CommonStyle.fontSizeM,
            fontFamily: CommonStyle.fontFamily
        },
        buttonCancel: {
            flex: 2,
            justifyContent: 'center',
            alignItems: 'center'
        },
        buttonCancelClone: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingLeft: 16.5
        },
        inputStyle: {
            backgroundColor: 'transparent',
            width: Platform.OS === 'ios' ? '80%' : '78%',
            color: 'rgba(255, 255, 255, 087)',
            fontSize: CommonStyle.fontSizeS,
            fontFamily: CommonStyle.fontFamily,
            lineHeight: 12,
            height: 40
        },
        iconSearch2: {
            width: Platform.OS === 'ios' ? '10%' : '12%',
            color: '#8e8e93',
            fontSize: CommonStyle.iconSizeS,
            paddingRight: CommonStyle.paddingDistance2,
            paddingLeft: CommonStyle.paddingDistance2
        },
        iconRight2: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: CommonStyle.iconSizeS,
            width: '10%',
            textAlign: 'right',
            paddingRight: CommonStyle.paddingDistance2
        },
        searchBar2: {
            backgroundColor: 'rgba(254, 254, 254, 0.2)',
            flex: 1,
            borderRadius: 5,
            height: 32,
            alignItems: 'center',
            flexDirection: 'row'
        },
        dropDownStyle: {
            borderWidth: 0,
            alignItems: 'center',
            borderRadius: CommonStyle.borderRadius,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowOffset: {
                width: 0,
                height: 5
            },
            shadowOpacity: 1,
            shadowRadius: 20
        },
        normalText: {
            color: 'black',
            fontSize: CommonStyle.fontSizeM
        },
        dropDownContainer: {
            alignItems: 'center',
            borderRadius: 15
        },
        rowColumn: {
            width: '100%',
            flexDirection: 'row'
        },
        colTwoElements30: {
            flexDirection: 'column',
            flex: 0.37
        },
        colTwoElements20: {
            flexDirection: 'column',
            flex: PixelRatio.getFontScale() > 1 ? 0.27 : 0.2
        },
        colTwoElements10: {
            flexDirection: 'column',
            paddingRight: 4
            // flex: 0.1
        },
        colTwoElements70: {
            flexDirection: 'column',
            flex: PixelRatio.getFontScale() > 1 ? 0.63 : 0.7
        },
        colTwoElements35: {
            flexDirection: 'row',
            flex: 0.35
        },
        codeStyle: {
            fontSize: CommonStyle.fontSizeM,
            color: '#000000dd'
        },
        titleStyle: {
            fontSize: CommonStyle.fontSizeS,
            color: '#000000dd'
        },
        updatedStyle: {
            fontSize: CommonStyle.fontSizeXS,
            textAlign: 'right',
            color: '#00000089'
        },
        tagStyle: {
            fontSize: CommonStyle.fontSizeXS,
            textAlign: 'center',
            color: '#FFFFFF'
        },
        iconLeft: {
            color: 'red',
            fontSize: CommonStyle.fontSizeXXL,
            width: '10%',
            textAlign: 'left'
        },
        iconRight: {
            color: '#757575',
            fontSize: CommonStyle.fontSizeXXL,
            width: '10%',
            textAlign: 'right'
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

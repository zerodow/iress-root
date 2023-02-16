import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    Keyboard,
    Platform
} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicon from 'react-native-vector-icons/Ionicons';

import Highlighter from 'react-native-highlight-words';
import {
    resultSearchNewOrderByMaster,
    checkParent
} from '~/lib/base/functionUtil';
import Collapsible from '~/component/collapsible/';
import AddCodeDetail from '~/screens/addcode/addcode.detail.1';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { func, dataStorage } from '~/storage';
import ENUM from '~/enum';
import XComponent from '~/component/xComponent/xComponent';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import RowComp, { Row } from './RowComp';
import { calculateLineHeight } from '~/util';
import * as Business from '~/business';

const { height: HEIGHT } = Dimensions.get('window');
export class RowBase extends RowComp {
    renderLeftIcon() { }
    renderSortIcon() { }

    renderLeftComp(symbol, securityName, istradingHalt) {
        return (
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeL,
                        color: CommonStyle.fontColor
                    }}
                    numberOfLines={1}
                >
                    <Text
                        style={[
                            CommonStyle.textMainRed,
                            {
                                fontFamily: CommonStyle.fontPoppinsBold,
                                fontSize: CommonStyle.fontSizeL
                            }
                        ]}
                    >
                        {istradingHalt ? '! ' : ''}
                    </Text>
                    <Highlighter
                        highlightStyle={
                            this.props.textSearch
                                ? styles.colorHighlight
                                : CommonStyle.fontColor
                        }
                        searchWords={[this.props.textSearch]}
                        textToHighlight={symbol}
                        style={{ opacity: 1 }}
                    />
                </Text>

                <Text
                    numberOfLines={1}
                    style={[
                        {
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeXS,
                            color: CommonStyle.fontCompany
                        },
                        Platform.OS === 'android'
                            ? {
                                lineHeight: calculateLineHeight(
                                    CommonStyle.fontSizeXS
                                )
                            }
                            : {}
                    ]}
                >
                    <Highlighter
                        highlightStyle={
                            this.props.textSearch
                                ? styles.colorHighlight
                                : CommonStyle.fontColor
                        }
                        searchWords={[this.props.textSearch]}
                        textToHighlight={securityName}
                        style={{ opacity: 1 }}
                    />
                </Text>
            </View>
        );
    }

    render() {
        const {
            symbol = '',
            exchanges,
            trading_halt: tradingHalt,
            class: sectionsClass,
            code: sectionsCode,
            display_name: displaySymbol,
            company_name: companyName,
            company,
            security_name: securityName
        } = this.props.data || {};

        // const displaySymbol = Business.getSymbolName({ symbol });

        const classSymbol = Business.getSymbolClassDisplay(sectionsClass);

        if (!sectionsCode) return <View />;

        const companyNameDis = companyName || company || securityName;
        const exchange = exchanges && exchanges[0];
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8
                    // paddingHorizontal: 16
                }}
            >
                {this.renderLeftIcon(symbol)}
                <Row>
                    {this.renderLeftComp(symbol, companyNameDis, tradingHalt)}
                    {this.renderRightComp(symbol, classSymbol, exchange)}
                </Row>
            </View>
        );
    }
}
const styles = {};

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        containerHeader: {
            flexDirection: 'row',
            borderBottomColor: '#rgba(0, 0, 0, 0.12);',
            borderBottomWidth: 0.5,
            marginVertical: 10,
            marginHorizontal: 8
        },
        content: {
            marginLeft: 54,
            flexDirection: 'row'
        },
        containerHeaderActive: {
            height: HEIGHT / 14,
            flexDirection: 'row',
            marginTop: HEIGHT / 30
        },
        detailCode: {
            marginLeft: 5
        },
        textStyleContent: {
            fontSize: CommonStyle.fontSizeS,
            fontFamily: 'HelveticaNeue-Medium',
            fontWeight: '500',
            color: '#000000'
        },
        textColorSymbolContent: {
            color: '#000000'
        },
        textColorNameContent: {
            color: '#000000'
        },
        textStyleHeader: {
            fontSize: CommonStyle.fontSizeM,
            fontFamily: 'HelveticaNeue-Medium',
            fontWeight: '500',
            flex: 1,
            color: '#000000'
        },
        textStyleHeaderActive: {
            fontSize: CommonStyle.fontSizeM,
            fontFamily: 'HelveticaNeue-Medium',
            fontWeight: '500',
            flex: 1,
            color: '#359ee4'
        },
        colorHighlight: {
            color: CommonStyle.color.modify,
            opacity: 1
        },
        iconAddButton: {
            justifyContent: 'center',
            alignItems: 'center',
            width: 24
        }
        // iconAddButtonParent: {
        //   paddingRight: 5,
        //   paddingLeft: 17,
        //   paddingVertical: 10,
        //   alignItems: 'center'
        // }
    });
    PureFunc.assignKeepRef(styles, newStyle);
}
getNewestStyle();
register(getNewestStyle);

const mapStateToProps = (state) => {
    return {
        textFontSize: state.setting.textFontSize
    };
};
export default connect(mapStateToProps)(RowBase);

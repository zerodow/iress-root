import { Platform, StyleSheet, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const { height, width } = Dimensions.get('window');

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        container: {
            height: height,
            backgroundColor: 'white',
            ...Platform.select({
                ios: {
                    paddingTop: 64
                }
            })
        },
        progressBar: {
            backgroundColor: '#0a0a0a',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        },
        listHeading: {
            paddingHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            marginTop: 32
        },
        buttonWrapper: {
            width: '95%',
            height: 36,
            borderRadius: CommonStyle.borderRadius,
            alignItems: 'center',
            justifyContent: 'center'
        },
        listHeadingLeft: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: CommonStyle.fontSizeL
        },
        listHeadingRight: {
            color: 'white',
            ...Platform.select({
                ios: {
                    fontSize: CommonStyle.font15
                },
                android: {
                    fontSize: CommonStyle.fontSizeM
                }
            })
        },
        browseList: {
            marginTop: 30,
            paddingHorizontal: 16,
            ...Platform.select({
                ios: {
                    marginBottom: 60
                },
                android: {
                    marginBottom: 30
                }
            })
        },
        browseListItem: {
            ...Platform.select({
                ios: {
                    paddingVertical: 8
                },
                android: {
                    paddingVertical: 10
                }
            }),
            flexDirection: 'row'
        },
        browseListItemText: {
            flex: 1,
            color: 'white',
            paddingLeft: 10,
            ...Platform.select({
                ios: {
                    fontSize: CommonStyle.font15,
                    fontWeight: '500'
                },
                android: {
                    fontSize: CommonStyle.fontSizeM,
                    fontWeight: '100'
                }
            })
        },
        text: {
            color: '#74888C'
        },
        blueText: {
            color: 'blue'
        },
        header: {
            backgroundColor: 'white',
            flexDirection: 'row',
            paddingLeft: 15,
            paddingRight: 15,
            height: 40,
            alignItems: 'center',
            width: '100%'
        },
        rowData: {
            backgroundColor: 'white',
            flexDirection: 'row',
            paddingLeft: 15,
            paddingRight: 15,
            height: 50,
            alignItems: 'center',
            width: '100%',
            borderTopWidth: 1,
            borderColor: '#0000001e'
        },
        textCol1: {
            width: '20%'
        },
        textCol2: {
            width: '25%'
        },
        textCol3: {
            width: '23%',
            textAlign: 'right'
        },
        textCol4: {
            width: '25%',
            textAlign: 'right'
        },
        textCol5: {
            width: '7%',
            textAlign: 'right'
        },
        buttonWraper: {
            width: '93%',
            flexDirection: 'row',
            paddingLeft: 15
        },
        expandRow: {
            width: '100%',
            // flex: 1,
            flexDirection: 'row',
            // height: 24,
            paddingTop: 4
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default styles;

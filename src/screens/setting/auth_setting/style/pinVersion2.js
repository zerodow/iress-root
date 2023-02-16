import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { Dimensions } from 'react-native'
const { width: WIDTH_DEVICE } = Dimensions.get('window')

const styles = {}

function getNewestStyle() {
    const newStyle = {
		header: {
			rootStyles: {
				justifyContent: 'flex-end'
			},
			firstChildStyles: {
			},
			rightStyles: {
				flex: 1.2
			},
			leftComponent: {
				container: {
					flex: 1,
					justifyContent: 'center',
					alignItems: 'flex-start',
					paddingLeft: 16
				}
			},
			title: {
				container: {
					flex: 4,
					justifyContent: 'flex-end',
					paddingRight: 20
				},
				text: {
					color: CommonStyle.fontWhite,
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.fontSizeXXL
				}
			},
			rightComponent: {
				container: {
					width: WIDTH_DEVICE * 0.2,
					alignSelf: 'flex-end',
					justifyContent: 'center',
					alignItems: 'flex-end',
					paddingRight: 16
				},
				text: {
					color: CommonStyle.fontWhite,
					fontFamily: CommonStyle.fontPoppinsBold,
					fontSize: CommonStyle.fontSizeM
				}
			}
		},
		content: {
			container: {
				height: '100%',
				width: '100%',
				backgroundColor: CommonStyle.pinVersion2.changePinBackgroundColor,
				justifyContent: 'space-around'
			},
			description: {
				container: {
					justifyContent: 'center',
					alignItems: 'center',
					flex: 0.7
				},
				text: {
					fontSize: CommonStyle.fontSizeM,
					fontFamily: CommonStyle.fontPoppinsRegular,
					color: CommonStyle.fontWhite
				}
			},
			animatedView: {
				container: {
					justifyContent: 'space-around',
					flex: 5
				},
				pinInput: {
					container: {
						flex: 2
					},
					pinBoxContainer: {
						flex: 1
					},
					errorContainer: {
						flex: 1,
						marginHorizontal: 32,
						alignItems: 'center'
					}
				},
				numpadContainer: {
					flex: 8,
					justifyContent: 'center',
					bottom: 15
				}
			}
		}
	}

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
export default styles;

import CommonStyle, { register } from '~/theme/theme_controller';
export default {
    container: {
        flexDirection: 'row',
        backgroundColor: CommonStyle.color.error,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center'
    },
    text: {
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeXS,
        color: CommonStyle.fontDark
    }
}

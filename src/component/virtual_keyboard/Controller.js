export const checkMaxDecimal = ({ text = '', decimal }) => {
    const index = text.indexOf('.')
    if (index === -1) return false
    const decimalString = text.substring(index + 1)
    console.log('DCM ', decimalString, decimalString.length)
    const lengthDecimal = decimalString.length
    if (lengthDecimal > decimal) {
        return true
    } else {
        return false
    }
}
export function checkDuplicateDot({ text = '' }) {
    const dots = text.split('.')
    if (dots.length > 2) {
        return true
    }
    return false
}
export function checkDotAtStart({ text }) {
    const index = text.indexOf('.')
    if (index === 0) {
        return true
    }
    return false
}

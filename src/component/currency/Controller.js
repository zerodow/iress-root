export function getCurrencyByCode({ currencyCode }) {
    switch (currencyCode) {
        case 'AUD':
        case 'HKD':
        case 'USD':
        case 'CAD':
        case 'NZD':
        case 'SGD':
            return '$'
        case 'EUR':
            return '€'
        case 'GBP':
            return '£'
        case 'ZAR':
            return 'R'
        case 'TZS':
            return 'TSh'
        case 'KRW':
            return '₩'
        case 'JPY':
        case 'CNY':
            return '¥'
        case 'CHF':
            return 'CHF'
        case 'THB':
            return '฿'
        default:
            return '$'
    }
}

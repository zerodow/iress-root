import { ERROR_SYSTEM } from '~/component/error_system/Constants.js'
export function isErrorSystemByCode({ code }) {
    if (ERROR_SYSTEM[code]) {
        return true
    } else {
        return false
    }
}

let model = {
    code: null,
    message: null
}
export function setCode(code) {
    model.code = code
}
export function getCode() {
    return model.code
}
export function setMessage(msg) {
    model.message = msg
}
export function getMessage() {
    return model.message
}
export function detroy() {
    model = {
        code: null,
        message: null
    }
}

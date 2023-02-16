const model = {
    inputFocus: null,
    inputChangeText: false
}
export function setInputFocus(keyInput) {
    model.inputFocus = keyInput
}
export function getInputFocus() {
    return model.inputFocus
}
export function setInputChangeText(inputChangeText) {
    model.inputChangeText = inputChangeText
}
export function getInputChangeText() {
    return model.inputChangeText
}
export function reset() {
    model.inputFocus = null
    model.inputChangeText = null
}

const model = {
    data: null,
    onData: () => { }
}
export function setData(data) {
    model.data = data
}
export function getData() {
    return model.getData
}
export function setOnDataFunction(onData) {
    model.onData = onData
}
export function getOnDataFunction() {
    return model.onData
}
export function exOnDataFunction() {
    model.onData && model.data && model.onData(model.data)
}

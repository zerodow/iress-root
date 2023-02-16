let ObjectText = {}

function text() {
    return {
        logStartReq: `#{1} url: "#{2}" with data: #{3}`,
        logReqSuccess: `#{1} success at url: "#{2}", time: #{3}, data: #{4}`,
        logReqFailRes: `#{1} fail at url: "#{2}", time: #{3}, statusCode: #{4}, message: "#{5}", statusText: "#{6}"`,
        logReqFail: `#{1} fail at url: "#{2}", time: #{3}, message: "#{4}"`
    }
}

export function reset() {
    ObjectText = text()
}

export function getTxt() {
    const [key, ...params] = arguments
    let str = ObjectText[key]

    if (str == null) return ''

    params.map((item, index) => {
        const reg = new RegExp(`#\\{${index + 1}\\}`, 'g')
        str = str.replace(reg, item)
    })
    return str
}

ObjectText = text()

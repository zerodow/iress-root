function clone(a) {
    const type = Object.prototype.toString.call(a)

    switch (type) {
        case '[object Number]':
        case '[object String]':
        case '[object Boolean]':
        case '[object Undefined]':
        case '[object Null]':
            return a
        case '[object Object]':
            const newObj = {}
            for (const key in a) {
                newObj[key] = clone(a[key])
            }
            return newObj
        case '[object Array]':
            return a.map(item => clone(item))
        case '[object Date]':
            return new Date(+a)
        default:
            return a
    }
}

module.exports = clone

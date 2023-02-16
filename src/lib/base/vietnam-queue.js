module.exports = class VietNamQueue {
    constructor() {
        this.push = this.push.bind(this);
        this.exec = this.exec.bind(this);
        this.do = this.do.bind(this);

        this.queue = [];
    }

    push(func, param) {
        this.queue.push({ func, param });
        this.queue.length === 1 && this.do();
    }

    exec(item, cb) {
        item ? item.func(item.param).then(cb).catch(cb) : cb();
    }

    do() {
        const lastItem = this.queue[0];
        this.exec(lastItem, () => {
            this.queue.shift();
            this.queue.length > 0 && this.do();
        });
    }
}

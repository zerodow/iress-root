
import firebase from '../../firebase';
export default class Performance {
    constructor(name) {
        this.name = name;
        this.starting = false;
        this.perf = null;
        if (firebase.perf && this.name) {
            this.perf = firebase.perf().newTrace(this.name);
            // this.start();
        }
    }
    start() {
        return;
        this.starting = true;
        this.perf && this.perf.start();
    }
    stop() {
        return;
        if (this.starting) {
            this.perf && this.perf.stop();
        }
        this.starting = false;
    }
    incrementCounter(incrementName) {
        return;
        if (this.starting) {
            if (incrementName) this.perf && this.perf.incrementCounter(incrementName);
        }
    }
}

import Reactotron, { networking } from 'reactotron-react-native';
import { reactotronRedux as reduxPlugin } from 'reactotron-redux';
import sagaPlugin from 'reactotron-redux-saga';
import Immutable from 'seamless-immutable';
import Snoopy from 'rn-snoopy';
import { stringify } from 'rn-snoopy/formatting';
import bars from 'rn-snoopy/stream/bars';
import filter from 'rn-snoopy/stream/filter';
import buffer from 'rn-snoopy/stream/buffer';
import equixNetworkingPlugin from './equixNetworkingPlugin';

import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';

let reactotron = null;

if (__DEV__) {
    // const emitter = new EventEmitter();

    // const events = Snoopy.stream(emitter);
    // filter({ type: Snoopy.TO_NATIVE }, true)(events).subscribe();
    // filter({ method: 'updateView' }, true)(events).subscribe();
    // bars()(buffer()(events)).subscribe();

    // https://github.com/infinitered/reactotron for more options!
    reactotron = Reactotron.configure({ name: 'equix' })
        .useReactNative({
            networking: false
        })
        .use(reduxPlugin())
        .use(sagaPlugin())
        .use(equixNetworkingPlugin())
        .connect();

    // Let's clear Reactotron on every time we load the app
    Reactotron.clear();

    // Totally hacky, but this allows you to not both importing reactotron-react-native
    // on every file.  This is just DEV mode, so no big deal.
    console.info = Reactotron.log;
}

export default reactotron;

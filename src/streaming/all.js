import * as Api from '../api';
import * as StreamingBusiness from './streaming_business';
import Nchan from '../nchan.1';

const dicNchanObj = {};

const closeConnection = currentNchan => {
    currentNchan && currentNchan.close && currentNchan.close();
    currentNchan = null;
}

const connectNchan = (type, id, onData) => {
    const url = Api.getStreamingAllUrl(type, id);
    const fnGetOption = StreamingBusiness.getOptionStream;

    return new Promise(resolve => {
        const newNchanObj = new Nchan({
            url,
            fnGetOption,
            onData,
            timeout: 20000,
            onConnect: () => resolve(newNchanObj),
            onError: () => resolve(newNchanObj)
        });
    });
};

export function sub(type, id, funcOnData) {
    return new Promise(resolve => {
        if (dicNchanObj[type] && dicNchanObj[type].id === id) return resolve();

        connectNchan(type, id, funcOnData)
            .then(newNchanObj => {
                if (dicNchanObj[type]) closeConnection(dicNchanObj[type].nchan);
                dicNchanObj[type] = {
                    id, type, nchan: newNchanObj
                };
                return resolve();
            })
    });
};

export function unsub(type, id) {
    dicNchanObj[type] &&
        dicNchanObj[type].id === id &&
        dicNchanObj[type].nchan &&
        dicNchanObj[type].nchan.close()
};

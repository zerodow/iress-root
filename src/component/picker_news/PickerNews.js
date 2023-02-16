import React from 'react';
import { Text, View } from 'react-native';
import PickerWithParent from './PickerWithParent'
import PickerWithoutParent from './PickerWithoutParent'
import PickerDefault from './PickerDefault'
import { TYPE } from './constants'
const PickerNews = (props) => {
    const { type } = props
    switch (type) {
        case TYPE.WITHOUT_PARENT:
            return <PickerWithoutParent {...props} />
        case TYPE.WITH_PARENT:
            return <PickerWithParent {...props} />
        default:
            return <PickerDefault {...props} />
    }
};

export default PickerNews;

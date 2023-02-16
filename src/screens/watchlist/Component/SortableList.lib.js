import React, { Component } from 'react'

import Animated from 'react-native-reanimated';

import { SortableMultilist } from 'react-native-sortable-multilist';

const {
    Value
} = Animated

const getIsDataMultipleLists = (data) => Array.isArray(data[0]);
const setUpInitialData = (data) => {
    const isDataMultipleLists = getIsDataMultipleLists(data);
    if (isDataMultipleLists) {
        const flatData = data.reduce((acc, arr, arrayIndex) => {
            return [
                ...acc,
                ...arr.map((item, itemIndex) => ({
                    ...item,
                    arrayIndex,
                    draggableId: acc.length + itemIndex,
                    draggableIdValue: new Value(acc.length + itemIndex),
                    itemTranslateY: new Value(0),
                    itemKey: acc.length + itemIndex
                }))
            ];
        }, []);
        return flatData;
    }
    const dataWithId = data.map((item, index) => {
        return {
            ...item,
            draggableId: index,
            draggableIdValue: new Value(index),
            arrayIndex: 0,
            itemTranslateY: new Value(0),
            itemKey: index
        };
    });
    return dataWithId;
};

export default class SortableListLib extends SortableMultilist {
    constructor(props) {
        super(props)
        // Sau khi delete code, keo ra ngoài vùng boundaries -> exception thư viên nên cần update lại boundaries
        this.updateListSortable = (deletedIndex) => {
            try {
                // Update data
                const isDataMultipleLists = getIsDataMultipleLists(this.props.data);
                const dataWithId = setUpInitialData(this.props.data);
                this.dataWithProps = dataWithId;
                this.dataToSave = this.props.data;
                // Update itemBoundaries
                let top = 0
                let bottom = 0
                const currentItemBoundaries = [...this.state.itemBoundaries]
                const itemBoundariesWithoutDeletedIndex = currentItemBoundaries.filter((item, index) => index !== deletedIndex)
                const updatedItemBoundaries = []
                itemBoundariesWithoutDeletedIndex.map((item, index) => {
                    const { top: topItem, bottom: bottomItem } = item
                    const distanceItem = bottomItem - topItem
                    // First item -> Assign top, bottom , distance
                    if (index === 0) {
                        top = topItem
                        bottom = bottomItem
                    } else {
                        // Top = previous Bottom, Bottom = top + curDistance
                        top = bottom
                        bottom = top + distanceItem
                    }
                    updatedItemBoundaries.push({
                        top,
                        bottom
                    })
                })
                console.log('DCM SORT LIB updatedItemBoundaries', currentItemBoundaries, updatedItemBoundaries)
                this.setState({
                    dataWithId,
                    isDataMultipleLists,
                    itemBoundaries: updatedItemBoundaries
                });
            } catch (error) {
                console.log('SORTABLE LIB updateListSortable EXCEPTION', error)
            }
        }

        this.getReorderedData = () => {
            const { dataWithProps } = this;
            if (this.activeHoverIndex === -1 || this.activeHoverArrayIndex === -1) {
                return dataWithProps;
            }
            const { arrayIndex: activeItemArrayIndex } = dataWithProps[this.activeItemIndex] || {};
            if (activeItemArrayIndex !== this.activeHoverArrayIndex) {
                return dataWithProps;
            }
            const dataWithoutActive = dataWithProps.filter((item) => item.draggableId !== this.activeItemIndex);
            const head = this.activeHoverIndex === 0
                ? []
                : dataWithoutActive.slice(0, this.activeHoverIndex);
            const tail = dataWithoutActive.slice(this.activeHoverIndex);
            const updatedDataList = [
                ...head,
                dataWithProps[this.activeItemIndex],
                ...tail
            ];
            const remappedIds = updatedDataList.map((item, index) => ({
                ...item,
                draggableId: index,
                draggableIdValue: new Animated.Value(index)
            }));
            return remappedIds;
        };
    }

    componentDidMount() {
        this.props.setRef && this.props.setRef(this)
    }
}

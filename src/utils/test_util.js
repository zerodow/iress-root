import { shallow } from 'enzyme'
import React from 'react'
import * as PureFunc from './pure_func'

const EmptyFunc = PureFunc.emptyFunc
const TrueFunc = PureFunc.trueFunc

export function mockRnLifeCycle(CustomComponent) {
    const listMock = []

    CustomComponent.prototype.componentWillMount &&
        listMock.push(jest
            .spyOn(CustomComponent.prototype, 'componentWillMount')
            .mockImplementation(EmptyFunc))
    CustomComponent.prototype.componentDidMount &&
        listMock.push(jest
            .spyOn(CustomComponent.prototype, 'componentDidMount')
            .mockImplementation(EmptyFunc))
    CustomComponent.prototype.componentWillReceiveProps &&
        listMock.push(jest
            .spyOn(CustomComponent.prototype, 'componentWillReceiveProps')
            .mockImplementation(EmptyFunc))
    CustomComponent.prototype.shouldComponentUpdate &&
        listMock.push(jest
            .spyOn(CustomComponent.prototype, 'shouldComponentUpdate')
            .mockImplementation(TrueFunc))
    CustomComponent.prototype.componentWillUpdate &&
        listMock.push(jest
            .spyOn(CustomComponent.prototype, 'componentWillUpdate')
            .mockImplementation(EmptyFunc))
    CustomComponent.prototype.componentDidUpdate &&
        listMock.push(jest
            .spyOn(CustomComponent.prototype, 'componentDidUpdate')
            .mockImplementation(EmptyFunc))
    CustomComponent.prototype.componentWillUnmount &&
        listMock.push(jest
            .spyOn(CustomComponent.prototype, 'componentWillUnmount')
            .mockImplementation(EmptyFunc))

    return listMock
}

export function restoreMockRnLifeCycle(listRnLifeCycle) {
    listRnLifeCycle.map(fn => fn.mockRestore())
}

export function initCustomComponent({ getProps, newProps, CustomComponent, ConnectComponent, store }) {
    const defaultProps = getProps()
    const mergeProps = PureFunc.merge(defaultProps, newProps || {})
    if (store) mergeProps.store = store

    const WrapComponent = ConnectComponent || CustomComponent
    const listRnLifeCycle = mockRnLifeCycle(CustomComponent)
    const element = shallow(<WrapComponent {...mergeProps} />)
    const instance = store
        ? element.dive().instance()
        : element.instance()
    restoreMockRnLifeCycle(listRnLifeCycle)

    return { element, instance }
}

export function updatePropsCustomComponent({ getProps, newProps, CustomComponent, element, store }) {
    const defaultProps = getProps()
    const mergeProps = PureFunc.merge(defaultProps, newProps || {})
    if (store) mergeProps.store = store

    const listRnLifeCycle = mockRnLifeCycle(CustomComponent)
    element.setProps(mergeProps)
    const instance = store
        ? element.dive().instance()
        : element.instance()
    restoreMockRnLifeCycle(listRnLifeCycle)

    return { instance }
}

export function afterEach(reset) {
    jest.clearAllMocks()
    jest.resetAllMocks()
    jest.restoreAllMocks()
    reset()
}

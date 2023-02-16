import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { createReducer, createActions } from 'reduxsauce';
import Immutable from 'seamless-immutable';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

const { Types, Creators } = createActions({
    showModal: ['children'],
    hideModal: null
});

export const ModalActions = Creators;

export const INITIAL_STATE = Immutable({
    children: null,
    visiable: false
});

export const showModal = (state, { children }) =>
    state.merge({ visiable: true, children });
export const hideModal = (state) =>
    state.merge({ visiable: false, children: null });

export const reducer = createReducer(INITIAL_STATE, {
    [Types.SHOW_MODAL]: showModal,
    [Types.HIDE_MODAL]: hideModal
});

export const useModal = () => {
    const dispatch = useDispatch();
    const showModal = (p) => dispatch(ModalActions.showModal(p));
    const closeModal = () => dispatch(ModalActions.hideModal());
    return [showModal, closeModal];
};

export const useModal2 = () => {
    const dispatch = useDispatch();
    const showModal = (p) => dispatch.modalRematch.showModal(p);
    const closeModal = () => dispatch.modalRematch.hideModal();
    return [showModal, closeModal];
};

export const model = {
    state: {
        children: null,
        visiable: false
    },
    reducers: {
        showModal: (state, payload) => {
            state.visiable = true;
            state.children = payload;
            return state;
        },
        hideModal: (state) => {
            state.visiable = false;
            state.children = null;
            return state;
        }
    }
};

const Modal = ({ isRematch }) => {
    const { visiable, children } = useSelector((state) =>
        isRematch ? state.modalRematch : state.modal
    );
    const [showModal, closeModal] = isRematch ? useModal2() : useModal();

    useEffect(() => {
        visiable && closeModal();
    }, []);

    if (!visiable) return null;

    let content = children;
    if (typeof children === 'function') {
        content = children();
    }

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback
                onPress={closeModal}
                style={styles.closePanel}
            >
                <View style={styles.content} />
            </TouchableWithoutFeedback>
            {content}
        </View>
    );
};

export default Modal;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
        closePanel: {
            width: '100%',
            height: '100%',
            position: 'absolute'
        },
        container: {
            width: '100%',
            height: '100%',
            zIndex: 100,
            position: 'absolute'
        },
        content: {
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: CommonStyle.color.bg,
            opacity: 0.85
        }
    });
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

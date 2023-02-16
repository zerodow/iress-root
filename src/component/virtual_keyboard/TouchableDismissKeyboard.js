import React from 'react';
import { Text, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import * as Bussines from '~/business'
const TouchableWithoutFeedbackKeyBoard = ({
    children
}) => (
        <TouchableWithoutFeedback onPress={() => {
            // Keyboard.dismiss()
            Bussines.showButtonConfirm && Bussines.showButtonConfirm()
        }}>
            {
                children
            }
        </TouchableWithoutFeedback>
    );

export default TouchableWithoutFeedbackKeyBoard;

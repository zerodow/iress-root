import React from 'react'
import { Platform, UIManager } from 'react-native'
let currentlyFocusedID = null;
const inputs = new Set();

/**
 * Returns the ID of the currently focused text field, if one exists
 * If no text field is focused it returns null
 */
function currentlyFocusedField() {
  return currentlyFocusedID;
}

/**
 * @param {number} TextInputID id of the text field to focus
 * Focuses the specified text field
 * noop if the text field was already focused
 */
function focusTextInput(textFieldID) {
  if (currentlyFocusedID !== textFieldID && textFieldID !== null) {
    currentlyFocusedID = textFieldID;
    if (Platform.OS === 'ios') {
      UIManager.focus(textFieldID);
    } else if (Platform.OS === 'android') {
      UIManager.dispatchViewManagerCommand(
        textFieldID,
        UIManager.getViewManagerConfig('AndroidTextInput').Commands
          .focusTextInput,
        null
      );
    }
  }
}

/**
 * @param {number} textFieldID id of the text field to unfocus
 * Unfocuses the specified text field
 * noop if it wasn't focused
 */
function blurTextInput(textFieldID) {
  if (currentlyFocusedID === textFieldID && textFieldID !== null) {
    currentlyFocusedID = null;
    if (Platform.OS === 'ios') {
      UIManager.blur(textFieldID);
    } else if (Platform.OS === 'android') {
      UIManager.dispatchViewManagerCommand(
        textFieldID,
        UIManager.getViewManagerConfig('AndroidTextInput').Commands
          .blurTextInput,
        null
      );
    }
  }
}

function registerInput(textFieldID) {
  inputs.add(textFieldID);
}

function unregisterInput(textFieldID) {
  inputs.delete(textFieldID);
}

function isTextInput(textFieldID) {
  return inputs.has(textFieldID);
}

module.exports = {
  currentlyFocusedField,
  focusTextInput,
  blurTextInput,
  registerInput,
  unregisterInput,
  isTextInput
};

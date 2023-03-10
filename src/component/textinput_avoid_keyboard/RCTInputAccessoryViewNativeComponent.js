/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */
'use strict';
import React from 'react'
import { StyleSheet, Platform } from 'react-native'
const requireNativeComponent = require('requireNativeComponent');

module.exports = ((requireNativeComponent(
  'RCTInputAccessoryView'
)));

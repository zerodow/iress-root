#!/bin/bash
BASE_DIR=`pwd`;
function addNoSSOToCreateOktaConfig(){
    local dir="${BASE_DIR}";

    cp -rf "${dir}/scripts/okta/index.js" "${dir}/node_modules/@okta/okta-react-native/"
    cp -rf "${dir}/scripts/okta/OktaSdkBridge.swift" "${dir}/node_modules/@okta/okta-react-native/ios/OktaSdkBridge/"
    cp -rf "${dir}/scripts/okta/ReactNativeOktaSdkBridge.m" "${dir}/node_modules/@okta/okta-react-native/ios/OktaSdkBridge/"
}

addNoSSOToCreateOktaConfig;
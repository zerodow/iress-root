import React, { Component, PropTypes } from 'react';
import I18n from '../src/modules/language/';
import { dataStorage } from './storage';
import * as api from './api';
import {
    logDevice,
    checkHomeScreenIsDisableAndReplace
} from './lib/base/functionUtil';
import * as Controller from './memory/controller';
import ENUM from './enum';
const { ROLE_USER, ROLE_DETAIL, PRIORITY_SCREEN } = ENUM;
let selected = {};
const roleData = {
    actor: 'anh.nguyen',
    data: {
        group_id: 'UG2',
        group_name: 'ADVISOR',
        group_detail: null,
        list_role: [
            // 'MARKET_1014',
            // 'MARKET_1015',
            // 'MARKET_1016',
            // 'ANALYSIS_2010',
            // 'ANALYSIS_2011',
            // 'ANALYSIS_2012',
            // 'TRADING_3038',
            // 'TRADING_3039',
            // 'TRADING_3040',
            // 'ACCOUNT_4025',
            // 'ACCOUNT_4026',
            // 'ACCOUNT_4027',
            // 'ACCOUNT_4028',
            // 'ACCOUNT_4029',
            // 'ACCOUNT_4030',
            // 'SETTING_5008',
            // 'OPERATION_6053',
            // 'OPERATION_6054',
            // 'OPERATION_6055',
            // 'ORDER_PAD_7012'
        ],
        main_menu_role: [],
        dic_role: {}
    }
};

export function getBaseRole() {
    return roleData.data.list_role;
}

export function getRoleGroupName() {
    return roleData.data.group_name;
}

export function getRoleData() {
    return new Promise((resolve) => {
        const userGroupId = Controller.getUserGroup();
        const urlUserGroup = api.getUrlUserRole(userGroupId);

        api.requestData(urlUserGroup, true)
            .then((data) => {
                if (data) {
                    const responseRoleData = data.data[0];
                    roleData.actor = data.actor;
                    roleData.data.group_id = responseRoleData.group_id;
                    roleData.data.group_name = responseRoleData.group_name;
                    roleData.data.group_detail = responseRoleData.group_detail;
                    roleData.data.list_role = responseRoleData.list_role
                        ? responseRoleData.list_role
                        : [];
                    roleData.data.main_menu_role = responseRoleData.list_role
                        ? responseRoleData.list_role.filter(
                              (e) => e && e.startsWith('MAINMENU')
                          )
                        : [];
                    listRoleDataRemake();
                    checkHomeScreenIsDisableAndReplace();
                    logDevice(
                        'info',
                        `GET DataRoleUser URL: ${urlUserGroup} - DATA: ${JSON.stringify(
                            data
                        )}`
                    );
                    resolve();
                } else {
                    logDevice(
                        'error',
                        `GET DataRoleUser NULL - URL: ${urlUserGroup}`
                    );
                    resolve();
                }
            })
            .catch((err) => {
                logDevice(
                    'error',
                    `GET DataRoleUser ERROR - URL: ${urlUserGroup} - err: ${err}`
                );
                resolve();
            });
    });
}

function listRoleDataRemake() {
    roleData.data.dic_role = {}; // Reset dic role
    const {
        data: { list_role: listRole, dic_role: dicRole }
    } = roleData;

    listRole.map((e) => {
        dicRole[e] = true;
    });
}
export function checkRoleByKey(key) {
    return true;

    if (!Controller.getLoginStatus()) return true;
    const {
        data: { dic_role: dicRole }
    } = roleData;

    if (dicRole[key] === true) {
        return true;
    }
    return false;
}

export function startScreen() {
    const {
        data: { main_menu_role: mainMenuRole }
    } = roleData;
    const listScreen = {};

    if (mainMenuRole.length <= 0) {
        selected = {
            id: -1,
            text: 'appInfo',
            menuSelected: ENUM.MENU_SELECTED.appInfo
        };
        return selected;
    }

    mainMenuRole.map((element) => {
        if (PRIORITY_SCREEN[element]) {
            listScreen[PRIORITY_SCREEN[element].id] = {
                id: PRIORITY_SCREEN[element].id,
                text: PRIORITY_SCREEN[element].text,
                menuSelected: PRIORITY_SCREEN[element].menuSelected
            };
        }
    });

    if (listScreen[dataStorage.homeScreen]) {
        selected = listScreen[dataStorage.homeScreen];
        return selected;
    }

    if (Object.keys(listScreen).length < 1) {
        selected = {
            id: -1,
            text: 'appInfo',
            menuSelected: ENUM.MENU_SELECTED.appInfo
        };
        return selected;
    }

    const minID = Math.min(...Object.keys(listScreen));

    selected = {
        id: minID,
        text: listScreen[minID].text,
        menuSelected: listScreen[minID].menuSelected
    };
    return selected;
}

export function getScreenText() {
    return I18n.t(selected.text || '');
}

export function getScreenMenuSelected() {
    return selected.menuSelected;
}

export function getSelectedScreen(role) {
    return PRIORITY_SCREEN[role].id;
}

export function getSelectedScreenText(role) {
    return PRIORITY_SCREEN[role].text;
}

export function isNewOrderScreenSelected(selectedScreenID) {
    try {
        const enumNewOrder = ENUM.ROLE_USER.ROLE_NEW_ORDER;
        const newOrderScreenID = PRIORITY_SCREEN[enumNewOrder].id;
        return newOrderScreenID === selectedScreenID;
    } catch (error) {
        console.catch(error);
        return false;
    }
}

export function isViewOnly() {
    try {
        const listRole = [
            ROLE_USER.ROLE_NEW_ORDER,
            ROLE_DETAIL.PLACE_BUY_SELL_NEW_ORDER,
            ROLE_DETAIL.CONFIRM_PLACE_BUY_SELL_NEW_ORDER,
            ROLE_DETAIL.MODIFY_BUY_SELL_ORDER,
            ROLE_DETAIL.CONFIRM_MODIFY_BUY_OR_SELL_ORDER,
            ROLE_DETAIL.CONFIRM_CANCEL_BUY_OR_SELL_ORDER,
            ROLE_DETAIL.PERFORM_BUY_SELL_BUTTON,
            ROLE_DETAIL.PERFORM_MODIFY_ORDER_BUTTON,
            ROLE_DETAIL.PERFORM_CANCEL_ORDER_BUTTON,
            ROLE_DETAIL.PERFORM_CANCEL_ORDER_BUTTON,
            ROLE_DETAIL.PERFORM_MODIFY_ORDER_BUTTON_DETAIL,
            ROLE_DETAIL.PERFORM_CANCEL_ORDER_BUTTON_DETAIL,
            ROLE_DETAIL.PERFORM_NEW_ORDER_BUTTON_DETAIL,
            ROLE_DETAIL.PERFORM_BUY_SELL_BUTTON_DEPTH,
            ROLE_DETAIL.PERFORM_NEW_ORDER_BUTTON_PORTFOLIO,
            ROLE_DETAIL.PERFORM_CLOSE_ORDER_BUTTON,
            ROLE_DETAIL.PERFORM_NEW_ORDER_QUICK_BUTTON,
            ROLE_DETAIL.PERFORM_BUY_SELL_UNIVERSALSEARCH_BUTTON,
            ROLE_DETAIL.PERFORM_MODIFY_ORDER_UNIVERSALSEARCH_BUTTON,
            ROLE_DETAIL.PERFROM_CANCEL_UNIVERSALSEARCH_BUTTON,
            ROLE_DETAIL.PERFORM_NEW_ORDER_UNIVERSALSEARCH_BUTTON,
            ROLE_DETAIL.PERFORM_CLOSE_ORDER_UNIVERSALSEARCH_BUTTONL
        ];

        for (const role of listRole) {
            if (checkRoleByKey(role)) return false;
        }
        return true;
    } catch (error) {
        console.catch(error);
        return true;
    }
}

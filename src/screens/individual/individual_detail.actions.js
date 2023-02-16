import firebase from '../../firebase';
import { dataStorage, func } from '../../storage';
import { Alert } from 'react-native';
let navigation;
const userId = func.getUserId();

export function changedProperty(type, field, index, val) {
  return dispatch => {
    dispatch(changedField(type, field, index, val));
  };
}

export function changedApplicantCountry(index, order, country) {
  const payload = { order, country };
  return {
    type: 'INDIVIDUAL_APPLICANT_CHANGED_COUNTRY_FIELD',
    index,
    payload
  };
}

export function changedField(type, field, index, val) {
  const payload = { field, val };
  switch (type) {
    case 'applicant':
      return {
        type: 'INDIVIDUAL_CHANGED_APPLICANT_FIELD',
        payload,
        index: index
      };
    case 'chess':
      if (field !== 'accountHolders') {
        return {
          type: 'INDIVIDUAL_CHANGED_CHESS_FIELD',
          payload
        }
      } else {
        return {
          type: 'INDIVIDUAL_CHANGED_CHESS_ACCOUNT_HOLDER_FIELD',
          payload,
          index: index
        }
      }
    case 'linked':
      return {
        type: 'INDIVIDUAL_CHANGED_LINKED_FIELD',
        payload
      };
    case 'applicantToTrade':
      return {
        type: 'INDIVIDUAL_CHANGED_APPLICANT_TO_TRADE_FIELD',
        payload
      };
    case 'trading':
      return {
        type: 'INDIVIDUAL_CHANGED_TRADING_FIELD',
        index,
        payload
      };
    default: break;
  }
}

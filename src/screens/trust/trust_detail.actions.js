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
    type: 'TRUST_APPLICANT_CHANGED_COUNTRY_FIELD',
    index,
    payload
  };
}

export function changedField(type, field, index, val) {
  const payload = { field, val };
  switch (type) {
    case 'trust':
      return {
        type: 'TRUST_CHANGED_TRUST_FIELD',
        payload
      };
    case 'company':
      return {
        type: 'TRUST_CHANGED_COMPANY_FIELD',
        payload
      };
    case 'applicant':
      return {
        type: 'TRUST_CHANGED_APPLICANT_FIELD',
        payload,
        index: index
      };
    case 'additional':
      return {
        type: 'TRUST_CHANGED_ADDITIONAL_FIELD',
        payload,
        index: index
      };
    case 'beneficial':
      return {
        type: 'TRUST_CHANGED_BENEFICIAL_FIELD',
        index,
        payload
      };
    case 'trading':
      return {
        type: 'TRUST_CHANGED_TRADING_FIELD',
        index,
        payload
      };
    case 'chess':
      if (field !== 'accountHolders') {
        return {
          type: 'TRUST_CHANGED_CHESS_FIELD',
          payload
        }
      } else {
        return {
          type: 'TRUST_CHANGED_CHESS_ACCOUNT_HOLDER_FIELD',
          payload,
          index: index
        }
      }
    case 'linked':
      return {
        type: 'TRUST_CHANGED_LINKED_FIELD',
        payload
      };
    case 'interest':
      return {
        type: 'TRUST_CHANGED_INTEREST_FIELD',
        payload
      };
    case 'applicantToTrade':
      return {
        type: 'TRUST_CHANGED_APPLICANT_TO_TRADE_FIELD',
        payload
      };
    default: break;
  }
}

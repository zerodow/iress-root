import * as loginActions from '../login/login.actions';
import { getSymbolInfo } from '../../app.actions';

import OpenPriceHeaderComp from './new_open_price.header';
import OpenPriceHeaderCompClone from './new_open_price_header.clone';

import PriceContentComp from './new_open_price.content';

import ListTransactionComp from './new_open_price.transaction';
import ListTransactionCompClone from './new_open_price.transaction.clone'

export const OpenPriceHeader = OpenPriceHeaderComp;
export const PriceContent = PriceContentComp;
export const ListTransaction = ListTransactionComp;

loginActions['getSymbolInfo'] = getSymbolInfo;

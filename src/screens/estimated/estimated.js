import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import I18n from '../../modules/language';
import styles from './style/estimated';
import { getDateStringWithFormat, convertToDate } from '../../lib/base/dateTime';
import { formatNumber, roundFloat } from '../../lib/base/functionUtil';
import moment from 'moment';
import Big from 'big.js';
import { ReportHeader } from './../financial/financial';
import { dataStorage } from '../../storage'

const fakeData = {
  interim: {
    divDate: '17/09/2016',
    amount: '0.10',
    paymentDate: '14/10/2016',
    credit: '214.29',
    franking: '100.00',
    dividend: '500.00',
    balance: '5000'
  },
  final: {
    divDate: '18/03/2010',
    amount: '0.125',
    paymentDate: '07/07/2010',
    credit: '267.86',
    franking: '100.00',
    dividend: '625.00',
    balance: '3600'
  }
}

export class SubReport extends Component {
  renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={[{ width: '15%' }, styles.whiteTextHeader]}>{this.props.code}</Text>
        <Text style={[{ width: '85%', paddingLeft: 32, textAlign: 'right' }, styles.whiteTextHeader]}>{this.props.company}</Text>
      </View>
    );
  }

  renderHeaderContent() {
    return (
      <View style={styles.headerContent}>
        <View style={styles.col1}>
          <Text style={styles.headerMainText}>{I18n.t('typeUpper')}</Text>
          <Text style={styles.headerSubText}>{I18n.t('exDivDate')}</Text>
        </View>
        <View style={styles.col2}>
          <Text style={[styles.headerMainText, { textAlign: 'right' }]}>{I18n.t('divAmount')}</Text>
          <Text style={[styles.headerSubText, { textAlign: 'right' }]}>{I18n.t('paymentDate')}</Text>
        </View>
        <View style={styles.col3}>
          <Text style={[styles.headerMainText, { textAlign: 'right' }]}>{I18n.t('frankingCredit')}</Text>
          <Text style={[styles.headerSubText, { textAlign: 'right' }]}>{I18n.t('frankingPercent')}</Text>
        </View>
        <View style={styles.col4}>
          <Text style={[styles.headerMainText, { textAlign: 'right' }]}>{I18n.t('estDividend')}</Text>
          <Text style={[styles.headerSubText, { textAlign: 'right' }]}>{I18n.t('balanceUpper')}</Text>
        </View>
      </View>
    );
  }

  renderRowContent() {
    const data = this.props.data;
    return (
      <View style={{ width: '100%', paddingLeft: 16 }}>
        <View style={[styles.rowContent, { borderBottomWidth: 1, borderColor: '#0000001e' }]}>
          <View style={styles.col1}>
            <Text style={styles.contentMainText}>{I18n.t('interim')}</Text>
            <Text style={styles.contentSubText}>{data.interim.divDate}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={[styles.contentMainText, { textAlign: 'right' }]}>{roundFloat(data.interim.amount, 2)}</Text>
            <Text style={[styles.contentSubText, { textAlign: 'right' }]}>{data.interim.paymentDate}</Text>
          </View>
          <View style={styles.col3}>
            <Text style={[styles.contentMainText, { textAlign: 'right' }]}>{roundFloat(data.interim.credit, 2)}</Text>
            <Text style={[styles.contentSubText, { textAlign: 'right' }]}>{`${roundFloat(data.interim.franking, 2)}%`}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={[styles.contentMainText, { textAlign: 'right' }]}>{roundFloat(data.interim.dividend, 2)}</Text>
            <Text style={[styles.contentSubText, { textAlign: 'right' }]}>{formatNumber(data.interim.balance)}</Text>
          </View>
        </View>
        <View style={styles.rowContent}>
          <View style={styles.col1}>
            <Text style={styles.contentMainText}>{I18n.t('final')}</Text>
            <Text style={styles.contentSubText}>{data.final.divDate}</Text>
          </View>
          <View style={styles.col2}>
            <Text style={[styles.contentMainText, { textAlign: 'right' }]}>{roundFloat(data.final.amount, 2)}</Text>
            <Text style={[styles.contentSubText, { textAlign: 'right' }]}>{data.final.paymentDate}</Text>
          </View>
          <View style={styles.col3}>
            <Text style={[styles.contentMainText, { textAlign: 'right' }]}>{roundFloat(data.final.credit, 2)}</Text>
            <Text style={[styles.contentSubText, { textAlign: 'right' }]}>{`${roundFloat(data.final.franking, 2)}%`}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={[styles.contentMainText, { textAlign: 'right' }]}>{roundFloat(data.final.dividend, 2)}</Text>
            <Text style={[styles.contentSubText, { textAlign: 'right' }]}>{formatNumber(data.final.balance)}</Text>
          </View>
        </View>
      </View>
    );
  }

  renderFooter() {
    const interimCredit = new Big(this.props.data.interim.credit.toString());
    const totalCredit = interimCredit.plus(this.props.data.final.credit.toString());
    const interimDividend = new Big(this.props.data.interim.dividend.toString());
    const totalDividend = interimDividend.plus(this.props.data.final.dividend.toString());
    return (
      <View style={styles.headerContent}>
        <Text style={[styles.textFooter, { width: '45%' }]}>{I18n.t('totalUpper')}</Text>
        <Text style={[styles.textFooter, { width: '29%', textAlign: 'right' }]}>{roundFloat(totalCredit, 2)}</Text>
        <Text style={[styles.textFooter, { width: '26%', textAlign: 'right' }]}>{roundFloat(totalDividend, 2)}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={[{ width: '100%' }, this.props.style]}>
        {this.renderHeader()}
        {this.renderHeaderContent()}
        {this.renderRowContent()}
        {this.renderFooter()}
      </View>
    );
  }
}

export default class EstimatedSummary extends Component {
  render() {
    const fromYear = moment(this.props.fromDate).format('YYYY');
    const toYear = moment(this.props.toDate).format('YYYY');
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <ReportHeader
            reportName={I18n.t('estimatedDividenSummary')}
            fromDate={this.props.fromDate}
            toDate={this.props.toDate} />
          <SubReport
            style={{ marginBottom: 30 }}
            code={'CXP'}
            company={'Corporate Express Ordinary'}
            data={fakeData} />
          <SubReport
            code={'MTS'}
            company={'Metcash Limited Ordinary'}
            data={fakeData} />
        </ScrollView>
      </View>
    );
  }
}

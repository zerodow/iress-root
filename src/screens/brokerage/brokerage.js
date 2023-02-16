import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import I18n from '../../modules/language';
import styles from './style/brokerage';
import { getDateStringWithFormat, convertToDate, getMonthBetween } from '../../lib/base/dateTime';
import { formatNumber, roundFloat } from '../../lib/base/functionUtil';
import { ReportHeader } from './../financial/financial';
import moment from 'moment';
import Big from 'big.js';
import { dataStorage } from '../../storage'

const listdata = [
  {
    brokerage: {
      amount: 16.77,
      gst: 1.68,
      total: 18.45
    },
    informationServices: {
      amount: 12.23,
      gst: 0.54,
      total: 12.77
    }
  },
  {
    brokerage: {
      amount: 16.77,
      gst: 1.68,
      total: 18.45
    },
    informationServices: {
      amount: 12.23,
      gst: 0.54,
      total: 12.77
    }
  },
  {
    brokerage: {
      amount: 16.77,
      gst: 1.68,
      total: 18.45
    },
    informationServices: {
      amount: 12.23,
      gst: 0.54,
      total: 12.77
    }
  },
  {
    brokerage: {
      amount: 16.77,
      gst: 1.68,
      total: 18.45
    },
    informationServices: {
      amount: 12.23,
      gst: 0.54,
      total: 12.77
    }
  },
  {
    brokerage: {
      amount: 16.77,
      gst: 1.68,
      total: 18.45
    },
    informationServices: {
      amount: 12.23,
      gst: 0.54,
      total: 12.77
    }
  },
  {
    brokerage: {
      amount: 16.77,
      gst: 1.68,
      total: 18.45
    },
    informationServices: {
      amount: 12.23,
      gst: 0.54,
      total: 12.77
    }
  },
  {
    brokerage: {
      amount: 16.77,
      gst: 1.68,
      total: 18.45
    },
    informationServices: {
      amount: 12.23,
      gst: 0.54,
      total: 12.77
    }
  }
]

export class SubReport extends Component {
  renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={[styles.col1, styles.whiteTextHeader]}>{this.props.headerTime}</Text>
        <Text style={[styles.col2, styles.whiteTextHeader]}>{I18n.t('amount')}</Text>
        <Text style={[styles.col2, styles.whiteTextHeader]}>{I18n.t('gst')}</Text>
        <Text style={[styles.col2, styles.whiteTextHeader]}>{I18n.t('total')}</Text>
      </View>
    );
  }

  renderContent() {
    const data = this.props.data;
    return (
      <View style={{ width: '100%', paddingRight: 16 }}>
        <View style={[styles.rowContent, { borderBottomWidth: 1, borderColor: '#0000001e' }]}>
          <Text style={[styles.contentText, styles.col1]}>{I18n.t('brokerage')}</Text>
          <Text style={[styles.contentText, styles.col2]}>{data.brokerage.amount}</Text>
          <Text style={[styles.contentText, styles.col2]}>{data.brokerage.gst}</Text>
          <Text style={[styles.contentText, styles.col2]}>{data.brokerage.total}</Text>
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.contentText, styles.col1]}>{I18n.t('informationServices')}</Text>
          <Text style={[styles.contentText, styles.col2]}>{data.informationServices.amount}</Text>
          <Text style={[styles.contentText, styles.col2]}>{data.informationServices.gst}</Text>
          <Text style={[styles.contentText, styles.col2]}>{data.informationServices.total}</Text>
        </View>
      </View>
    );
  }

  renderFooter() {
    const brokerageAmount = new Big(this.props.data.brokerage.amount.toString());
    const totalAmount = brokerageAmount.plus(this.props.data.informationServices.amount.toString());
    const brokerageGst = new Big(this.props.data.brokerage.gst.toString());
    const totalGst = brokerageGst.plus(this.props.data.informationServices.gst.toString());
    const brokerageTotal = new Big(this.props.data.brokerage.total.toString());
    const total = brokerageTotal.plus(this.props.data.informationServices.total.toString());
    return (
      <View style={styles.footer}>
        <Text style={[styles.contentText, styles.col1]}></Text>
        <Text style={[styles.contentText, styles.col2]}>{totalAmount.toString()}</Text>
        <Text style={[styles.contentText, styles.col2]}>{totalGst.toString()}</Text>
        <Text style={[styles.contentText, styles.col2]}>{total.toString()}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={{ width: '100%' }}>
        {this.renderHeader()}
        {this.renderContent()}
        {this.renderFooter()}
      </View>
    );
  }
}

export default class BrokerageSummary extends Component {
  renderFooter(title, amount, gst, total) {
    return (
      <View style={styles.header}>
        <Text style={[styles.col1, styles.whiteTextHeader]}>{title}</Text>
        <Text style={[styles.col2, styles.whiteTextHeader]}>{roundFloat(amount, 2)}</Text>
        <Text style={[styles.col2, styles.whiteTextHeader]}>{roundFloat(gst, 2)}</Text>
        <Text style={[styles.col2, styles.whiteTextHeader]}>{roundFloat(total, 2)}</Text>
      </View>
    );
  }

  render() {
    const listTime = getMonthBetween('01/10/2016', '30/4/2017');
    let amountTotalBrokerage = new Big('0');
    let gstTotalBrokerage = new Big('0');
    let totalBrokerage = new Big('0');
    let amountTotalInformation = new Big('0');
    let gstTotalInformation = new Big('0');
    let totalInformation = new Big('0');
    listdata.map((e, i) => {
      amountTotalBrokerage = amountTotalBrokerage.plus(e.brokerage.amount);
      gstTotalBrokerage = gstTotalBrokerage.plus(e.brokerage.gst);
      totalBrokerage = totalBrokerage.plus(e.brokerage.total);
      amountTotalInformation = amountTotalInformation.plus(e.informationServices.amount);
      gstTotalInformation = gstTotalInformation.plus(e.informationServices.gst);
      totalInformation = totalInformation.plus(e.informationServices.total);
    })
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <ReportHeader
            reportName={I18n.t('brokerageInformationServices')}
            fromDate={'01/10/2016'}
            toDate={'30/4/2017'} />
          {
            listTime.map((e, i) =>
              <SubReport
                key={i}
                headerTime={e}
                data={listdata[i]} />
            )
          }
          {this.renderFooter(I18n.t('brokerageTotal'), amountTotalBrokerage, gstTotalBrokerage, totalBrokerage)}
          <View style={{ height: 30, width: '100%' }}></View>
          {this.renderFooter(I18n.t('informationServicesTotal'), amountTotalInformation, gstTotalInformation, totalInformation)}
        </ScrollView>
      </View>
    );
  }
}

import React, { Component } from 'react';
import { View, Text } from 'react-native';
import SingleRow from './single_row';
import DoubleRow from './double_row';
import CheckboxHorizontal from './checkbox_horizontal';
import styles from './style/account_detail';
import I18n from '../../modules/language';

export default class BeneficialOwnership extends Component {
  renderTitle(title) {
    return (
      <Text style={styles.title}>{title}</Text>
    );
  }

  render() {
    return (
      <View style={{ width: '100%' }}>
        {
          this.props.data.map((e, i) => {
            let person = `BENEFICIAL OWNER ${i + 1}`;
            return (
              <View style={{ width: '100%', paddingLeft: 16 }}>
                {this.renderTitle(person)}
                <SingleRow title={I18n.tEn('fullName')} data={e.fullName} />
                <SingleRow title={I18n.tEn('residentialAddress2')} data={e.fullName} />
                <SingleRow title={I18n.tEn('DOB2')} data={e.dob} />
                <SingleRow title={I18n.tEn('isBeneficial')} data={e.isBeneficial} />
                <SingleRow title={I18n.tEn('hasBeneficial')} data={e.hasBeneficial} />
              </View>
            );
          })
        }
      </View>
    )
  }
}

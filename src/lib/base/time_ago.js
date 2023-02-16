import timeago from 'timeago.js';
import I18n from '../../../src/modules/language/'
import { dataStorage } from '../../storage';
// the local dict example is below.
var functionAgo = function (number, index, total) {
    // number: the timeago / timein number;
    // index: the index of array below;
    // total_sec: total seconds between date to be formatted and today's date;
    return [
        [`${I18n.t('justNow')}`, 'right now'],
        [`%s ${I18n.t('secondsAgo')}`, 'in %s seconds'],
        [`${I18n.t('minuteAgo')}`, 'in 1 minute'],
        [`%s ${I18n.t('minutesAgo')}`, 'in %s minutes'],
        [`${I18n.t('hourAgo')}`, 'in 1 hour'],
        [`%s ${I18n.t('hoursAgo')}`, 'in %s hours'],
        [`${I18n.t('dayAgo')}`, 'in 1 day'],
        [`%s ${I18n.t('daysAgo')}`, 'in %s days'],
        [`${I18n.t('weekAgo')}`, 'in 1 week'],
        [`%s ${I18n.t('weeksAgo')}`, 'in %s weeks'],
        [`${I18n.t('monthAgo')}`, 'in 1 month'],
        [`%s ${I18n.t('monthsAgo')}`, 'in %s months'],
        [`${I18n.t('yearAgo')}`, 'in 1 year'],
        [`%s ${I18n.t('yearsAgo')}`, 'in %s years']
    ][index];
};
// register your locale with timeago
timeago.register('qe_local', functionAgo);
// use the locale with timeago instance
const timeagoInstance = timeago();
export default timeagoInstance;


/**
* Class that handles Date and Time related operations.
*/
import * as Controller from '../../memory/controller'
const moment = require('moment');
const momentTimeZone = require('moment-timezone');
const { isNullOrEmpty, StringFormat, getTimezoneByLocation } = require('./functionUtil');

moment.locale('en'); // set time theo chuan quoc te

// format time full theo chuan vietnam
export function getFullDateTimeFormat() {
    return 'DD/MM/YYYY HH:mm:ss';
};

// format date theo chuan vietnam
export function getDateFormat() {
    return 'DD/MM/YYYY';
};

// format date theo chuan vietnam (dd/mm(text)/yyyy)
export function getDateFormatMMText() {
    return 'DD MMM YYYY';
};

// format time theo chuan vietnam
export function getTimeFormat() {
    return 'HH:mm:ss';
};

// format time full to file
export function getFullFileSaverDateTimeFormat() {
    return 'YYMMDD_HHmmss';
};

// format time
export function format(date, format) {
    return moment(date).format(format);
};

// truyen vao datetime, tra ra la 1 so tu 0-6
export function getdayOfWeek(date) {
    return moment(date).day();
};

// check value is Date
export function isValidDate(value) {
    if (value == null) return false;
    if (value.getDate) {
        return true;
    }
    return false;
};

// valid string to date with format
export function validateDateWithFormat(datetimeString, format) {
    try {
        if (format !== undefined) return moment(datetimeString, format, true).isValid();
        return false;
    } catch (e) {
        console.error(e);
    }
    return false;
};

// convert string to date with format
export function convertToDateWithFormat(datetimeString, format) {
    try {
        if (format !== undefined) {
            return moment(datetimeString, format).toDate();
        }
        return convertToDatetime(datetimeString);
    } catch (e) {
        console.error(e);
    }
    return null;
};

// convert string to date
export function convertToDatetime(datetimeString) {
    try {
        return moment(datetimeString,
            [getFullDateTimeFormat(), getDateFormat(), getFullFileSaverDateTimeFormat(), moment.ISO_8601])
            .toDate();
    } catch (e) {
        console.error(e);
    }
    return null;
};

// tra ve do chenh lech giua 2 khoang thoi gian tinh theo ngay
export function dateDiff(date1, date2) {
    return moment(date1).diff(moment(date2), 'days');
};

// tra ve do chenh lech giua 2 khoang thoi gian tinh theo mili giay
export function timeDiff(date1, date2) {
    return moment(date1).diff(moment(date2));
};

// dau vao la datetime, dau ra la datetime chi ghi nhan ngay, khong co gio
export function getDateOnly(time) {
    return moment(time).startOf('day').toDate();
};

// lay tong so minisecond theo time truyen vao
export function getMiliSeconds(hour, minutes, second) {
    return hour * 3600000 + minutes * 60000 + second * 1000;
};

// chuyen thoi gian sang UTC
export function convertToUTCTime(localTime) {
    return moment(localTime).utc().valueOf();
};

//
export function convertToUTCTime2(timeNow) {
    try {
        if (timeNow === null) return null;
        const now = new Date(timeNow);
        return now.getTime() + (now.getTimezoneOffset() * 60000)
    } catch (error) {
        return null;
    }
}

//
export function convertToLocalTime2(timeNow) {
    try {
        if (timeNow === null) return null;
        const now = new Date(timeNow);
        return now.getTime() - (now.getTimezoneOffset() * 60000)
    } catch (error) {
        return null;
    }
}

// ham tra ve nam tai thoi diem hien tai
export function getCurrentYear() {
    var d = new Date();
    var y = d.getFullYear();
    return y;
};

// kiem tra xem time co trong khoang thoi gian start end hay ko?
export function inRange(timeStart, timeEnd, timeCheck) {
    if (moment(timeStart).isSame(timeCheck)) return true;
    if (moment(timeEnd).isSame(timeCheck)) return true;
    else {
        if (moment(timeCheck).isBefore(timeEnd) && moment(timeStart).isBefore(timeCheck)) return true;
    }
    return false;
};

// neu time1 > time2 => 1
// neu time1 = time2 => 0
// neu time1 < time2 => -1
export function compareDateTime(time1, time2) {
    if (moment(time1).isSame(time2)) return 0;
    else {
        if (moment(time1).isBefore(time2)) return -1;
        else return 1;
    }
};

// neu time1 > time2 => 1
// neu time1 = time2 => 0
// neu time1 < time2 => -1
export function compareDate(time1, time2) {
    var change = moment(time1).diff(moment(time2), 'days');
    if (change < 0) return -1;
    if (change > 0) return 1;
    return 0;
};

// tra ve ngay dau tien cua thang
export function getStartOfMonth(time, month) {
    var date = new Date(time.getFullYear(), month, 1); // chon ngay dau thang
    if (compareDate(time, date) < 0) date = moment(date).subtract(1, 'y').toDate(); // lui ve nguyen 1 nam
    return date;
};

// tra ve ngay cuoi cung cua thang
export function getEndOfMonth(time, month) {
    var date = moment({ y: time.getFullYear(), M: month, d: 1 }).add(1, 'M').subtract(1, 'd').toDate(); // chon thang dau thang tiep theo, lui ve ngay cuoi thang
    if (compareDate(time, date) < 0) {
        if (compareDate(time, moment(date).subtract(1, 'M').toDate()) < 0) { // kiem tra xem co trong thang hay ko
            date = moment(date).subtract(1, 'y').toDate(); // lui ve nguyen 1 nam
        }
    }
    return date;
};

// convert string 'DD/MM/YYYY' to date.
export function convertToDate(datetimeString) {
    try {
        if (isNullOrEmpty(datetimeString)) return null;
        if (typeof datetimeString !== 'string') {
            return datetimeString;
        }
        return moment(datetimeString,
            [getFullDateTimeFormat(), getDateFormat(), getFullFileSaverDateTimeFormat(), moment.ISO_8601]
        ).startOf('day').toDate();
    } catch (e) {
        console.error(e);
    }
    return null;
};

// them sec vao date
export function addSecondsToTime(time, secs) {
    return moment(time).add(secs, 's').toDate();
};
// them ngay vao date va chuyen ve chi ghi nhan ngay, ko co gio
export function addDaysToTime(time, days, startDay = true) {
    if (!startDay) {
        return moment(time).add(days, 'd').toDate();
    }
    return moment(time).add(days, 'd').startOf('day').toDate();
};
// them tuan vao date va chuyen ve chi ghi nhan ngay, ko co gio
export function addWeekToTime(time, days) {
    return moment(time).add(days, 'w').startOf('day').toDate();
};

// them thang vao date va chuyen ve chi ghi nhan ngay, ko co gio
export function addMonthsToTime(time, months, startDay = true) {
    if (!startDay) {
        return moment(time).add(months, 'M').toDate();
    }
    return moment(time).add(months, 'M').startOf('day').toDate();
};

// chuyen ve gio local
export function convertToLocalTime(utcTime) {
    return moment.utc(utcTime).local().toDate();
};

// chuyen tu string datetime utc thanh gio local
export function convertToLocalTimeString(strUtcTime) {
    var utcTime = convertToUTCTime(convertToDatetime(strUtcTime));
    return convertToLocalTime(utcTime);
};

// xk
// tra ve string date MM(text)
export function getDateStringMMText(input) {
    if (input == null) return input;
    if (typeof input === 'string' || input instanceof String) {
        // neu la string thi convert theo format
        return moment(input,
            [getFullDateTimeFormat(), getDateFormat_MM_Text(), getFullFileSaverDateTimeFormat(), moment.ISO_8601])
            .format(getDateFormat_MM_Text());
    } else {
        // neu khac thi de moment tu convert
        return moment(input).format(getDateFormat_MM_Text());
    }
};

// tra ve string date
export function getDateString(input) {
    if (input == null) return input;
    if (typeof input === 'string' || input instanceof String) {
        // neu la string thi convert theo format
        return moment(input,
            [getFullDateTimeFormat(), getDateFormat(), getFullFileSaverDateTimeFormat(), moment.ISO_8601])
            .format(getDateFormat());
    } else {
        // neu khac thi de moment tu convert
        return moment(input).format(getDateFormat());
    }
};

// tra ve string date
export function getDateStringWithFormat(input, format) {
    if (input == null) return input;
    return moment(input).format(format);
    // if (typeof input === 'string') {
    //     // neu la string thi convert theo format
    //     return moment(input,
    //         [getFullDateTimeFormat(), getDateFormat(), getFullFileSaverDateTimeFormat(), moment.ISO_8601])
    //         .format(format());
    // } else {
    //     // neu khac thi de moment tu convert

    // }
};

// tra ve string time
export function getTimeString(input, formatTime) {
    if (input == null) return input;

    if (formatTime != null) {
        if (typeof input === 'string' || input instanceof String) {
            // neu la string thi convert theo format
            return moment(input, formatTime).format(formatTime);
        } else {
            return moment(input).format(formatTime);
        }
    } else {
        if (typeof input === 'string' || input instanceof String) {
            // neu la string thi convert theo format
            return moment(input, getTimeFormat()).format(getTimeFormat());
        } else {
            return moment(input).format(getTimeFormat());
        }
    }
};

// tra ve string date time
export function getDateTimeFullString(input) {
    if (input == null) return input;
    if (typeof input === 'string' || input instanceof String) {
        // neu la string thi convert theo format
        return moment(input,
            [getFullDateTimeFormat(), getDateFormat(), getFullFileSaverDateTimeFormat(), moment.ISO_8601])
            .format(getFullDateTimeFormat());
    } else {
        // neu khac thi de moment tu convert
        return moment(input).format(getFullDateTimeFormat());
    }
};

// chuyen Timestamp tra ve obj gio phut giay
export function convertTimeStampToToDayObjTime(input) {
    let result = {};

    var date = new Date(input * 1000);
    var hours = date.getHours();
    var minutes = '0' + date.getMinutes();
    var seconds = '0' + date.getSeconds();
    result = {
        h: hours,
        m: minutes.substr(-2),
        s: seconds.substr(-2)
    }
    return result;
}

const listMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function getMonthBetween(d1, d2) {
    const date1 = moment(d1, 'DD/MM/YYYY');
    const date2 = moment(d2, 'DD/MM/YYYY');
    const diff = date2.diff(date1, 'months');
    const listTime = [];
    for (let i = 0; i <= diff; i++) {
        const m = date1.month();
        let tmp = m + i;
        let y = date1.year();
        if (tmp > 11) {
            tmp -= 12;
            y += 1;
        }
        listTime.push(`${listMonth[tmp]} ${y}`);
    }
    return listTime;
}
// get timestamp start of day by location
export function getTimeStampStartDayByLocation(timestamp, location = momentTimeZone.tz.guess()) {
    return momentTimeZone.tz(timestamp, location).startOf('day').valueOf()
}

// get timestamp end of day by location
export function getTimeStampEndDayByLocation(timestamp, location = momentTimeZone.tz.guess()) {
    return momentTimeZone.tz(timestamp, location).endOf('day').valueOf()
}

export function convertDateToTimeStampByLocation(stringDate, format, location = momentTimeZone.tz.guess()) {
    return momentTimeZone.tz(stringDate, format, location).valueOf()
}

export function convertToDateString({ timeStamp, startDay = true, location }) {
    // const timezone = getTimezoneByLocation(location)
    // const timeStampLocation = convertToCustomTimezone(timeStamp, timezone)
    const newDate = new Date(timeStamp)
    const date = newDate.getDate()
    const month = newDate.getMonth() + 1
    const year = newDate.getFullYear()
    const dateString = `${date}/${month}/${year}`
    let timeString = '00:00:00.000'
    if (!startDay) {
        timeString = '23:59:59.999'
    }
    return convertDateToTimeStampByLocation(`${dateString} ${timeString}`, 'DD/MM/YYYY HH:mm:ss.SSS', location)
}

export function convertToUtcDate({ dateString, startDay = true, location = momentTimeZone.tz.guess(), formatInput = 'DD/MM/YY HH:mm:ss.SSS', formatOutPut = 'DD/MM/YY' }) {
    let timeString = '00:00:00.000'
    if (!startDay) {
        timeString = '23:59:59.999'
    }
    const dateLocation = momentTimeZone.tz(`${dateString} ${timeString}`, formatInput, location = momentTimeZone.tz.guess())
    return dateLocation.utc().format(formatOutPut)
}

export function convertToUtcDateByTimeStamp({ timeStamp, startDay = true, location = momentTimeZone.tz.guess(), formatInput = 'DD/MM/YYYY HH:mm:ss.SSS', formatOutPut = 'DD/MM/YY HH:mm:ss.SSS', duration = 'day' }) {
    const newDate = new Date(timeStamp)
    const date = newDate.getDate()
    const month = newDate.getMonth() + 1
    const year = newDate.getFullYear()
    const dateString = `${date}/${month}/${year}`
    let timeString = '00:00:00.000'
    if (!startDay) {
        timeString = '23:59:59.999'
    }
    const dateLocation = momentTimeZone.tz(`${dateString} ${timeString}`, formatInput, location)
    const dateStringUTC = dateLocation.utc().format(formatOutPut)
    const dateUTC = dateStringUTC.split(' ')[0]
    const timeUTC = dateStringUTC.split(' ')[1]
    return `${dateUTC}-${timeUTC}`
}

export const convertToCustomTimezone = (time, timezone = getCurrentTimezone()) => {
    const currentTimezone = getCurrentTimezone();
    return time + (timezone - currentTimezone) * 60 * 60 * 1000;
}

export const getCurrentTimezone = () => {
    return (-1 * new Date().getTimezoneOffset()) / 60;
}

export function convertTimeStampUTCToTimeLocation(timeStamp, location = momentTimeZone.tz.guess(), format) {
    return momentTimeZone.tz(timeStamp, location).format(format)
}

export function convertToUtcDateByTimeStampAndDuration({ timeStamp, location, formatInput = 'DD/MM/YYYY HH:mm:ss.SSS', formatOutPut = 'DD/MM/YY HH:mm', duration = 'day' }) {
    const toDate = convertToUtcDateByTimeStamp({ timeStamp: timeStamp, location, startDay: false })
    let endTimeStamp = timeStamp
    let fromDate = convertToUtcDateByTimeStamp({ timeStamp: timeStamp, location })
    switch (duration) {
        case 'day':
            return { fromDate, toDate }
        case 'week':
            endTimeStamp = timeStamp - 1000 * 60 * 60 * 24 * 6
            fromDate = convertToUtcDateByTimeStamp({ timeStamp: endTimeStamp, location })
            return { fromDate, toDate }
        case 'month':
            endTimeStamp = timeStamp - 1000 * 60 * 60 * 24 * 29
            fromDate = convertToUtcDateByTimeStamp({ timeStamp: endTimeStamp, location })
            return { fromDate, toDate }
        case 'quarter':
            endTimeStamp = timeStamp - 1000 * 60 * 60 * 24 * 89
            fromDate = convertToUtcDateByTimeStamp({ timeStamp: endTimeStamp, location })
            return { fromDate, toDate }
        case 'year':
            endTimeStamp = timeStamp - 1000 * 60 * 60 * 24 * 364
            fromDate = convertToUtcDateByTimeStamp({ timeStamp: endTimeStamp, location })
            return { fromDate, toDate }
        default:
            return { fromDate, toDate }
    }
}

export function convertLocalTimeToSettingTime(timeStamp) {
    const location = Controller.getLocation().location || momentTimeZone.tz.guess()
    return momentTimeZone.tz(timeStamp, location).valueOf()
}

export function convertLocationToStartDaySettingTime(timeStamp) {
    const location = Controller.getLocation().location || momentTimeZone.tz.guess()
    return momentTimeZone.tz(timeStamp, location).startOf('day').valueOf()
}

export function convertLocationToEndDaySettingTime(timeStamp) {
    const location = Controller.getLocation().location || momentTimeZone.tz.guess()
    return momentTimeZone.tz(timeStamp, location).endOf('day').valueOf()
}

export function getTimeStartDay(time) {
    return moment(time).startOf('day').valueOf()
}

export function getTimeEndDay(time) {
    return moment(time).endOf('day').valueOf()
}
export function convertToTimeStampWithFormat(datetimeString, format) {
    try {
        if (format !== undefined) {
            return moment(datetimeString, format).valueOf();
        }
        return moment(datetimeString).valueOf()
    } catch (e) {
        console.error(e);
    }
    return null;
};
export function getMinutesFromTimeStamp(timeStamp) {
    return Math.round(timeStamp / 1000 / 60)
}

import React, { } from 'react'
import { processColor } from 'react-native'
import I18n from '~/modules/language/'

const COLORS = [
    'rgb(48,255,143)',
    'rgb(148,0,211)',
    'rgb(87,225,241)',
    'rgb(255,224,0)',
    'rgb(181,48,59)',
    'rgb(8,108,225)'
]
const MAX_SYMBOL = 5

export function useDataChart(positions = []) {
    let values = []
    let otherPercent = 0
    let colors = []
    let newPositions = [...positions]
    newPositions = newPositions.sort((a, b) => {
        return b.market_value - a.market_value
    })
    newPositions.map((item, index) => {
        const { weight_average: percent, symbol, exchange } = item
        if (index < MAX_SYMBOL) {
            values.push({
                value: percent,
                displayName: `${symbol}.${exchange}`,
                color: COLORS[index],
                index
            })
            colors.push(processColor(COLORS[index]))
        } else {
            otherPercent += percent
        }
    })
    if (otherPercent) {
        values.push({
            value: otherPercent,
            displayName: I18n.t('otherDowncase'),
            color: COLORS[MAX_SYMBOL],
            index: MAX_SYMBOL
        }) // Có other percent thì push vào cuối
        colors.push(processColor(COLORS[MAX_SYMBOL])) // Có other percent thì push vào cuối
    }
    return {
        dataSets: [{
            values,
            label: 'Pie dataset',
            config: {
                colors,
                drawValues: false,
                sliceSpace: 0,
                selectionShift: 8
            }
        }]
    }
}

export function useLegendChart() {
    return {
        enabled: false,
        textSize: 15,
        form: 'CIRCLE',
        horizontalAlignment: 'RIGHT',
        verticalAlignment: 'CENTER',
        orientation: 'VERTICAL',
        wordWrapEnabled: true
    }
}

export function useNoteChart(positions = []) {
    let notes = []
    let otherPercent = 0
    let newPositions = [...positions]
    newPositions = newPositions.sort((a, b) => {
        return b.market_value - a.market_value
    })
    newPositions.map((item, index) => {
        const { weight_average: percent, symbol, exchange } = item
        if (index < MAX_SYMBOL) {
            notes.push({
                displayName: `${symbol}.${exchange}`,
                percent,
                color: COLORS[index]
            })
        } else {
            otherPercent += percent
        }
    })
    if (otherPercent) {
        notes.push({
            displayName: I18n.t('otherDowncase'),
            percent: otherPercent,
            color: COLORS[MAX_SYMBOL]
        })
    }
    return notes
}

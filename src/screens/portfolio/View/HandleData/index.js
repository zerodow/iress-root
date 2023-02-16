import React, { useEffect, useCallback, useRef } from 'react'
import PortfolioStreaming from '~s/portfolio/View/HandleData/PortfolioStreaming'

const HandleData = ({ navigator }) => {
    return <React.Fragment>
        <PortfolioStreaming
            navigator={navigator} />
    </React.Fragment>
}

export default HandleData

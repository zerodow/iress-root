
import initialState from '../../reducers/initialState';
export const individual = (state = initialState.individual, action) => {
  switch (action.type) {
    case 'INDIVIDUAL_CHANGED_LINKED_FIELD':
      const newLinkedInfo = { ...state.linked };
      newLinkedInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        linked: newLinkedInfo
      }
    case 'INDIVIDUAL_CHANGED_APPLICANT_FIELD':
      const newApplicantInfo = [...state.applicant];
      newApplicantInfo[action.index][action.payload.field] = action.payload.val;
      return {
        ...state,
        applicant: newApplicantInfo
      }
    case 'INDIVIDUAL_APPLICANT_CHANGED_COUNTRY_FIELD':
      const newApplicantInfo2 = [...state.applicant];
      let curState = newApplicantInfo2[action.index].country[action.payload.order][action.payload.country];
      newApplicantInfo2[action.index].country[action.payload.order][action.payload.country] = !curState;
      return {
        ...state,
        applicant: newApplicantInfo2
      }
    case 'INDIVIDUAL_CHANGED_CHESS_FIELD':
      const newChessInfo = { ...state.applicant };
      newChessInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        chess: newChessInfo
      }
    case 'INDIVIDUAL_CHANGED_APPLICANT_TO_TRADE_FIELD':
      const newApplicantToTradeInfo = { ...state.applicantToTrade };
      newApplicantToTradeInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        applicantToTrade: newApplicantToTradeInfo
      }
    case 'INDIVIDUAL_CHANGED_CHESS_COMPANY_HOLDER_FIELD':
      const newChess2Info = [...state.chess];
      newChess2Info[action.payload.field][action.index] = action.payload.val;
      return {
        ...state,
        additional: newChess2Info
      }
    case 'INDIVIDUAL_CHANGED_TRADING_FIELD':
      const newTradingInfo = [...state.trading];
      newTradingInfo[action.index][action.payload.field] = action.payload.val;
      return {
        ...state,
        trading: newTradingInfo
      }
    default:
      return state
  }
}

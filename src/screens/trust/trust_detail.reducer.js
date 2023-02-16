
import initialState from '../../reducers/initialState';
export const trust = (state = initialState.trust, action) => {
  switch (action.type) {
    case 'TRUST_CHANGED_TRUST_FIELD':
      const newTrustInfo = { ...state.trust };
      newTrustInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        trust: newTrustInfo
      }
    case 'TRUST_CHANGED_COMPANY_FIELD':
      const newCompanyInfo = { ...state.company };
      newCompanyInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        company: newCompanyInfo
      }
    case 'TRUST_CHANGED_BENEFICIAL_FIELD':
      const newBeneficialInfo = [...state.beneficial];
      newBeneficialInfo[action.index][action.payload.field] = action.payload.val;
      return {
        ...state,
        beneficial: newBeneficialInfo
      }
    case 'TRUST_CHANGED_TRADING_FIELD':
      const newTradingInfo = [...state.trading];
      newTradingInfo[action.index][action.payload.field] = action.payload.val;
      return {
        ...state,
        trading: newTradingInfo
      }
    case 'TRUST_CHANGED_ADDITIONAL_FIELD':
      const newAdditionalInfo = [...state.additional];
      newAdditionalInfo[action.index][action.payload.field] = action.payload.val;
      return {
        ...state,
        additional: newAdditionalInfo
      }
    case 'TRUST_CHANGED_LINKED_FIELD':
      const newLinkedInfo = { ...state.linked };
      newLinkedInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        linked: newLinkedInfo
      }
    case 'TRUST_APPLICANT_CHANGED_COUNTRY_FIELD':
      const newApplicantInfo2 = [...state.applicant];
      let curState = newApplicantInfo2[action.index].country[action.payload.order][action.payload.country];
      newApplicantInfo2[action.index].country[action.payload.order][action.payload.country] = !curState;
      return {
        ...state,
        applicant: newApplicantInfo2
      }
    case 'TRUST_CHANGED_INTEREST_FIELD':
      const newInterestInfo = { ...state.interest };
      newInterestInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        interest: newInterestInfo
      }
    case 'TRUST_CHANGED_APPLICANT_TO_TRADE_FIELD':
      const newApplicantToTradeInfo = { ...state.applicantToTrade };
      newApplicantToTradeInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        applicantToTrade: newApplicantToTradeInfo
      }
    case 'TRUST_CHANGED_APPLICANT_FIELD':
      const newApplicantInfo = [...state.applicant];
      newApplicantInfo[action.index][action.payload.field] = action.payload.val;
      return {
        ...state,
        applicant: newApplicantInfo
      }
    case 'TRUST_CHANGED_CHESS_FIELD':
      const newChessInfo = { ...state.applicant };
      newChessInfo[action.payload.field] = action.payload.val;
      return {
        ...state,
        chess: newChessInfo
      }
    case 'TRUST_CHANGED_CHESS_TRUST_HOLDER_FIELD':
      const newChess2Info = [...state.chess];
      newChess2Info[action.payload.field][action.index] = action.payload.val;
      return {
        ...state,
        additional: newChess2Info
      }
    default:
      return state
  }
}

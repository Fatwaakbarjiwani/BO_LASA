import { combineReducers } from "redux";
import campaignReducer from "./campaignReducer";
import authReducer from "./authReducer";
import pageReducer from "./pageReducer";
import beritaReducer from "./beritaReducer";
import ziswafReducer from "./ziswafReducer";
import pageNumberReducer from "./pageNumberReducer";
import transaction from "./transaction&summaryReducer";
import agenReducer from "./agenReducer";
import eventReducer from "./eventReducer";

export default combineReducers({
  campaign: campaignReducer,
  auth: authReducer,
  page: pageReducer,
  berita: beritaReducer,
  ziswaf: ziswafReducer,
  pn: pageNumberReducer,
  summary : transaction,
  agen: agenReducer,
  event: eventReducer,
});

import Vue from 'vue'
import Vuex from 'vuex'
import FhirService from '@/fhir/FhirService.js'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    initialized: false,
    fhirClient: null,
    vitals: [],
    loading: false,
    status: null,
    patient: null,
    observation: null,
    thresholdSelection: 'aap',
    birthDateTime: null,
    birthTime: null,
    birthWeight: null,
    birthGA: null,
    dataReady: false,
    mock: false,
    neurotoxRiskFactors: false,
    epicToken: null,
    riskFactorsDescription: {
      aap: 'Isoimmune disease, G6PD deficiency, asphyxia, lethargy, temp instability, sepsis, acidosis, albumin < 3.0 g/dL, if measured',
      ncnc: 'Isoimmune disease, G6PD deficiency or other hemolysis, sepsis/suspected sepsis (on abx), acidosis (BE ≤ 8 or pCO2 > 50 within last 24h, albumin < 3, any clinical instability)',
      premie: "Albumin < 2.5 g/dL, rapidly rising TSB suggesting hemolytic disease, signs of clinical instability (mechanical ventilation at time of blood sampling, pH < 7.15, or in the prior 24 h any of: sepsis w/+cx, hypotension requiring pressors, or A's & B's needing bag/intubation)"
    }
  },
  getters: {
    thresholdSelection: state => state.thresholdSelection,
    birthTime: state => state.birthTime,
    birthDateTime: state => state.birthDateTime,
    birthWeight: state => state.birthWeight,
    birthGA: state => state.birthGA,
    neurotoxRiskFactors: state => state.neurotoxRiskFactors,
    riskFactorsDescription: state => state.riskFactorsDescription,
    dataReady: state => state.dataReady,
    patient: state => state.patient,
    mock: state => state.mock,
    epicToken: state => state.epicToken,
    authHost: state => state.authHost
  },
  mutations: {
    INIT(state, initParams) {
      state.initialized = true;
      Object.assign(state, initParams);
    },
    LOADING(state, loading) {

      state.loading = loading;
    },
    SET_VITALS(state, vitals) {
      state.vitals = vitals;
    },
    UPDATE_STATUS(state, status) {
      state.status = status;
    },
    changeThresholdSelection(state, thresholdSelection) {
      state.thresholdSelection = thresholdSelection;
    },
    changeBirthDateTime(state, birthDateTime) {
      state.birthDateTime = birthDateTime
    },
    changeNeurotoxRiskFactors(state, neurotoxRiskFactors) {
      state.neurotoxRiskFactors = neurotoxRiskFactors
    },
    changeDataReady(state, dataReady) {
      state.dataReady = dataReady;
    },
    changePatient(state, patient) {
      state.patient = patient;
    },
    changeMock(state, mock) {
      state.mock = mock;
    },
    changeEpicToken(state, epicToken) {
      state.epicToken = epicToken;
    },
    changeAuthHost(state, authHost) {
      state.authHost = authHost;
    }
  },
  actions: {
    init({ commit }, initParams) {
      commit('INIT', initParams);
    },
    clearStatus({ commit }) {
      commit('STATUS', null)
    },
    postStatusMessage({ commit }, status) {
      commit('STATUS', status);
    },
    loadVitals({ commit, state }) { //todo use some kind of interceptor on FhirService rather than rewriting all this boilerplate error handling, similar to axios
      commit('LOADING', true);
      return FhirService(state.fhirClient).getVitals().then(vitals => {
        commit('SET_VITALS', vitals)
      }).catch(e => {
        commit('STATUS', { type: 'error', message: e })
      }).finally(() => {
        commit('LOADING', false);
      })
    }
  },
  modules: {
  }
})

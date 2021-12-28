// import FHIR from 'fhirclient';
// For now, brute-forcing this to get the version that works with IE
const FHIR = window.FHIR;
import FhirService from '@/fhir/FhirService.js'
//could eventually use webpack-conditional-loader to pragma this out of production build
// #if process.env.NODE_ENV === 'development'
import MockFhir from '@/mock/MockFhir.js'
import store from '@/store'
// #endif


function ready() {
    const query = new URLSearchParams(window.location.search);

    if (query.get("mock")) {
        console.log("Use MockFhir")
        store.commit("changeMock", true)
        return Promise.resolve(MockFhir)
    } else {
        return FHIR.oauth2.ready()
    }
}
export default {
    async load() {
        return ready().then(fhirClient => {
            // let epicToken = fhirClient.state.tokenResponse.access_token;
            // console.log('epicToken: ', epicToken);

            // store.commit('changeEpicToken', epicToken);
            return FhirService(fhirClient).initialLoad(p => {
                return Object.assign(p, { fhirClient })
            })


        })
    }
};
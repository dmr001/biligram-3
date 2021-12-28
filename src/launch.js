// import FHIR from 'fhirclient';
const FHIR = window.FHIR;   // Temporary solution to ensure we get IE-compatible version
import config from '@/fhir/config.js'
import store from '@/store';

const redirect = window.location.href.split('?')[0].replace('launch.html', 'index.html');
const host = new URL(new URL(window.location).searchParams.get('iss')).host

console.log("OAuth Setup", redirect, config, host);

FHIR.oauth2.authorize({
    'clientId': config.clientId[host],
    'scope': 'launch openid fhirUser patient/*.read user/*.*',
    'clientSecret': config.clientSecrets[host],
    'redirectUri': redirect,
    'completeInTarget': true
}).then(r => {
    console.log('authorize done', r)
    // store.commit('changeEpicToken', r);
    store.commit('changeAuthHost', host);
    console.log(`authHost: ${host}`)
    console.log(`Double check: ${store.getters.authHost}`)
}).catch((e) => {
    console.error('error on auth', e)
})


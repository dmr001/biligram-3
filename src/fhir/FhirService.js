import Observation from '@/fhir/model/Observation.js'
import Patient from '@/fhir/model/Patient.js'
import store from '@/store'
import config from '@/fhir/config.js'

// import { parseISO, formatISO, add } from 'date-fns'

export default (client) => {
    const patientId = client.patient.id;
    let host;
    // const host = store.getters.authHost;
    //
    // console.log(`FhirService host ${host}, flowsheet URL ${config.phototherapyFlowsheetCode[host]}`)
    // console.log(`Client: `, client)
    // console.log(`Client state: `, client.state)
    if (store.getters.mock) {
        host = "localhost"
    } else {
        console.log(`Client state serverUrl: `, client.state.serverUrl)
        host = (new URL(client.state.serverUrl)).hostname
        console.log(`Host ${host}, flowsheet URL`, config.phototherapyFlowsheetCode[host]);
    }
    var api = {
        getVitals() {
            return client.request(`Observation?category=vital-signs&patient=${patientId}`)
                .then(function (bundle) {
                    // Process the FHIR here and return as an array of readings?

                    console.log('Request returned:', bundle);
                    return [{
                        bp: "120/40"
                    }]

                })
        },
        getBirthWeight() {
            let query = new URLSearchParams;

            if (store.getters.mock) {
                return client.request(`Observation?2`).then(bundle => {
                    console.log("mock observation (birth weight)", bundle)
                    return new Observation(bundle);
                })
            } else {
                query.set("patient", patientId);
                query.set("_count", 3);
                query.set("code",
                    'http://loinc.org|8339-4', // birth weight, measured
                );
                return client.request(`Observation?${query}`, {
                    pageLimit: 0,
                    flat: true
                })
                    .then(function (bundle) {
                        console.log("Birth weight request returned:", bundle)
                        return new Observation(bundle);

                    });
            }
        },
        getBilis() {
            let query = new URLSearchParams;
            // const sixMonthsOld = formatISO(add(parseISO(this.$store.state.birthDateTime), { months: 6}));
            // console.log("Setting query to LE ", patient)
            // TODO: Limit query to first year of life, or 6 months
            if (store.getters.mock) {
                return client.request(`Observation?3`).then(bundle => {
                    console.log("mock observation (bilis)", bundle)
                    return new Observation(bundle);
                })
            } else {
                query.set("patient", patientId);
                query.set("_count", 1000);
                // console.log("In getBilis. Store: ", client.patient)
                query.set("code", [
                    'http://loinc.org|1975-2', // Serum total bilirubin
                    'http://loinc.org|58941-6', // Transcutaneous bilirubin
                    'http://loinc.org|42719-5', // Blood (POC) total bilirubin
                    'http://loinc.org|59828-4', // Blood (venous) total bilirubin
                    'http://loinc.org|35194-0' // Blood, total serum

                ].join(","));
                // query.set("category", "http://hl7.org/fhir/observation-category|laboratory");
                // query.set("issued", `le${sixMonthsOld}`);

                return client.request(`Observation?${query}`, {
                    pageLimit: 0,
                    flat: true
                })
                    .then(function (bundle) {
                        console.log("Bili request returned:", bundle)
                        return new Observation(bundle);

                    });
            }
        },
        getBirthGA() {
            let query = new URLSearchParams;
            if (store.getters.mock) {
                return client.request(`Observation?1`).then(bundle => {
                    console.log("mock observation (birth GA)", bundle)
                    return new Observation(bundle);
                })

            } else {
                query.set("patient", patientId);
                query.set("_count", 3);
                query.set("code", [
                    'http://loinc.org|76516-4', // gestational age at birth
                ].join(","));
                return client.request(`Observation?${query}`, {
                    pageLimit: 0,
                    flat: true
                })
                    .then(function (bundle) {
                        console.log("Birth GA request returned:", bundle);
                        return new Observation(bundle);

                    });
            }
        },
        getPhototherapy() {
            let query = new URLSearchParams;
            if (store.getters.mock) {
                return client.request(`Observation?1`).then(bundle => {
                    console.log("mock observation (phototherapy)", bundle)
                    return new Observation(bundle);
                })

            } else if (config.phototherapyFlowsheetCode[host]) {
                query.set("patient", patientId);
                // query.set("_count", 3);

                // Turns out we can only get Epic flowsheet rows with encoded FLO row numbers - tagging with SNOMED or SmasrtData not supported as of 7/2021
                // query.set("code", 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|35683002');
                // query.set("code", 'snomed.info/sct|35683002');
                // query.set("code", 'http://snomed.info/sct');

                query.set("code", [
                    config.phototherapyFlowsheetCode[host]
                ].join(","));


                    // query.set("code", [
                    // 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|tPobsgZ1RwOFCIWGNeCQDIQ0', // encoded phototherapy row for OCTST via .ZFHIRENDCODEFLO[306664127
                    // 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|tDAY4zz2n-r4Iye9sQgXm0A0', // OCPRD
                    // 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|tbBhRGwfHBAscSiy9E8N5kg0',  // WMPRD
                    // 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|tUqd70DhzZN3cZQmyFjXb9A0',  // AKPRD
                    // 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|t.LjUH46sreWjEFgWGGec-A0',  // AKTST
                    // 'http://open.epic.com/FHIR/STU3/StructureDefinition/observation-flowsheet-id|t0wKUA7v4IHNf.snRjqlF2w0', // WMTST
                    // ].join(","));
                // console.log(`Phototherapy query: host ${host}, string ${config.phototherapyFlowsheetCode[host]} `, query);
                return client.request(`Observation?${query}`, {
                    pageLimit: 0,
                    flat: true
                })
                    .then(function (bundle) {
                        console.log("Phototherapy request returned:", bundle);
                        return new Observation(bundle);

                    });
            }
        },
        getPatient() {
            console.log("FHIR request: patient");
            return client.request(`Patient/${patientId}`).then(p => {
                console.log("patient", p)
                return new Patient(p);
            })
        }
    }


    return Object.assign(api, {
        initialLoad() {
            return Promise.all([

                api.getPatient().then(p => {
                    // console.log(`Patient promise:`, p)
                    return {
                        patient: p
                    };
                }),
                api.getBirthWeight().then(obs => {
                    return {
                        observation: obs
                    }
                }),
                api.getBirthGA().then(obs => {
                    return {
                        observation: obs
                    }
                }),
                api.getBilis().then(obs => {
                    return {
                        observation: obs
                    }
                }),
                api.getPhototherapy().then(obs => {
                    return {
                        observation: obs
                    }
                }),
 


            ]).then( p => {
                console.log("Done getting all the FHIR promises; p: ", p);
                console.log("P.patient: ", p.find(p => p.patient).patient)
                console.log("P.observation raw: ", p.filter(p => p.observation))
                console.log("P.observation: ",
                    (Object.values(p.filter(p => p.observation))).map(el => el.observation) )

                return {
                    // Our objects come in 2 layers deep because we passed in an array of promises;
                    // We flatten these to a simpel Patient object and array of observations (instead of an
                    // array of observations of observations)
                    patient: p.find(p => p.patient).patient,
                    observation: (Object.values(p.filter(p => p.observation))).map(el => el.observation)
                }
            });

        },
    });


}


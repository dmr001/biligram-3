// eslint-disable-next-line no-unused-vars
// function parseBirthWeight(resource) {
//     var nameObj = resource.name.find(n => n.use === 'usual');
//     return nameObj && nameObj.text
// }

import { parseISO } from 'date-fns';
import store from '@/store';

function parseBili(resource) {
    let biliObject, i;
    let results = [];

    console.log(`In parseBili with resource: `, resource);

    for (i = 0; i < resource.length; i++) {
        if (resource[i].valueQuantity && resource[i].valueQuantity.value &&
            (/bilirubin/i.test(resource[i].code.text))) {
            biliObject = {
                level: resource[i].valueQuantity.value,
                drawtimeRaw: resource[i].effectiveDateTime,
                drawtime: parseISO(resource[i].effectiveDateTime),
                method: resource[i].code.text.includes("Transcutaneous") ? 'transcut' :
                    resource[i].code.text.includes("POC") ? 'POC' : 'serum'
            }
        }
        results.push(biliObject);
    }
    return results;
}

function parsePhototherapy(resource) {
    let photoObject, i;
    let phototherapy = [];

    for (i = 0; i < resource.length; i++) {
        if (resource[i].valueCodeableConcept && resource[i].effectiveDateTime) {
            photoObject = {
                tooltip: resource[i].valueCodeableConcept.text,
                startTime: parseISO(resource[i].effectiveDateTime),
                duration: 4 // TODO - most NICU's will do this 4 hours, but not everywhere
            }
            phototherapy.push(photoObject);
        }
    }
    return phototherapy;
}

export default class Observation {
    constructor(resource) {
        console.log("Observation object constructor: ", resource)
        if (store.getters.mock) {   // Mock parsing; everything comes back as one blob.
            if (resource[0] && resource[0].code && resource[0].code.text) {
                this.birthGA = null || resource.find(r => r.code.text === null || "Gestational age at birth").valueQuantity.value;
                this.birthWeight = null || resource.find(r => r.code.text === null || 'Birth weight measured').valueQuantity.value;
                this.results = null || parseBili(resource.filter(r => (r.code.text.includes('Bilirubin') || r.code.text.includes('bilirubin'))))
                this.phototherapy = null || parsePhototherapy(resource.filter(r  => r.code.text.includes("Phototherapy")));
            }

        } else {    // Non-mock parsing
            if (resource[0] && resource[0].code && resource[0].code.text) {     // Every FHIR resource has these
                if (resource[0].valueQuantity && resource[0].valueQuantity.value) { // Some have these
                    if (resource[0].code.text === 'Birth weight measured') {
                        this.birthWeight = null || resource[0].valueQuantity.value;
                        console.log(`Got FHIR birth weight: ${this.birthWeight}`)
                    } else if (resource[0].code.text === "Gestational age at birth") {
                        this.birthGA = null || resource[0].valueQuantity.value;
                        console.log(`Got FHIR birth GA: ${this.birthGA}`)

                    } else if (/bilirubin/i.test(resource[0].code.text)) {
                        console.log(`Found a bili resource to test`);
                        this.results = null || parseBili(resource);
                        console.log(`Got FHIR bilis: `, this.results)
                    }
                }
                if (resource[0].code.text.includes("Phototherapy") || resource[0].code.text.includes("phototherapy")) {
                    this.phototherapy = null || parsePhototherapy(resource);
                    console.log(`Got FHIR phototherapy: ${this.phototherapy}`)
                }
            }
        }
    }
}
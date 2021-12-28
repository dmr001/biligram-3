import { parseISO, format, isValid } from "date-fns";

function parseName(resource) {
    const nameObj = resource.name.find(n => n.use === 'usual');
    return nameObj && nameObj.text
}

// eslint-disable-next-line no-unused-vars
function parseBirthDateTime(resource) {
    let birthDateTime = '';
    let obj, i;

    if (!resource.extension) {
        return null;
    }

    for (i = 0 ; i <  resource.extension.length; i++) {
        obj = resource.extension[i];
        if (obj.url.includes("patient-birthTime")) {
            birthDateTime = obj.valueDateTime;
        }

    }
    console.log(`birthDateTime: ${birthDateTime}`)
    birthDateTime = parseISO(birthDateTime);
    // if (birthDateTime.toString() === 'Invalid Date')) {
    //     birthDateTime = '';
    // }
    console.log("parsed to: ", birthDateTime)

    console.log("isValid:", isValid(birthDateTime));

    return birthDateTime;
}

function parseBirthTime(birthDateTime) {
    return(isValid(birthDateTime) ? format(birthDateTime, 'HH:mm'): '');
}

export default class Patient {
    constructor(resource) {
        console.log("patient object constructor", resource)
        this.name = parseName(resource);
        console.log(`Parsed name: ${this.name}`);
        this.gender = resource.gender;
        this.birthDate = resource.birthDate;
        this.birthDateTime = parseBirthDateTime(resource);
        this.birthTime = parseBirthTime(this.birthDateTime);

    }
}


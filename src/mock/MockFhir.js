import axios from 'axios';

var fetch = axios.create({
    baseURL: "http://localhost:3000/",
    headers: {
        'Accept': "application/json",
        'Content-Type': "application/json",
        'Cache-Control': "no-cache"
    }
});

export default {
    patient: {
        id: 1
    },
    observation: [
        {
            id: "1",
        },
        { id: "2" },
        { id: "3" },
        { id: "4" },
        { id: "5" },
        { id: "6" },
        { id: "7" },
        { id: "8" },
        { id: "9" },
        // { id: 1 },
        // { id: 2 },
        // { id: 3 },
        // { id: 4 },
        // { id: 5 },
        // { id: 6 },
        // { id: 7 }
        ],

    request(path) {
        console.log("MockFhir.request", path)
        return fetch.get(path).then(r => r.data)
    }
}
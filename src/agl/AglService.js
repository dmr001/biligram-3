var resolver = null;
var initComplete = false;
var handshakePromise = new Promise((resolve) => {
    resolver = resolve
})
function Listener(event)
{
    for (var type in event.data) {
        var payload = event.data[type];
        switch (type) {
            case "token":
                // this is the token passed down by Epic
                // which every post message needs to include

                resolver(payload)
                break;

            case "error":
                // payload is an error string
                console.error("AglService error:" + payload)
                break;

            case "actions":
                //TODO: verify action enabled before running and throw error to dev if not since this should not happen
                // payload is a list of features (or actions)
                // for (var feature in payload)
                // {
                //   feature is a string representing a single feature
                // }
                break;

            case "state":
                // payload is some state which you have saved
                // before AGL hibernated
                break;

            case "actionExecuted":
                // payload is a boolean set to "true" if the action
                // completed, "false" otherwise
                //TODO:look for this in a promise whenever sending an action?
                break;

            case "errorCodes":
                // payload is an array of all errors which might have been
                // encountered
                break;

            case "historyPackage":
                // payload is an object that contains the history state you saved
                // as well as a Boolean indicating whether Hyperspace came out of hibernation
                break;

            case "history":
                // payload is a string that corresponds to the history button the user clicked
                break;

            default:
                // if new properties get implemented which are not
                // handled above, you end up here
                break;

        }
    }
}

function init() {
    if (!initComplete) {
        initComplete=true;
        window.addEventListener("message", Listener, false);
        // Request the initial handshake
        window.parent.postMessage({
            "action": "Epic.Clinical.Informatics.Web.InitiateHandshake"
        }, "*");

        // handshakePromise.then(function(pl) {
        //      console.debug('handshake done',pl.epicToken)
        // })
    }
    return handshakePromise;
}

export default {
    openWindow: async function(url) {
        var token = await init();
        var command="Epic.Clinical.Informatics.Web.OpenExternalWindow"
        window.parent.postMessage({
            "token":token,
            "action": command,
            "args":url
        }, "*");
        //todo check for success?
    }
}
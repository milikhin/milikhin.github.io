/*
*  AppEvent used to implement pub/sub pattern in the app
*	dispatch - dispatch event with the given type and details
*	addEventListener - add event listener for the events with given type
*	removeEventListener - remove event listener
*/
class AppEvent {
    constructor() {}

    dispatch(evtName, evtDetail) {
        if (!evtName) {
            throw new Error("AppEvent name is missing");
        }

        evtDetail = evtDetail || {};
        evtDetail._evtName = evtName;
        document.body.dispatchEvent(new CustomEvent('app-event', {
            bubbles: true,
            cancelable: true,
            detail: evtDetail || {}
        }));
    }

    on(evtName, callback) {
        this.addEventListener(evtName, callback);
    }

    addEventListener(evtName, callback) {
        let callbackFunction = function (evt) {
            if (evt.detail._evtName == evtName) {
                callback(evt);
            }
        };

        document.body.addEventListener("app-event", callbackFunction);
        return callbackFunction;
    }

    removeEventListener(callbackOnFunction) {
        document.body.removeEventListener("app-event", callbackOnFunction);
    }
}

export default new AppEvent();
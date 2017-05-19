export default function(event, elem, params) {
    let evt;
    params = params || {bubbles: true, cancelable: true};
    evt = document.createEvent("Event");
    evt.initEvent(event, params.bubbles, params.cancelable);
    elem.dispatchEvent(evt);
    return evt;
};
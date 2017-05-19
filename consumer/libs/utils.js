function getUrlsFromElems($, target, averageLinksQuantity) {
    let targets = $(target),
        exactLinksQuantity = shiftValue(averageLinksQuantity),
        resultArray = [];

    targets = targets.map( (i, anchor) => $(anchor).prop('href') );
    for (;exactLinksQuantity; exactLinksQuantity--) {
        if (targets.length) resultArray.push(targets.splice(random(0, targets.length - 1), 1)[0]);
    }

    return resultArray;
}

function random (min = 0, max = 100, isRandomSign) {
    let value = Math.round(min + (Math.random() * (max - min)));
    if(isRandomSign) value = Math.round(Math.random())? value : -value;
    return value;
}

function shiftValue(value, mult=2) {
    return Math.round(value * (random(0, 100) * mult / 100));
}

module.exports = {random, shiftValue, getUrlsFromElems};
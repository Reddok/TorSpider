

function random (min = 0, max = 100, isRandomSign) {
    let value = Math.round(min + (Math.random() * (max - min)));
    if(isRandomSign) value = Math.round(Math.random())? value : -value;
    return value;
}

function shiftValue(value, mult=2) {
    return Math.round(value * (random(0, 100) * mult / 100));
}

module.exports = {random, shiftValue};
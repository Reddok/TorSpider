module.exports = function (date = new Date(), mode = 'td') {
    var year = date.getFullYear(),
        month = date.getMonth() + 1 > 9? date.getMonth() + 1 : "0" + (date.getMonth() + 1),
        day = date.getDate() > 9? date.getDate() : "0" + date.getDate(),
        hours = date.getHours() > 9? date.getHours() : "0" + date.getHours(),
        min = date.getMinutes() > 9? date.getMinutes() : "0" + date.getMinutes(),
        sec = date.getSeconds() > 9? date.getSeconds() : "0" + date.getSeconds(),
        output;

    switch(mode){
        case 'd':
            output = day + "." + month + "." + year;
            break;
        case 't':
            output = hours + ":" + min + ":" + sec;
            break;
        case 'td':
            output  = hours + ":" + min + ":" + sec + " " + day + "." + month + "." + year;
            break;
        case 'dt':
            output  = day + "." + month + "." + year + ' ' + hours + ":" + min + ":" + sec;
            break;
        default:
            output = date;
    }

    return output;

};
let diff = require("deep-diff");

var lhs = {
    name: 'my object',
    description: 'it\'s an object!'
};

var rhs = {
    name: 'my object',
    description: 'it\'s an object!'
};

var differences = diff(lhs, rhs);

/*function createDiffObject(diffs) {

    let res = {};

    diffs.forEach( diff => {
        let {kind, path, rhs, item} = diff;
        createPath(0, res, path, rhs || item.rhs);
    });

    return res;


    function createPath (index, currentStep, path, rhs) {
        if(index < path.length - 1) {
            currentStep[path[index]] || (currentStep[path[index]] = {});
            createPath(index + 1, currentStep[path[index]], path, rhs);
        } else {
            currentStep[path[index]] = rhs;
        }
    }
}*/

console.log(differences);

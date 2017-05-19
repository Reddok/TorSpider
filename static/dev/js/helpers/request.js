import fetch from 'isomorphic-fetch';

export default (url, options) => {
    options = Object.assign({}, {mode: 'cors', headers: {"X-Requested-With": "XMLHttpRequest", 'Content-Type': 'application/json'}}, options);
    if(options.body) options.body = JSON.stringify(options.body);
    console.log('Відправляю', options.body);
    return fetch(url, options).then( res => {
            console.log("response from server", res);
            if(res.status < 400) return res.json();
            else console.error(res.statusText);
        }
    ).catch( err => {
        console.log('While request an error occurred', err);
    });
};
import React from 'react';
import Validation from 'react-validation';
import validator from 'validator';

Object.assign(Validation.rules, {
    required: {
       rule: value => value && value.toString().trim(),
       hint: value => getErrCont("This field is required!")
    },
    minLength: {
        rule: value => value && validator.isLength(value, {min: 3}),
        hint: value => getErrCont("Minimal length is 3 characters!")
    },
    url: {
        rule: value => !value || validator.isURL(value),
        hint: value => getErrCont("It's not valid url")
    },
    check: {
        hint: value => getErrCont(`${value} already taken`)
    }
});

function getErrCont(value) {
    return <div className="form-error alert alert-danger is-visible">{value}</div>
}
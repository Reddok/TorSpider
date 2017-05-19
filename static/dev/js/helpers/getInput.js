import React from 'react';
import ReactDOM from 'react-dom';

export default function (component, ref) {
    return component.refs[ref] ? ReactDOM.findDOMNode(component.refs[ref]).querySelector('input') :
        ReactDOM.findDOMNode(component).querySelector('input[name='+ref+']');
}
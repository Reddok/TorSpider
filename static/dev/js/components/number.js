import React from 'react';
import ReactDOM from 'react-dom';
import FormElem from 'appRoot/components/formElem';
import Icon from 'appRoot/components/icon';
import autobind from 'appRoot/helpers/autobind';
import createEvent from 'appRoot/helpers/createEvent';


export default class NumberInput extends FormElem{
    constructor() {
        super();
        autobind(this, ['changeValue', 'onKeyDown', 'onKeyPress']);
    }


    changeValue(e, sign, value = 1) {
        const input = ReactDOM.findDOMNode(this).querySelector('input'),
            newValue = sign? +input.value + value : +input.value - value;

        if(!(newValue < this.props.min) && !(newValue > this.props.max)) {
            input.value = newValue;
            createEvent('input', input);
        }

    }

    onKeyDown(e) {
        if(e.keyCode === 38) {
            this.changeValue(e, true);
            e.preventDefault();
        } else if(e.keyCode === 40) {
            this.changeValue(e, false);
            e.preventDefault();
        }
    }

    /*Пропускає тільки цифри*/

    onKeyPress(e) {
        if(!e.which) return e.preventDefault();
        if((e.which > 57 || e.which < 48) && (e.which != 46 && e.which != 13)) return e.preventDefault();
    }

    render() {
        let controls = (<span className="input-controls">
                    <span className="input-increase" onClick={(e) => this.changeValue(e, true)}><Icon icon="chevron-up"/></span>
                    <span className="input-decrease" onClick={(e) => this.changeValue(e, false)}><Icon icon="chevron-down"/></span>
                </span>),
            props = { ...this.props,
                        tag: "input",
                        type: "text",
                        className: "number-field",
                        onKeyPress: this.onKeyPress,
                        onKeyDown: this.onKeyDown,
                        children: controls
            };

            return  FormElem.prototype.render.call({state: this.state, props: props, getProperElem: this.getProperElem.bind(this)});
    }
}
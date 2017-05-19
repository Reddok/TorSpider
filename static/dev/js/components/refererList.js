import React, {Component} from 'react';
import FormElem from 'appRoot/components/formElem';
import autobind from 'appRoot/helpers/autobind';
import Icon from 'appRoot/components/icon';


export default class Referer extends Component{

    constructor(props, context) {
        super(props, context);
        autobind(this, ['addReferer', 'delReferer', 'onChange']);
        this.state = {input: ""};
    }

    addReferer(e) {
        e.preventDefault();
        const value = this.state.input;
        if(value.trim()) {
            this.setState({input: ""});
            this.props.addReferer(value);
        }
    }

    delReferer(e) {
        e.preventDefault();
        const value = e.currentTarget.parentNode.querySelector(".refer-value").textContent;
        this.props.deleteReferer(value);
    }

    onChange(e) {
        this.setState({input: e.target.value});
    }

    render() {
        const referers = this.props.referer;

        return (
            <div className="referer-list">
                    <fieldset>
                        <legend>Реферрери</legend>
                        <FormElem tag="input" value={this.state.input} onChange={this.onChange} name="newRef" id="newRef" type="text" validations={["url"]}>
                            <button className="btn btn-primary active add-referer" onClick={this.addReferer}>Додати реферер</button>
                        </FormElem>
                        <ul className="col-md-6">
                            {referers.map( (refer, i) => <li key={i}><span className="refer-value">{refer}</span><button className="remove-button" onClick={this.delReferer}><Icon icon="remove"/></button></li>)}
                        </ul>
                    </fieldset>

            </div>
        )
    }

}
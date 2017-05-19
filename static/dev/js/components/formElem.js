import React, {Component} from 'react';
import Validation from 'react-validation';
import Spinner from 'react-spin';

export default class FormElem extends Component{

    constructor() {
        super();
        this.state = {isChecking: false};
    }

    check(state) {
        if(typeof state !== 'boolean') return this.setState({isChecking: !this.state.isChecking});
        this.setState({isChecking: state});
    }

    getProperElem(tag, props, children) {
        switch(tag) {
            case 'input':
                return <span><Validation.components.Input {...props}/>{children}</span>;
            case 'textarea':
                return <span><Validation.components.Textarea {...props}/>{children}</span>;
            case 'select':
                console.log("select props", props);
                return (<select {...props}>
                        {children}
                        </select>);
        }

    }

    render(){
        let {label, children, tag, ...props} = this.props,
            elem;

            props.errorClassName = "has-error";
            elem  = this.getProperElem(tag, props, children);
        return (
            <div className="form-component form-group col-md-6">
                {label? <label htmlFor={props.id}>{label}</label> : []}
                <div className="form-elem-container">
                    {elem}
                </div>
                {this.state.isChecking?<span className="checking" ><Spinner /></span> : []}
            </div>
        )
    }

}
import {connect} from 'react-redux';
import React, {Component} from 'react';
import Validation from 'react-validation';
import Loader from 'appRoot/components/loader';
import FormElem from 'appRoot/components/formElem';
import NumberInput from 'appRoot/components/number';
import {withRouter} from 'react-router';
import autobind from 'appRoot/helpers/autobind';
import Referer from "appRoot/components/refererList";

export default class Edit extends Component{

    constructor(props, context) {
        super(props, context);
        autobind(this, ['onChange', 'handleSubmit', 'handleDelete', 'checkUniq', 'hideError']);
        this.initialName = props.name;
    }

    onChange(e) {
        const value = e.target.tagName === 'SELECT'? Array.prototype.map.call(e.target.selectedOptions, o => o.value) : e.target.value;
        this.props.changeState(e.target.getAttribute("name"), value);
    }

    componentWillMount() {
       this.props.loadEntity();
    }

    componentWillReceiveProps(newProps) {
        if(this.props.isFetching) this.initialName = newProps.name;
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.onSubmit().then(() => this.props.router.push('/', ''));
    }

    handleDelete(e) {
        e.preventDefault();
        const answer = confirm("Ви впевнені що хочете видалити цю конфігурацію?");
        if(answer) this.props.onDeleteSite().then( () => this.props.router.push('/', '') );
    }

    checkUniq(e) {
        const key = e.target.getAttribute('name'),
            value = e.target.value,
            child = this.refs[key];

        if(!value.trim()) return;
        if(this.props.mode === "edit" && value === this.initialName) return;

        child.check(true);
        this.props.checkUniq(key, value).then(res => {
            if(res.exists) this.form.showError('name', 'check');
            child.check(false);
        })
    }

    manageSite(command, e) {
        e.preventDefault();
        this.props.onManageSite(command);
    }

    hideError() {
        this.form.hideError('name');
    }

    render() {
        let {mode, isFetching, requestsForDay, name, url, counters, frequency, deepLinks, maxDeepLevel, target, referer, timeout, isRunning, addReferer, deleteReferer} = this.props;
        return mode === "edit" && isFetching? <Loader /> :
                (
                    <div>
                        <h1>{mode === "edit"? this.initialName : "Create new Site"}</h1>
                        {mode === "edit"? <p>Сьогодні вже було зроблено запитів {requestsForDay}</p> : []}
                        <Validation.components.Form ref={ (el) => this.form = el} onSubmit={this.handleSubmit.bind(this)}>
                            <div className="row">
                                <FormElem tag="input" type="text" label="Назва сайту:" name="name" onChange={this.onChange} ref="name" onFocus={this.hideError} onBlur={this.checkUniq} validations={["required", "minLength"]} value={name} />
                                <FormElem tag="input" type="text" label="Адрес сайту:" name="url" onChange={this.onChange} validations={["required", "url"]} value={url}/>
                            </div>
                            <div className="row">
                                <NumberInput label="Частота запитів:" name="frequency" min="0"  autoComplete="off" onChange={this.onChange} validations={["required"]} value={frequency}/>
                                <NumberInput label="Кількість внутрішніх ссилок:"  min="0" autoComplete="off" name="deepLinks" validations={["required"]} onChange={this.onChange} value={deepLinks}/>
                            </div>
                            <div className="row">
                                <FormElem tag="input" type="text" label="Селектор ссилок:" name="target" onChange={this.onChange} validations={[]} value={target}/>
                                <NumberInput label="Таймаут між внутрішніми переходами:" name="timeout" min="0"  autoComplete="off" onChange={this.onChange} validations={["required"]} value={timeout}/>
                            </div>
                            <div className="row">
                                <NumberInput label="Глубина входження:" name="maxDeepLevel" min="1"  autoComplete="off" onChange={this.onChange} validations={["required"]} value={maxDeepLevel}/>
                                <FormElem tag="select" value={counters} multiple label="Счетчики:" name="counters" onChange={this.onChange}>
                                    <option value="liveinternet">LiveInternet</option>
                                </FormElem>
                            </div>
                            <div className="row">
                                <Referer referer={referer} addReferer={addReferer} deleteReferer={deleteReferer}/>
                            </div>
                            <div className="row button-set">
                                <div className="col-md-12">
                                    <Validation.components.Button type="submit" className="btn btn-primary active">Зберегти</Validation.components.Button>
                                    {mode === "edit"? !isRunning? <button className="btn btn-primary active" onClick={this.manageSite.bind(this, "start")}>Запустити</button> : <button className="btn btn-primary active" onClick={this.manageSite.bind(this, "stop")}>Зупинити</button> : ""}
                                    {mode === "edit"? <button className="btn btn-primary active" onClick={this.handleDelete}>Видалити</button> : ""}
                                </div>
                            </div>
                        </Validation.components.Form>
                    </div>
                )


    }

}
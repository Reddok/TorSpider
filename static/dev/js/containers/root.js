import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Redirect, Router, IndexRoute, Route, hashHistory} from 'react-router';
import App from "appRoot/containers/app";
import List from 'appRoot/containers/list';
import Edit from 'appRoot/containers/edit';

export default class Root extends Component{

    render() {
        const {store} = this.props;

        console.log("defined store", store);

        return (
            <Provider store={store}>
                <Router history={hashHistory}>
                    <Redirect from="/" to="sites"/>
                    <Route path="/" component={App}>
                        <Route path="" component={List}/>
                        <Route path="sites/:id" component={Edit}/>
                        <Route path="create" component={Edit}/>
                        <Route path="*" component={List}/>
                    </Route>
                </Router>
            </Provider>
        )
    }

}
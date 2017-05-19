import Header from 'appRoot/components/header';
import Footer from 'appRoot/components/footer';
import {connect} from 'react-redux';
import React, {Component, PropTypes} from 'react';


export default class App extends Component {

    constructor(props) {
        console.log("app props", props);
        super(props);
    }

    render() {
        return (<div>
            <Header />
            <main>
                <div className="container">
                        {this.props.children}
                </div>
            </main>
            <Footer />
        </div>)
    }

}

import {Link} from 'react-router';
import React, {Component} from 'react';

export default class Header extends Component{

    render() {
        return (<header>
            <nav className="navbar" role="navigation">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <Link to="/" className="navbar-brand">Spider</Link>
                    </div>
                </div>
            </nav>

        </header>);
    }

}


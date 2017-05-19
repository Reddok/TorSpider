import React, {Component} from 'react';
import {Link} from 'react-router';
import Loader from 'appRoot/components/loader';


export default class List extends Component{

    componentWillMount() {
        this.props.loadEntities();
    }

    render() {
        const {isFetching, items} = this.props;
         return (
             <div className="row">
                 <h1 className="pull-left">Зареєстровані програми</h1>
                 <Link className="create-link pull-right btn btn-primary active" role="button" to="/create">Create New</Link>
                 {isFetching? <Loader /> :(
                     <div className="clearfix list-wrap">
                         <ul>{items.map(item => {
                             return <li key={item._id}><Link className="site-link" to={`sites/${item._id}`}>
                                 <div className={item.isRunning? "site-state started" : "site-state stopped"}></div>
                                 <div className="site-name">{item.name}</div>
                             </Link>
                             </li>
                         })}</ul>
                     </div>
                     )
                 }
             </div>
         )
    }

}
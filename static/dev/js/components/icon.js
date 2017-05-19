import React, {Component} from 'react';


export default class Icon extends Component{

    render() {
        const {icon, color} = this.props;
        return <span className={`glyphicon glyphicon-${icon}`} style={{color: color}} />
    }

}
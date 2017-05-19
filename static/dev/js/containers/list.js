import {connect} from 'react-redux';
import SiteList from 'appRoot/components/list';
import {loadRequestSites} from 'appRoot/actions/index';

const mapStateToProps = (state) => {
    return {items: state.items, isFetching: state.isFetching};
};

const mapDispatchToProps = {
    loadEntities: loadRequestSites
};

const List = connect(mapStateToProps, mapDispatchToProps)(SiteList);
export default List;
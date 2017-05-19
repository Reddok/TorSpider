import {connect} from 'react-redux';
import EditSite from 'appRoot/components/edit';
import {addReferer, deleteReferer, changeState, loadCheckUniq, loadCreateSite, loadEditSite, loadRequestSite, requestNewSite, loadManageSite, loadDeleteSite} from 'appRoot/actions/index';

const mapStateToProps = (state, ownProps) => {
    const pageConfig = {isFetching: state.isFetching};
    pageConfig.mode = ownProps.params && ownProps.params.id? 'edit' : 'create';
    Object.assign(pageConfig, state.selectedSite);

    return pageConfig;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    let res = {}, id;
    if(ownProps.params) id = ownProps.params.id;
    res.loadEntity    =           () => dispatch(id? loadRequestSite(id) : requestNewSite());
    res.onSubmit      =           () => dispatch(id? loadEditSite(id) : loadCreateSite());
    res.onManageSite  =      command => dispatch(loadManageSite(id, command));
    res.onDeleteSite  =           () => dispatch(loadDeleteSite(id));
    res.changeState   = (key, value) => dispatch(changeState({key, value}));
    res.addReferer    =    (referer) => dispatch(addReferer(referer));
    res.deleteReferer =    (referer) => dispatch(deleteReferer(referer));
    res.checkUniq = loadCheckUniq;
    return res;
};

const Edit = connect(mapStateToProps, mapDispatchToProps)(EditSite);
export default Edit;
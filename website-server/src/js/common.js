const LOADING_PAGE = (
    <div className="container-fluid App-main">
        <h1> Loading data, please hang on... </h1>
    </div>
)

class PromiseStatusEnum {
    static NOT_BEGUN = "not_begun";
    static LOADING = "loading";
    static LOADED = "loaded";
}

export {LOADING_PAGE,PromiseStatusEnum};

// This code is backup for future probable use.
//
// if(this.state.promise_status === PromiseStatusEnum.NOT_BEGUN){
//     this.setState({promise_status:PromiseStatusEnum.LOADING});
//     this.render_mysent_fetch();
//   }
//   if(this.state.promise_status !== PromiseStatusEnum.LOADED){
//     return LOADING_PAGE;
//   }
//   if(!this.state.render_required_params.render_mysent.my_msges){
//     throw new Error('This should not happen.');
//   }
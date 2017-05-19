
class ConsumerError extends Error{

    constructor(message='ConsumerError', type='Consumer Error', metadata) {
        super();
        Object.assign(this, metadata, {message, type});
        this.stack || Error.captureStackTrace(this, ConsumerError);
    }

}

ConsumerError.prototype.name = 'Consumer Error';

module.exports = ConsumerError;
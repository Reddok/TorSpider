'use strict';

class ServiceError extends Error {

    constructor(message) {
        super(message);
        Error.captureStackTrace(this, ServiceError);
    }

    get name() {
        return "ServiceError";
    }

}

module.exports = ServiceError;
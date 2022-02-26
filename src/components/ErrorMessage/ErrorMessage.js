import React from 'react';

function ErrorMessage(props) {

    const { errorCode } = props;

    function getErrorMessage() {
        switch(errorCode) {
            case 'anonymous-auth-failed':
                return 'Anonymous authentication failed. Try again.'
            case 'order-list-not-found':
                return 'The order list could not be found. Try creating a new one.';
            case 'order-list-get-fail':
                return 'Failed to retrieve the order list. Try again.';
            case 'add-list-item-error':
                return 'Failed to add order item to list. Try again.';
            case 'create-list-error':
                return 'Failed to create the order list. Try again.';
            case 'add-user-to-list-error':
                return 'Failed to add user to the order list. Try again.';
            case 'order-item-desc-req':
                return 'order item description required';
            case 'duplicate-item-error':
                return 'order item on list already';
            case 'user-name-required':
                return 'your name is required';
            case 'order-list-item-get-fail':
                return 'failed to get order list items';
            default:
                return errorCode;
        }
    }

    return errorCode ? <p className="error">{getErrorMessage()}</p> : null;
};

export default ErrorMessage;
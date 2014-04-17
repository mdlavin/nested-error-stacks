var util = require('util');

var NestedError = function (message, nested) {
    Error.call(this);
    this.message = message;
    this.nested = nested;

    Error.captureStackTrace(this, this.constructor);
    
    var oldStackDescriptor = Object.getOwnPropertyDescriptor(this, 'stack');

    Object.defineProperties(this, {
        stack: {
            get: function () {
                var stack = oldStackDescriptor.get();
                if (this.nested) {
                    stack += '\nCaused By: ' + this.nested.stack;
                }
                return stack;
            }
        }
        
    });
};

util.inherits(NestedError, Error);
NestedError.prototype.name = 'NestedError';


module.exports = NestedError;

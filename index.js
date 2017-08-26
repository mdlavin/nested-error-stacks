var inherits = require('inherits');

var NestedError = function (message, nested) {
    this.nested = nested;

    if (typeof message !== 'undefined') {
        Object.defineProperty(this, 'message', {
            value: message,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }

    Error.captureStackTrace(this, this.constructor);
    var oldStackDescriptor = Object.getOwnPropertyDescriptor(this, 'stack');
    var stackDescriptor = buildStackDescriptor(oldStackDescriptor, nested);
    Object.defineProperty(this, 'stack', stackDescriptor);
};

function buildStackDescriptor(oldStackDescriptor, nested) {
    if (oldStackDescriptor.get) {
        return {
            get: function () {
                var stack = oldStackDescriptor.get.call(this);
                return buildCombinedStacks(stack, this.nested);
            }
        };
    } else {
        var stack = oldStackDescriptor.value;
        return {
            value: buildCombinedStacks(stack, nested)
        };
    }
}

function buildCombinedStacks(stack, nested) {
    if (!nested) {
        return stack;
    }

    stack += '\n';

    // Bluebird long stack traces will drop any
    // trace lines that don't match /^\s*at\s*/
    // see https://github.com/mdlavin/nested-error-stacks/issues/12
    if (process.env.BLUEBIRD_DEBUG ||
        process.env.BLUEBIRD_LONG_STACK_TRACES ||
        process.env.NODE_ENV === 'development') {
        stack += 'at ';
    }

    stack += 'Caused By: ' + nested.stack;
    return stack;
}

inherits(NestedError, Error);
NestedError.prototype.name = 'NestedError';


module.exports = NestedError;

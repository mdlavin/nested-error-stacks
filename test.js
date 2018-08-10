var NestedError = require('./index.js');
var expect = require('chai').expect;
var uuid = require('uuid');
var inherits = require('util').inherits;

describe('NestedErrors', function ()  {

    it('are instances of Error', function () {
        var error = new NestedError();
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.be.an.instanceOf(NestedError);
    });

    it('include message in stacktrace', function () {
        var message = uuid.v1();
        var nested = new NestedError(message);

        expect(nested.stack).to.contain(message);
    });

    it('includes child stack in stacktrace', function () {
        var childMessage = uuid.v1();
        var child = new Error(childMessage);

        var message = uuid.v1();
        var nested = new NestedError(message, child);

        expect(nested.stack).to.contain('Caused By: ' + child.stack);
    });

    it('allows multiple nested errors', function () {
        var childMessage = uuid.v1();
        var child = new Error(childMessage);

        var child2Message = uuid.v1();
        var child2 = new NestedError(child2Message, child);

        var message = uuid.v1();
        var nested = new NestedError(message, child2);

        expect(nested.stack).to.contain('Caused By: ' + child2.stack);
    });

    it('includes Error subclass names in stacks', function () {
        var SubclassError = function (message) {
            NestedError.call(this, message);
        };
        inherits(SubclassError, NestedError);
        SubclassError.prototype.name = 'SubclassError';

        var message = uuid.v1();
        var error = new SubclassError(message);
        expect(error.stack).to.contain('SubclassError');
        expect(error.stack).to.contain(message);
    });

    it('includes Error subclass with nesting', function () {
        var SubclassError = function (message, nested) {
            NestedError.call(this, message, nested);
        };
        inherits(SubclassError, NestedError);
        SubclassError.prototype.name = 'SubclassError';

        var childMessage = uuid.v1();
        var child = new Error(childMessage);

        var message = uuid.v1();
        var error = new SubclassError(message, child);

        expect(error.stack).to.contain('Caused By: ' + child.stack);
    });

    it('messages are ECMAScript6 compatible', function () {
        var nested = new NestedError(uuid.v1());
        var messageDescriptor = Object.getOwnPropertyDescriptor(nested, 'message');

        expect(messageDescriptor.writable).to.be.equal(true);
        expect(messageDescriptor.enumerable).to.be.equal(false);
        expect(messageDescriptor.configurable).to.be.equal(true);
    });

    it('without messages are ECMAScript6 compatible', function () {
        var nested = new NestedError();
        var messageDescriptor = Object.getOwnPropertyDescriptor(nested, 'message');

        expect(messageDescriptor).to.be.undefined;
    });

    it('has stack property attributes that match other errors', function () {
        var normal = new Error();
        var nested = new Error('test', normal);

        var normalStackDescriptor = Object.getOwnPropertyDescriptor(normal, 'stack');
        var nestedStackDescriptor = Object.getOwnPropertyDescriptor(nested, 'stack');

        expect(nestedStackDescriptor.enumerable, 'enumerable').to.equal(normalStackDescriptor.enumerable);
        expect(nestedStackDescriptor.configurable, 'configurable').to.equal(normalStackDescriptor.configurable);
        expect(nestedStackDescriptor.writable, 'writable').to.equal(normalStackDescriptor.writable);
    });

    it('can accept only error parameter', function () {
        var error = new Error();
        var nestedError = new NestedError(error);
        expect(nestedError).to.be.an.instanceOf(NestedError);
    });
});

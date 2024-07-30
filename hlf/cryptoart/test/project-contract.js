/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { ProjectContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('ProjectContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new ProjectContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"project 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"project 1002 value"}'));
    });

    describe('#projectExists', () => {

        it('should return true for a project', async () => {
            await contract.projectExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a project that does not exist', async () => {
            await contract.projectExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createProject', () => {

        it('should create a project', async () => {
            await contract.createProject(ctx, '1003', 'project 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"project 1003 value"}'));
        });

        it('should throw an error for a project that already exists', async () => {
            await contract.createProject(ctx, '1001', 'myvalue').should.be.rejectedWith(/The project 1001 already exists/);
        });

    });

    describe('#readProject', () => {

        it('should return a project', async () => {
            await contract.readProject(ctx, '1001').should.eventually.deep.equal({ value: 'project 1001 value' });
        });

        it('should throw an error for a project that does not exist', async () => {
            await contract.readProject(ctx, '1003').should.be.rejectedWith(/The project 1003 does not exist/);
        });

    });

    describe('#updateProject', () => {

        it('should update a project', async () => {
            await contract.updateProject(ctx, '1001', 'project 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"project 1001 new value"}'));
        });

        it('should throw an error for a project that does not exist', async () => {
            await contract.updateProject(ctx, '1003', 'project 1003 new value').should.be.rejectedWith(/The project 1003 does not exist/);
        });

    });

    describe('#deleteProject', () => {

        it('should delete a project', async () => {
            await contract.deleteProject(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a project that does not exist', async () => {
            await contract.deleteProject(ctx, '1003').should.be.rejectedWith(/The project 1003 does not exist/);
        });

    });

});

/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class ProjectContract extends Contract {
    async projectExists(ctx, projectId) {
        const buffer = await ctx.stub.getState(projectId);
        return !!buffer && buffer.length > 0;
    }

    async createProject(ctx, projectId, value) {
        const exists = await this.projectExists(ctx, projectId);
        if (exists) {
            throw new Error(`The project ${projectId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(projectId, buffer);
    }

    async readProject(ctx, projectId) {
        const exists = await this.projectExists(ctx, projectId);
        if (!exists) {
            throw new Error(`The project ${projectId} does not exist`);
        }
        const buffer = await ctx.stub.getState(projectId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateProject(ctx, projectId, newValue) {
        const exists = await this.projectExists(ctx, projectId);
        if (!exists) {
            throw new Error(`The project ${projectId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(projectId, buffer);
    }

    async deleteProject(ctx, projectId) {
        const exists = await this.projectExists(ctx, projectId);
        if (!exists) {
            throw new Error(`The project ${projectId} does not exist`);
        }
        await ctx.stub.deleteState(projectId);
    }

    async getAllProjects(ctx) {
        const iterator = await ctx.stub.getStateByRange('', '');
        const allResults = [];

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const res = await iterator.next();

            if (res.done) {
                await iterator.close();
                return allResults;
            }

            const key = res.value.key;
            const value = res.value.value.toString('utf8');
            const asset = JSON.parse(value);
            allResults.push(Object.assign({ key }, asset));
        }
    }
}

module.exports = ProjectContract;

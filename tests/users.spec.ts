import { exec, execSync } from 'child_process';
import request from 'supertest';
import app from '../src/app';
import { afterEach, describe } from 'node:test';
import { beforeAll, afterAll, it, expect, beforeEach } from 'vitest';

describe('User routes', () => {
    beforeAll(async () => {
        await app.ready();
    });

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all');
        execSync('npm run knex migrate:latest');
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        execSync('npm run knex migrate:rollback');
    });

    it('should be able to create a user', async () => {
        const createUserResponse = await request(app.server)
            .post('/users')
            .send({ 'name': 'John Doe', 'email': 'johndoe@gmail.com' })
            .expect(201);

        expect(createUserResponse.get('Set-Cookie')).not.toBeNull();
        expect(createUserResponse.get('Set-Cookie')[0]).toContain('sessionId');
    });
});
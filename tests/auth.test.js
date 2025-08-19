const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const User = require('../models/userModel');
const { CacheService } = require('../config/redis');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Authentication Tests', () => {
    const testUser = {
        userName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: ['123 Test St'],
        answer: 'test answer'
    };

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', (done) => {
            chai.request(app)
                .post('/api/auth/register')
                .send(testUser)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body).to.have.property('token');
                    expect(res.body.user).to.have.property('email', testUser.email);
                    expect(res.body.user).to.not.have.property('password');
                    done();
                });
        });

        it('should not register user with existing email', (done) => {
            User.create(testUser).then(() => {
                chai.request(app)
                    .post('/api/auth/register')
                    .send(testUser)
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('success', false);
                        expect(res.body.message).to.include('already exists');
                        done();
                    });
            });
        });

        it('should validate required fields', (done) => {
            const invalidUser = { email: 'test@example.com' };
            
            chai.request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('success', false);
                    done();
                });
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            const user = new User(testUser);
            await user.save();
        });

        it('should login user with correct credentials', (done) => {
            chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    expect(res.body).to.have.property('token');
                    expect(res.body.user).to.have.property('email', testUser.email);
                    done();
                });
        });

        it('should not login with incorrect password', (done) => {
            chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('success', false);
                    done();
                });
        });

        it('should not login with non-existent email', (done) => {
            chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('success', false);
                    done();
                });
        });
    });

    describe('Cache Integration Tests', () => {
        it('should cache user data after login', async () => {
            const user = new User(testUser);
            await user.save();

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res).to.have.status(200);
            
            // Check if user data is cached
            const cacheKey = `user:${res.body.user.id}`;
            const cachedUser = await CacheService.get(cacheKey);
            expect(cachedUser).to.not.be.null;
            expect(cachedUser.email).to.equal(testUser.email);
        });

        it('should handle rate limiting', async () => {
            const requests = [];
            
            // Make 110 requests rapidly (over the limit of 100)
            for (let i = 0; i < 110; i++) {
                requests.push(
                    chai.request(app)
                        .post('/api/auth/login')
                        .send({
                            email: testUser.email,
                            password: testUser.password
                        })
                );
            }

            const responses = await Promise.allSettled(requests);
            const rateLimitedResponses = responses.filter(
                result => result.value && result.value.status === 429
            );

            expect(rateLimitedResponses.length).to.be.greaterThan(0);
        });
    });

    describe('JWT Token Tests', () => {
        let authToken;

        beforeEach(async () => {
            const user = new User(testUser);
            await user.save();

            const res = await chai.request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            authToken = res.body.token;
        });

        it('should access protected routes with valid token', (done) => {
            chai.request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('success', true);
                    done();
                });
        });

        it('should reject access with invalid token', (done) => {
            chai.request(app)
                .get('/api/user/profile')
                .set('Authorization', 'Bearer invalidtoken')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('success', false);
                    done();
                });
        });

        it('should reject access without token', (done) => {
            chai.request(app)
                .get('/api/user/profile')
                .end((err, res) => {
                    expect(res).to.have.status(401);
                    expect(res.body).to.have.property('success', false);
                    done();
                });
        });
    });
});

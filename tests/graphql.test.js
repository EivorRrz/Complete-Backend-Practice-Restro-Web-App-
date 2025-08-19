const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');
const User = require('../models/userModel');
const Food = require('../models/foodModel');
const Category = require('../models/categoryModel');

chai.use(chaiHttp);
const expect = chai.expect;

describe('GraphQL API Tests', () => {
    let authToken;
    let testUser;

    before(async () => {
        // Create test user and get auth token
        testUser = await User.create({
            userName: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            phone: '1234567890',
            address: ['123 Test St'],
            answer: 'test answer'
        });

        const loginRes = await chai.request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        authToken = loginRes.body.token;
    });

    describe('User Queries', () => {
        it('should fetch user by ID', (done) => {
            const query = `
                query GetUser($id: ID!) {
                    getUser(id: $id) {
                        id
                        userName
                        email
                        phone
                        usertype
                    }
                }
            `;

            chai.request(app)
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    query,
                    variables: { id: testUser._id.toString() }
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.getUser).to.not.be.null;
                    expect(res.body.data.getUser.email).to.equal('test@example.com');
                    done();
                });
        });

        it('should fetch all users', (done) => {
            const query = `
                query {
                    getAllUsers {
                        id
                        userName
                        email
                        usertype
                    }
                }
            `;

            chai.request(app)
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ query })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.getAllUsers).to.be.an('array');
                    expect(res.body.data.getAllUsers.length).to.be.greaterThan(0);
                    done();
                });
        });
    });

    describe('Category Operations', () => {
        it('should create a new category', (done) => {
            const mutation = `
                mutation CreateCategory($input: CategoryInput!) {
                    createCategory(input: $input) {
                        id
                        title
                        imageUrl
                    }
                }
            `;

            const variables = {
                input: {
                    title: 'Test Category',
                    imageUrl: 'https://example.com/image.jpg'
                }
            };

            chai.request(app)
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ query: mutation, variables })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.createCategory).to.not.be.null;
                    expect(res.body.data.createCategory.title).to.equal('Test Category');
                    done();
                });
        });

        it('should fetch all categories', (done) => {
            const query = `
                query {
                    getAllCategories {
                        id
                        title
                        imageUrl
                    }
                }
            `;

            chai.request(app)
                .post('/graphql')
                .send({ query })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.getAllCategories).to.be.an('array');
                    done();
                });
        });
    });

    describe('Food Operations', () => {
        let categoryId;

        before(async () => {
            const category = await Category.create({
                title: 'Test Food Category',
                imageUrl: 'https://example.com/category.jpg'
            });
            categoryId = category._id.toString();
        });

        it('should create a new food item', (done) => {
            const mutation = `
                mutation CreateFood($input: FoodInput!) {
                    createFood(input: $input) {
                        id
                        title
                        description
                        price
                        category
                        restaurant
                    }
                }
            `;

            const variables = {
                input: {
                    title: 'Test Food',
                    description: 'Delicious test food',
                    price: 12.99,
                    imageUrl: 'https://example.com/food.jpg',
                    foodTags: 'spicy,vegetarian',
                    category: categoryId,
                    code: 'TF001',
                    restaurant: 'test-restaurant-id'
                }
            };

            chai.request(app)
                .post('/graphql')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ query: mutation, variables })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.createFood).to.not.be.null;
                    expect(res.body.data.createFood.title).to.equal('Test Food');
                    expect(res.body.data.createFood.price).to.equal(12.99);
                    done();
                });
        });

        it('should search foods by query', (done) => {
            const query = `
                query SearchFoods($query: String!) {
                    searchFoods(query: $query) {
                        id
                        title
                        description
                        price
                    }
                }
            `;

            chai.request(app)
                .post('/graphql')
                .send({
                    query,
                    variables: { query: 'Test' }
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.searchFoods).to.be.an('array');
                    done();
                });
        });

        it('should get foods by category', (done) => {
            const query = `
                query GetFoodsByCategory($category: String!) {
                    getFoodsByCategory(category: $category) {
                        id
                        title
                        category
                    }
                }
            `;

            chai.request(app)
                .post('/graphql')
                .send({
                    query,
                    variables: { category: categoryId }
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.data.getFoodsByCategory).to.be.an('array');
                    done();
                });
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid queries gracefully', (done) => {
            const invalidQuery = `
                query {
                    nonExistentField {
                        id
                    }
                }
            `;

            chai.request(app)
                .post('/graphql')
                .send({ query: invalidQuery })
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body.errors).to.be.an('array');
                    done();
                });
        });

        it('should handle unauthorized access', (done) => {
            const mutation = `
                mutation {
                    createOrder(input: {
                        foods: [{food: "test-food-id", quantity: 1, price: 10.99}]
                        payment: {method: "credit_card", status: "pending"}
                        totalAmount: 10.99
                    }) {
                        id
                        totalAmount
                    }
                }
            `;

            chai.request(app)
                .post('/graphql')
                .send({ query: mutation })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body.errors).to.be.an('array');
                    expect(res.body.errors[0].message).to.include('Authentication required');
                    done();
                });
        });
    });

    describe('Cache Integration', () => {
        it('should use cached data for repeated queries', async () => {
            const query = `
                query {
                    getAllCategories {
                        id
                        title
                    }
                }
            `;

            // First request - should cache the data
            const res1 = await chai.request(app)
                .post('/graphql')
                .send({ query });

            expect(res1).to.have.status(200);

            // Second request - should use cached data
            const res2 = await chai.request(app)
                .post('/graphql')
                .send({ query });

            expect(res2).to.have.status(200);
            expect(res2.body.data.getAllCategories).to.deep.equal(res1.body.data.getAllCategories);
        });
    });
});

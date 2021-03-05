require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });



    test.skip('returns campgrounds', async () => {

      await fakeRequest(app)
        .get('/campgrounds')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    test('create a favorite item', async () => {

      const newFav = {
        full_name: 'the club',
        description: 'a desolate wasteland where heathens come to feed',
        url: 'https://www.placekitten.com',
        directions_info: 'under the u-bahn, line 7',
        directions_url: 'https://www.google.com',
        owner_id: 2
      };

      const expectedFav = {
        ...newFav,

        id: 4

      };
      const data = await fakeRequest(app)
        .post('/api/favorites')
        .send(newFav)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([expectedFav]);
    });

    test('returns list of favorites', async () => {
      const expectation = {
        description: 'a desolate wasteland where heathens come to feed',
        directions_info: 'under the u-bahn, line 7',
        directions_url: 'https://www.google.com',
        full_name: 'the club',
        id: 4,
        owner_id: 2,
        url: 'https://www.placekitten.com'
      };

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([expectation]);
    });

    test('deletes a single item with the matching id', async () => {
      const expectation = {
        description: 'a desolate wasteland where heathens come to feed',
        directions_info: 'under the u-bahn, line 7',
        directions_url: 'https://www.google.com',
        full_name: 'the club',
        id: 4,
        owner_id: 2,
        url: 'https://www.placekitten.com'
      };

      const data = await fakeRequest(app)
        .delete('/api/favorites/4')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body[0]).toEqual(expectation);

      const nothing = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual([]);
    });
  });
});

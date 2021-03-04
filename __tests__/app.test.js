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

    const favorite = {
      full_name: 'Crater Lake National Park',
      description: 'Crater Lake inspires awe. Native Americans witnessed its  formation 7,700 years ago, when a violent eruption triggered the collapse of   a tall peak. Scientists marvel at its purity: fed by rain and snow, it’s the  deepest lake in the USA and one of the most pristine on earth. Artists,  photographers, and sightseers gaze in wonder at its blue water and stunning  setting atop the Cascade Mountain Range.',
      url: 'https://www.nps.gov/crla/index.htm',
      directions_info: 'From the west (Medford) - Take Hwy 62 to the West Entrance.  Open year-round. From the south (Klamath Falls) - Take Hwy 97 north to Hwy   62 to the South Entrance. Open year-round. The North Entrance is on Hwy 138   and is accessed from Interstate 5 east at Roseburg or Hwy 97 south from Bend  and Chemult. Winter travelers from Roseburg take Route 138 east to Route 230   south to Route 62 east to the park\'s west entrance. Travelers from Bend  take Route 97 south to Route 62 to the park\'s south entrance.',
      directions_url: 'http://www.nps.gov/crla/planyourvisit/directions.htm',
      owner_id: 1
    };

    const dbFavorites = {
      ...favorite,
      id: 4
    };

    test('returns campgrounds', async () => {

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
        owner_id: 1
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

    test.skip('returns list of favorites', async () => {

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([dbFavorites]);
    });

    test.skip('deletes a single item with the matching id', async () => {
      const expectation = {
        full_name: 'Crater Lake National Park',
        description: 'Crater Lake inspires awe. Native Americans witnessed its formation 7,700 years ago, when a violent eruption triggered the collapse of a tall peak. Scientists marvel at its purity: fed by rain and snow, it’s the deepest lake in the USA and one of the most pristine on earth. Artists, photographers, and sightseers gaze in wonder at its blue water and stunning setting atop the Cascade Mountain Range.',
        url: 'https://www.nps.gov/crla/index.htm',
        directions_info: 'From the west (Medford) - Take Hwy 62 to the West Entrance. Open year-round. From the south (Klamath Falls) - Take Hwy 97 north to Hwy 62 to the South Entrance. Open year-round. The North Entrance is on Hwy 138 and is accessed from Interstate 5 east at Roseburg or Hwy 97 south from Bend and Chemult. Winter travelers from Roseburg take Route 138 east to Route 230 south to Route 62 east to the park\'s west entrance. Travelers from Bend take Route 97 south to Route 62 to the park\'s south entrance.',
        directions_url: 'http://www.nps.gov/crla/planyourvisit/directions.htm',
        owner_id: 1,
        id: 1
      };

      const data = await fakeRequest(app)
        .delete('api/favorites/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const nothing = await fakeRequest(app)
        .get('/api/favorites/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(nothing.body).toEqual('');
    });
  });
});

const seed = require('firestore-seed');
const { db, admin } = require('../services/firebase.service');
const faker = require('faker/locale/es');

const NUM_BANDS = 100;

// World Coordinates
// const MIN_LATITUDE = -90;
// const MAX_LATITUDE = 90;
// const MIN_LONGITUDE = -180;
// const MAX_LONGITUDE = 180;

// TEST: Coordinates Near Alicante
const MIN_LATITUDE = 38.25;
const MAX_LATITUDE = 39;
const MIN_LONGITUDE = -1;
const MAX_LONGITUDE = -0.5;

const instrumentos = [
  'keyboard',
  'piano',
  'recorder',
  'classical-guitar',
  'drum-set',
  'electric-guitar',
  'violin',
  'percussion',
  'bass',
  'saxophone',
  'flute',
  'cello',
  'clarinet',
  'trumpet',
  'harp',
];

let bandsCollection = seed.collection(
  'bandas',
  Array(NUM_BANDS)
    .fill('')
    .map(() =>
      seed.doc(db.collection('bandas').doc().id, {
        actuaciones: faker.datatype.number(1000),
        ciudad: `${faker.address.cityName()}, ${faker.address.country()}`,
        descripcion: faker.commerce.productDescription(),
        fans: faker.datatype.number(),
        fechaFundacion: new Date(
          faker.date.past() - new Date().getTimezoneOffset() * 60000
        ).toISOString(),
        fundador: {
          email: faker.internet.email(),
          nombre: faker.name.findName(),
          username: faker.internet.userName(),
          usuario: faker.datatype.uuid(),
        },
        generos: Array(faker.datatype.number({ min: 1, max: 5 }))
          .fill('')
          .map(() => faker.music.genre().toLowerCase().replace(/\s/g, '-')),
        instrumentos: Array(faker.datatype.number({ min: 1, max: 5 }))
          .fill('')
          .map(() => faker.random.arrayElement(instrumentos)),
        imagenFondo: faker.image.image(),
        imagenPerfil: faker.image.image(),
        nivel: faker.random.arrayElement([
          'principiante',
          'intermedio',
          'avanzado',
        ]),
        nombre: `The ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
        ubicacion: {
          latitude: faker.datatype.float({
            min: MIN_LATITUDE,
            max: MAX_LATITUDE,
          }),
          latitudeDelta: 0.0922,
          longitude: faker.datatype.float({
            min: MIN_LONGITUDE,
            max: MAX_LONGITUDE,
          }),
          longitudeDelta: 0.0421,
        },
        valoracion: faker.datatype.float({ min: 0, max: 5, precision: 0.1 }),
      })
    )
);

bandsCollection
  .importDocuments(admin)
  .then(() => {
    console.log('Bandas generadas correctamente.');
  })
  .catch((e) => {
    console.log('ERROR al generar bandas: ' + e);
  });

module.exports = bandsCollection;

const seed = require('firestore-seed');
const { db, admin } = require('../services/firebase.service');
const faker = require('faker');

const NUM_BANDS = 10;

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
          .map(() => faker.music.genre()),
        imagenFondo: faker.image.image(),
        imagenPerfil: faker.image.avatar(),
        nivel: faker.random.arrayElement([
          'principiante',
          'intermedio',
          'avanzado',
          'profesional',
        ]),
        nombre: `The ${faker.hacker.adjective()} ${faker.hacker.noun()}`,
        ubicacion: {
          latitude: faker.datatype.float({ min: -90, max: 90 }),
          latitudeDelta: 0.0922,
          longitude: faker.datatype.float({ min: -180, max: 180 }),
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

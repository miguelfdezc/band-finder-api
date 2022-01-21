'use strict';

require('dotenv').config();
const { db } = require('./firebase.service');
let UserService = require('./user.service');

const service = {
  matchBand: async function ({
    ubicacion,
    distanciaMax,
    instrumento,
    genero,
    usuario: uid,
  }) {
    try {
      const distancias = {
        SUFICIENTE: distanciaMax,
        INTERMEDIA: distanciaMax * 0.75,
        BUENA: distanciaMax * 0.5,
        MUY_BUENA: distanciaMax * 0.25,
        EXCELENTE: distanciaMax * 0.1,
      };

      let bands = await this.filterBands(genero, ubicacion, distanciaMax);

      const user = await UserService.readUser(uid);

      let points = bands
        .map((band) => {
          return {
            id: band.id,
            points: this.calculatePoints(band, user, instrumento, distancias),
            ...band,
          };
        })
        .filter((band) => band.points > 0)
        .sort((a, b) => {
          if (a.points > b.points) return -1;
          else if (a.points < b.points) return 1;
          else {
            if (a.distancia < b.distancia) return -1;
            else if (a.distancia > b.distancia) return 1;
            else return 0;
          }
        });

      return points;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  calculatePoints: function (band, user, instrumento, distancias) {
    let points, p_inst, p_gen, p_dist, p_exp, bonus_instruments;
    points = p_inst = p_gen = p_dist = p_exp = bonus_instruments = 0;

    const INSTRUMENT = process.env.INSTRUMENT ?? 3;
    const BONUS_INSTRUMENT = process.env.BONUS_INSTRUMENT ?? 0.5;
    const GENRE = process.env.GENRE ?? 1;
    const DISTANCES = {
      EXCELENTE: process.env.DISTANCE_EXCELLENT ?? 3,
      MUY_BUENA: process.env.DISTANCE_VERY_GOOD ?? 2.5,
      BUENA: process.env.DISTANCE_GOOD ?? 1.5,
      INTERMEDIA: process.env.DISTANCE_INTERMEDIATE ?? 1,
      SUFICIENTE: process.env.DISTANCE_SUFFICIENT ?? 0.5,
    };
    const LEVEL_EQUAL = process.env.LEVEL_EQUAL ?? 1;
    const LEVEL_LOWER = process.env.LEVEL_LOWER ?? 0.5;
    const LEVELS = {
      principiante: 0,
      intermedio: 1,
      avanzado: 2,
    };

    // Instrumentos (MAX: 4p)
    if (band.instrumentos.includes(instrumento)) p_inst += INSTRUMENT;
    for (const i of user.instrumentos) {
      if (bonus_instruments === 1) break;
      bonus_instruments +=
        i.nombre !== instrumento && band.instrumentos.includes(i.nombre)
          ? BONUS_INSTRUMENT
          : 0;
    }
    p_inst += bonus_instruments;
    if (p_inst === 0) return 0;

    // Géneros (MAX: 2p)
    for (const g of user.generos) {
      if (p_gen === 2) break;
      p_gen += band.generos.includes(g) ? GENRE : 0;
    }

    // Distancia (MAX: 3p)
    const dist = Number(band.distancia);
    for (const d in distancias) if (dist < distancias[d]) p_dist = DISTANCES[d];

    // Experiencia (MAX: 1p)
    const found = user.instrumentos.findIndex((v) => v.nombre === instrumento);
    if (found >= 0) {
      const bandLevel = LEVELS[band.nivel],
        userLevel = LEVELS[user.instrumentos[found].nivel];
      if (userLevel === bandLevel) p_exp = LEVEL_EQUAL;
      else if (userLevel > bandLevel) p_exp = LEVEL_LOWER;
    }
    if (p_exp === 0) return 0;

    // TOTAL POINTS
    points = p_inst + p_gen + p_dist + p_exp;
    return parseFloat(points.toFixed(2));
  },
  filterBands: async function (genero, ubicacion, distanciaMax) {
    try {
      const bandsRef = db.collection('bandas');
      const snapshot = await bandsRef
        .where('generos', 'array-contains', genero)
        .get();

      if (snapshot.empty) return [];

      let filtered_bands = [];

      snapshot.forEach((doc) => {
        filtered_bands.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const result = filtered_bands
        .filter(
          (band) =>
            this.calculateDistance(ubicacion, band.ubicacion) <= distanciaMax
        )
        .map((band) => {
          return {
            ...band,
            distancia: this.calculateDistance(ubicacion, band.ubicacion),
          };
        });

      return result;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
  calculateDistance: function (l1, l2) {
    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371;
    try {
      const dLat = deg2rad(l1.latitude - l2.latitude);
      const dLon = deg2rad(l1.longitude - l2.longitude);

      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(l2.latitude)) *
          Math.cos(deg2rad(l1.latitude)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c; // Distance in km
      return d;
    } catch (err) {
      if (err && err.message) throw new Error(err.message);
      else throw new Error(err);
    }
  },
};

module.exports = service;

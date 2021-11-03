'use strict';

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
    let points, p_inst, p_gen, p_dist, bonus_instruments, bonus_genres;
    points = p_inst = p_gen = p_dist = bonus_instruments = bonus_genres = 0;

    // Instrumentos (MAX: 4p)
    if (band.instrumentos.includes(instrumento)) p_inst += 3;
    user.instrumentos.forEach((value) => {
      if (
        value.nombre !== instrumento &&
        bonus_instruments < 1 &&
        band.instrumentos.includes(value.nombre)
      )
        bonus_instruments += 0.5;
    });
    p_inst += bonus_instruments;
    if (p_inst === 0) return 0;

    // Géneros (MAX: 2p)
    user.generos.forEach((value) => {
      if (bonus_genres < 2 && band.generos.includes(value)) bonus_genres += 1;
    });
    p_gen = bonus_genres;

    // Distancia (MAX: 3p)

    const d = Number(band.distancia);

    switch (true) {
      case d < distancias.EXCELENTE:
        p_dist += 3;
        break;
      case d < distancias.MUY_BUENA:
        p_dist += 2.5;
        break;
      case d < distancias.BUENA:
        p_dist += 1.5;
        break;
      case d < distancias.INTERMEDIA:
        p_dist += 1;
        break;
      case d < distancias.SUFICIENTE:
        p_dist += 0.5;
      default:
        break;
    }

    // Experiencia (MAX: 1p)
    let p_exp = 0;
    const found = user.instrumentos.findIndex((v) => v.nombre === instrumento);
    if (found >= 0) {
      switch (band.nivel) {
        case 'principiante':
          if (user.instrumentos[found].nivel === 'principiante') p_exp = 1;
          else p_exp = 0.5;
          break;
        case 'intermedio':
          if (user.instrumentos[found].nivel === 'principiante') p_exp = 0;
          else if (user.instrumentos[found].nivel === 'intermedio') p_exp = 1;
          else if (user.instrumentos[found].nivel === 'avanzado') p_exp = 0.5;
          break;
        case 'avanzado':
          if (user.instrumentos[found].nivel === 'avanzado') p_exp = 1;
          else p_exp = 0;
          break;
      }
    }
    if (p_exp === 0) return 0;

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

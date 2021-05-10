# Band Finder API

## Tablero Trello

_Backlog_ de las historias de usuario: [Backlog Band Finder](https://trello.com/b/IKcaFWqK/backlog-band-finder)

## Requisitos

Necesitas tener instalado en tu sistema:

- NodeJS

## Instalación

```sh
npm install
cp .env.example .env    # Linux
copy .env.example .env  # Windows
```

## Ejecución

Puedes ejecutar la aplicación usando los scripts definidos en el archivo de configuración `package.json` o utilizando los comandos correspondientes:

- Ejecución normal

```sh
npm start
o
node index.js
```

- Ejecución en modo desarrollo

```sh
npm run dev
o
nodemon index.js
```

Una vez lanzada la aplicación puedes enviar peticiones HTTP a:

- [http://localhost:8000/api](http://localhost:8000/api)

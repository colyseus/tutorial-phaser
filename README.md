# Phaser: Real-time Multiplayer with Colyseus

Full source-code for the step-by-step tutorial on how to use Phaser + Colyseus together.

- [Live Demo](https://colyseus-phaser-tutorial.glitch.me/)
- [See step-by-step Tutorial](https://colyseus.io/learn/phaser/)
- [See Colyseus documentation](https://docs.colyseus.io/)

## How to run the **server**

- Download and install [Node.js LTS](https://nodejs.org/en/download/)
- Clone or download this repository.
- Run the following commands:

```
cd server
npm install
npm start
```

The WebSocket server should be available locally at `ws://localhost:2567` ([http://localhost:2567](http://localhost:2567) should be accessible.)

## How to run the **client**

In a new Terminal tab, run the following commands:

```
cd client
npm install
npm start
```

The client should be accessible at [`http://localhost:1234`](`http://localhost:1234`).

## License

- Source-code is licensed under MIT License.
- The [assets](https://www.kenney.nl/assets/pixel-shmup) are licensed under [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). 

import Phaser from "phaser";
import { Room, Client } from "colyseus.js";
import { BACKEND_URL } from "../backend";

export class GameScene extends Phaser.Scene {
  room: Room;
  playerEntities: {
    [sessionId: string]: Phaser.GameObjects.Sprite;
  } = {};
  playerGroup: Phaser.Physics.Arcade.Group;

  debugFPS: Phaser.GameObjects.Text;
  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  inputPayload = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  constructor() {
    super({ key: "gameScene" });
  }

  preload() {
    this.cameras.main.setBackgroundColor(0x000000);
    this.load.spritesheet("pj", "assets/4500.png", {
      frameWidth: 140,
      frameHeight: 170,
    });
  }

  async create() {
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.debugFPS = this.add.text(4, 4, "", { color: "#ff0000" });

    this.anims.create({
      key: "move-left",
      frames: this.anims.generateFrameNumbers("pj", { start: 24, end: 31 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "move-right",
      frames: this.anims.generateFrameNumbers("pj", { start: 16, end: 23 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "move-down",
      frames: this.anims.generateFrameNumbers("pj", { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "move-up",
      frames: this.anims.generateFrameNumbers("pj", { start: 8, end: 15 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "idle",
      frames: [{ key: "pj", frame: 0 }],
      frameRate: 10,
    });

    this.playerGroup = this.physics.add.group();

    await this.connect();

    this.room.state.players.onAdd((player, sessionId) => {
      if (!player) {
        console.error("Player data is undefined");
        return;
      }

      const entity = this.physics.add.sprite(player.x, player.y, "pj");
      entity.setCollideWorldBounds(true); // Impide que se salga del mapa
      this.playerGroup.add(entity);

      this.playerEntities[sessionId] = entity;

      player.onChange(() => {
        if (player.x !== undefined && player.y !== undefined) {
          entity.x = player.x;
          entity.y = player.y;
        }
      });

      if (sessionId === this.room.sessionId) {
        this.cameras.main.startFollow(entity);
      }
    });

    this.room.state.players.onRemove((player, sessionId) => {
      const entity = this.playerEntities[sessionId];
      if (entity) {
        entity.destroy();
        delete this.playerEntities[sessionId];
      }
    });

    this.cameras.main.setBounds(0, 0, 800, 600);
    this.physics.world.setBounds(0, 0, 800, 600);

    // Agregar colisiones entre los jugadores sin empujarlos
    this.physics.add.collider(
      this.playerGroup,
      this.playerGroup,
      this.preventOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  async connect() {
    const connectionStatusText = this.add
      .text(0, 0, "Trying to connect with the server...")
      .setStyle({ color: "#ff0000" })
      .setPadding(4);

    const client = new Client(BACKEND_URL);

    try {
      this.room = await client.joinOrCreate("part1_room", {});
      connectionStatusText.destroy();
    } catch (e) {
      connectionStatusText.text = "Could not connect with the server.";
    }
  }

  update() {
    if (!this.room) {
      return;
    }

    const playerEntity = this.playerEntities[this.room.sessionId];
    if (!playerEntity) {
      return;
    }

    const body = playerEntity.body as Phaser.Physics.Arcade.Body;

    // Resetear velocidad
    body.setVelocity(0);

    // Movimiento con las flechas
    if (this.cursorKeys.left.isDown) {
      body.setVelocityX(-160);
      playerEntity.anims.play("move-left", true);
    } else if (this.cursorKeys.right.isDown) {
      body.setVelocityX(160);
      playerEntity.anims.play("move-right", true);
    } else if (this.cursorKeys.up.isDown) {
      body.setVelocityY(-160);
      playerEntity.anims.play("move-up", true);
    } else if (this.cursorKeys.down.isDown) {
      body.setVelocityY(160);
      playerEntity.anims.play("move-down", true);
    } else {
      playerEntity.anims.play("idle");
    }

    // Limitar el movimiento dentro del mapa
    playerEntity.x = Phaser.Math.Clamp(playerEntity.x, 0, 800);
    playerEntity.y = Phaser.Math.Clamp(playerEntity.y, 0, 600);

    // Sincronizar el estado de entrada
    this.inputPayload.left = this.cursorKeys.left.isDown;
    this.inputPayload.right = this.cursorKeys.right.isDown;
    this.inputPayload.up = this.cursorKeys.up.isDown;
    this.inputPayload.down = this.cursorKeys.down.isDown;
    this.room.send(0, this.inputPayload);

    // Debug para FPS
    this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps}`;
  }

  preventOverlap(
    player1: Phaser.GameObjects.GameObject,
    player2: Phaser.GameObjects.GameObject
  ): void {
    const body1 = player1.body as Phaser.Physics.Arcade.Body;
    const body2 = player2.body as Phaser.Physics.Arcade.Body;

    if (body1 && body2) {
      // Corregir solapamiento estableciendo velocidades a cero
      body1.velocity.set(0, 0);
      body2.velocity.set(0, 0);
    }
  }
}

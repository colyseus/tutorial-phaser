import { Schema, type, MapSchema } from "@colyseus/schema";

export interface InputData {
  left: false;
  right: false;
  up: false;
  down: false;
}

export class Player extends Schema {
  @type("number") x: number;
  @type("number") y: number;

  input: InputData;
}

export class Part1State extends Schema {
  @type("number") mapWidth: number;
  @type("number") mapHeight: number;

  @type({ map: Player }) players = new MapSchema<Player>();
}

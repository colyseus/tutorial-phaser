import { Room, Client } from "colyseus";
import { Part1State, Player } from "./Part1State";

export class Part2Room extends Room<Part1State> {

  onCreate (options: any) {
    this.setState(new Part1State());

    // set map dimensions
    this.state.mapWidth = 800;
    this.state.mapHeight = 600;

    this.onMessage(0, (client, input) => {
      // handle player input
      const player = this.state.players.get(client.sessionId);
      player.input = input;
    });

    this.setSimulationInterval((deltaTime) => {
      this.update(deltaTime);
    });
  }

  update(deltaTime: number) {
    const velocity = 2;

    // process each player input
    this.state.players.forEach(player => {
      if (!player.input) {
        return; 
      }

      if (player.input.left) {
        player.x -= velocity;

      } else if (player.input.right) {
        player.x += velocity;
      }

      if (player.input.up) {
        player.y -= velocity;

      } else if (player.input.down) {
        player.y += velocity;
      }
    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    // create player at random position.
    const player = new Player();
    player.x = Math.random() * this.state.mapWidth;
    player.y = Math.random() * this.state.mapHeight;

    this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}

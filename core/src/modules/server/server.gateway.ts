import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
  namespace: "/server-status",
  cors: {
    origin: "*",
  },
})

export class ServerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    console.log("Client connected:", client.id);
  }

  handleDisconnect(client: Socket) {
    console.log("Client disconnected:", client.id);
  }

  sendStatus(data: any) {
    this.server.emit("server:status", data);
  }

  @SubscribeMessage("deployments:subscribe")
  handleDeploymentSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: { token?: string },
  ) {
    const user = this.resolveSocketUser(payload?.token);

    if (!user?.id) {
      return {
        ok: false,
      };
    }

    client.join(this.getDeploymentRoom(user.id));

    return {
      ok: true,
    };
  }

  @SubscribeMessage("deployments:unsubscribe")
  handleDeploymentUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: { token?: string },
  ) {
    const user = this.resolveSocketUser(payload?.token);

    if (!user?.id) {
      return {
        ok: false,
      };
    }

    client.leave(this.getDeploymentRoom(user.id));

    return {
      ok: true,
    };
  }

  sendDeploymentLog(customerId: number, data: any) {
    this.server
      .to(this.getDeploymentRoom(customerId))
      .emit("deployments:build-log", data);
  }

  private getDeploymentRoom(customerId: string | number) {
    return `deployments:${customerId}`;
  }

  private resolveSocketUser(token?: string) {
    if (!token) {
      return null;
    }

    try {
      return this.jwtService.verify(token) as { id?: string | number };
    } catch {
      return null;
    }
  }
}

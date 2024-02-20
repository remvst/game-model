import { WorldUpdate } from "./world-update";

export interface RoomPlayerJson {
    id: string;
    latency?: number;
    isMeta?: boolean;
}

export interface RoomUpdateJson {
    updateId: number;
    ackId: number;
    players?: RoomPlayerJson[];
    world: WorldUpdate<any, any>;
}

export type RoomPlayerJsonShort = [
    id: string,
    latency: number,
    isMeta: boolean,
];

export type RoomUpdateJsonShort = [
    updateId: number,
    ackId: number,
    players: RoomPlayerJsonShort[],
    world: WorldUpdate<any, any>,
];

export function toShortRoomUpdate(
    roomUpdate: RoomUpdateJson,
): RoomUpdateJsonShort {
    return [
        roomUpdate.updateId,
        roomUpdate.ackId,
        (roomUpdate.players || []).map(toShortRoomPlayer),
        roomUpdate.world,
    ];
}

export function fromShortRoomUpdate(
    roomUpdate: RoomUpdateJsonShort,
): RoomUpdateJson {
    return {
        updateId: roomUpdate[0],
        ackId: roomUpdate[1],
        players: roomUpdate[2].map(fromShortRoomPlayer),
        world: roomUpdate[3],
    };
}

export function toShortRoomPlayer(
    roomPlayer: RoomPlayerJson,
): RoomPlayerJsonShort {
    return [roomPlayer.id, roomPlayer.latency, roomPlayer.isMeta];
}

export function fromShortRoomPlayer(
    roomPlayer: RoomPlayerJsonShort,
): RoomPlayerJson {
    return {
        id: roomPlayer[0],
        latency: roomPlayer[1],
        isMeta: roomPlayer[2],
    };
}

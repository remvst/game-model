import { EntityEvent } from "./entity-event";

export class WeaponEffectTriggered implements EntityEvent {
    weaponType: string | null = null;
}

export class WeaponEffectFailed implements EntityEvent {
    weaponType: string | null = null;
}

export class WeaponReloadStarted implements EntityEvent {
    weaponType: string | null = null;
}

export class WeaponAmmoDepleted implements EntityEvent {
    weaponType: string | null = null;
}

export class WeaponSwitched implements EntityEvent {}

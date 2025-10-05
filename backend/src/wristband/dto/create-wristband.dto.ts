import { WristbandStatus } from "../entities/wristband.entity";

export class CreateWristbandDto {
    eventId: string;
    categoryId: string;
    status: WristbandStatus;
}

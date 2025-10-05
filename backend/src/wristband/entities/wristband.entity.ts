import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


export enum WristbandStatus {
    UNUSED = 'unused',
    ASSIGNED = 'assigned',
    CHECKED_IN = 'checked_in',
}


@Entity("wristband")
export class Wristband {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'uuid'})
    eventId: string;

    @Column({type: 'uuid'})
    categoryId: string;

    @Column({nullable: true})
    code? : string;

    @Column({
        type: 'enum',
        enum: WristbandStatus,
        default: WristbandStatus.UNUSED,
    })
    status: WristbandStatus;

    @Column({type: 'uuid', nullable: true})
    assignedTicketId?: string;

    @Column({nullable: true})
    assignedTicketCode?: string;

    @Column({nullable: true})
    assignedAt?: Date;
    
    @Column({nullable: true})
    checkedInAt?: Date;

}

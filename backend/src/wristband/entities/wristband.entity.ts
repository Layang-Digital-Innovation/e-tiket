import { AuditEntity } from "src/common/entities/audit.entity";
import { Event } from "src/events/entities/event.entity";
import { TicketCategory } from "src/ticket_categories/entities/ticket_category.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


export enum WristbandStatus {
    UNUSED = 'unused',
    ASSIGNED = 'assigned',
    CHECKED_IN = 'checked_in',
}


@Entity("wristband")
export class Wristband extends AuditEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

   @ManyToOne(() => Event, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'event_id' })
event: Event;

@ManyToOne(() => TicketCategory, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'category_id' })
category: TicketCategory;

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

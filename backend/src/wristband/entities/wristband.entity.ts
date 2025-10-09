import { AuditEntity } from "src/common/entities/audit.entity";
import { Event } from "src/events/entities/event.entity";
import { TicketCategory } from "src/ticket_categories/entities/ticket_category.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


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
    wristbandCode? : string;

    @BeforeInsert()
    async generateWristbandCode() {
        if (!this.wristbandCode) {
            const {customAlphabet} = await import ('nanoid')
            const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)
            this.wristbandCode = nanoid()
        }
    }


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

import { Wristband } from "src/wristband/entities/wristband.entity";
import { Event } from "src/events/entities/event.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AuditEntity } from "src/common/entities/audit.entity";

@Entity("ticket_category")
export class TicketCategory extends AuditEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'uuid', name: 'event_id' })
    @Index()
    eventId: string;

    @Column({ type: 'varchar', name: 'name' })
    name: string;

    @Column({ type: 'varchar', name: 'description' })
    description: string;

    @Column({ type: 'decimal', name: 'price', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int', name: 'max_quantity' })
    maxQuantity: number;

    @Column({ type: 'int', name: 'sold', default: 0 })
    @Index()
    sold: number;

    @ManyToOne(() => Event, { onDelete : "CASCADE"})
    @JoinColumn({ name: 'event_id' })
    event: Event;

}

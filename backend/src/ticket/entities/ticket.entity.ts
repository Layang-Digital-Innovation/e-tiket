import { Column, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";

export enum TicketStatus{
    UNUSED = 'unused',
    REDEEMED = 'redeemed',
    CHECKED_IN = 'checked_in'
}


@Entity('ticket')
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column({ type: 'uuid', name: 'category_id' })
    categoryId: string;

    @Column({ type: 'varchar', name: 'ticket_code', unique: true })
    ticketCode : string

    @Column({ type: 'enum', name: 'status', enum: TicketStatus, default: TicketStatus.UNUSED })
    status: TicketStatus;

    @Column({type : 'uuid', name : "assigned_wristband_id", nullable : true})
    assignedWristbandId?: string;

    @Column({type : 'varchar', name : "attendee_name", nullable : true})
    attendeeName : string;

    @Column({type : "varchar", name: "atendee_email", nullable: true})
    atendeeEmail: string;

    @Column({type : 'varchar' , name: "atendee_phone_number", nullable: true})
    atendeePhoneNumber: string;


}

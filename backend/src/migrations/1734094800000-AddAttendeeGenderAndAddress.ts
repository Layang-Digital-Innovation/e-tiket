import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAttendeeGenderAndAddress1734094800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('attendees', [
      new TableColumn({
        name: 'gender',
        type: 'varchar',
        isNullable: true,
        comment: 'Jenis kelamin attendee',
      }),
      new TableColumn({
        name: 'address',
        type: 'text',
        isNullable: true,
        comment: 'Alamat lengkap attendee',
      }),
      new TableColumn({
        name: 'birth_date',
        type: 'date',
        isNullable: true,
        comment: 'Tanggal lahir attendee',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('attendees', ['gender', 'address', 'birth_date']);
  }
}

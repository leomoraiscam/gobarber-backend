import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterUpdatedAtFieldInAppointmentsTable1753736828271
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'appointments',
      'updated_at',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: null,
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'appointments',
      'updated_at',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamps',
        default: 'now()',
        isNullable: false,
      }),
    );
  }
}

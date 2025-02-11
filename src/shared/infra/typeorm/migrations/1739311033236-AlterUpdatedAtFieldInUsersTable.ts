import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterUpdatedAtFieldInUsersTable1739311033236
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users',
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
      'users',
      'updated_at',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()',
        isNullable: false,
      }),
    );
  }
}

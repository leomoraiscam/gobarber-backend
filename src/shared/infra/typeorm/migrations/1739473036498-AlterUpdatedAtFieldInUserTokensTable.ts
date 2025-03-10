import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterUpdatedAtFieldInUserTokensTable1739473036498
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'user_tokens',
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
      'user_tokens',
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

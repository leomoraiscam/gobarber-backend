import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDeletedAtInUserTokensTable1753826160242
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user_tokens',
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamp',
        isNullable: true,
        default: null,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user_tokens', 'deleted_at');
  }
}

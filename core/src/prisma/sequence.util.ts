import { PrismaService } from "./prisma.service";

export async function syncSerialSequence(
  prisma: PrismaService,
  tableName: string,
  columnName = "id",
) {
  await prisma.$executeRawUnsafe(`
    SELECT setval(
      pg_get_serial_sequence('"${tableName}"', '${columnName}'),
      COALESCE(MAX("${columnName}"), 1),
      MAX("${columnName}") IS NOT NULL
    )
    FROM "${tableName}";
  `);
}

export async function syncSerialSequences(
  prisma: PrismaService,
  tableNames: readonly string[],
  columnName = "id",
) {
  for (const tableName of tableNames) {
    await syncSerialSequence(prisma, tableName, columnName);
  }
}

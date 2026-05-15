SELECT setval(
  pg_get_serial_sequence('"user_type"', 'id'),
  COALESCE(MAX("id"), 1),
  MAX("id") IS NOT NULL
)
FROM "user_type";

SELECT setval(
  pg_get_serial_sequence('"role"', 'id'),
  COALESCE(MAX("id"), 1),
  MAX("id") IS NOT NULL
)
FROM "role";

SELECT setval(
  pg_get_serial_sequence('"plans"', 'id'),
  COALESCE(MAX("id"), 1),
  MAX("id") IS NOT NULL
)
FROM "plans";

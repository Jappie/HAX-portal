import { getTableConfig, type SQLiteTable } from 'drizzle-orm/sqlite-core';
import { getTableName, type Column } from 'drizzle-orm';
import {
  customers,
  contacts,
  addresses,
  notes,
  portalApps,
  users,
  sessions,
  accounts,
  verifications,
  roles,
  appPermissions,
  portalUsers,
  portalUserRoles,
} from './schema.ts';

// Every table in the database, keyed by model name. This record is the single
// source of truth for the seed DDL: the generated CREATE TABLE statements are
// derived from the Drizzle schema, so schema and database can never drift.
export const schemaTables: Record<string, SQLiteTable> = {
  customers,
  contacts,
  addresses,
  notes,
  portalApps,
  users,
  sessions,
  accounts,
  verifications,
  roles,
  appPermissions,
  portalUsers,
  portalUserRoles,
};

function columnSqlType(column: Column): string {
  if (column.columnType === 'SQLiteTimestamp' || column.columnType === 'SQLiteBoolean') {
    return 'INTEGER';
  }
  const dataType = column.dataType as string;
  if (dataType === 'number' || dataType === 'boolean' || dataType === 'date') {
    return 'INTEGER';
  }
  if (dataType === 'buffer') {
    return 'BLOB';
  }
  return 'TEXT';
}

function columnDefinition(column: Column): string {
  const name = column.name;
  const isAutoIncrement = column.columnType === 'SQLiteInteger' && Boolean((column as unknown as { autoIncrement?: boolean }).autoIncrement);
  const type = isAutoIncrement ? 'INTEGER' : columnSqlType(column);
  const parts = [name, type];
  if (isAutoIncrement) {
    parts.push('PRIMARY KEY AUTOINCREMENT');
  } else {
    if (column.primary) parts.push('PRIMARY KEY');
    if (column.notNull) parts.push('NOT NULL');
    if (column.isUnique) parts.push('UNIQUE');
    if (column.hasDefault) {
      const defaultValue = column.defaultFn ? column.defaultFn() : column.default;
      if (typeof defaultValue === 'boolean') {
        parts.push(`DEFAULT ${defaultValue ? 1 : 0}`);
      } else if (defaultValue !== undefined && defaultValue !== null) {
        const serialized = typeof defaultValue === 'string' ? `'${defaultValue}'` : String(defaultValue);
        parts.push(`DEFAULT ${serialized}`);
      }
    }
  }
  return parts.join(' ');
}

export function createTableSQL(table: SQLiteTable): string {
  const config = getTableConfig(table);
  const definitions = config.columns.map(columnDefinition);

  const compositePrimaryKeys = config.primaryKeys.flatMap((key) => key.columns);
  if (compositePrimaryKeys.length > 1) {
    definitions.push(`PRIMARY KEY (${compositePrimaryKeys.map((column) => column.name).join(', ')})`);
  }

  for (const foreignKey of config.foreignKeys) {
    const reference = foreignKey.reference();
    const fromColumns = reference.columns.map((column) => column.name).join(', ');
    const toTable = getTableName(reference.foreignTable);
    const toColumns = reference.foreignColumns.map((column) => column.name).join(', ');
    definitions.push(`FOREIGN KEY (${fromColumns}) REFERENCES ${toTable}(${toColumns})`);
  }

  return `CREATE TABLE IF NOT EXISTS ${config.name} (\n  ${definitions.join(',\n  ')}\n)`;
}

export function createTablesSQL(): string {
  return Object.values(schemaTables)
    .map((table) => createTableSQL(table) + ';')
    .join('\n\n');
}

// Children first so DELETEs and DROPs respect foreign keys during reseeding.
export function tablesInDeleteOrder(): SQLiteTable[] {
  return [notes, addresses, contacts, portalUserRoles, portalUsers, appPermissions, users, sessions, accounts, verifications, roles, customers, portalApps];
}

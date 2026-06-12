import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Маппинг ошибок БД в стабильные ключи для клиента.
 * Сырые сообщения Postgres не покидают сервер: детали — в server-логи (Sentry их подберёт).
 */
export function toClientError(error: PostgrestError): string {
  console.error('[db-error]', error.code, error.message)

  if (error.message.includes('ids_outside_scope')) return 'ids_outside_scope'
  if (error.message.includes('status_wrong_org')) return 'status_wrong_org'
  if (error.message.includes('status_not_found')) return 'status_not_found'
  if (error.message.includes('empty_list')) return 'empty_list'

  switch (error.code) {
    case '23505': return 'duplicate'          // unique violation
    case '23503': return 'invalid_reference'  // fk violation (кросс-org и битые id)
    case '23514': return 'invalid_value'      // check violation
    case '42501': return 'forbidden'          // insufficient privilege / RLS
    default: return 'server_error'
  }
}

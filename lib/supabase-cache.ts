import type { QueryClient } from "@tanstack/react-query"
import { createClient } from "@supabase/supabase-js"

export function invalidateSupabaseQueries(queryClient: QueryClient, tableName: string) {
  const queries = queryClient.getQueryCache().findAll({
    predicate: (query) => query.queryKey[0] === tableName,
  })
  queries.forEach((query) => queryClient.invalidateQueries({ queryKey: query.queryKey }))
}

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)


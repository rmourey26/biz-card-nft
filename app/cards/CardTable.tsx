"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { getCards, updateCard, deleteCard } from "../actions/cards"
import { invalidateSupabaseQueries } from "@/lib/supabase-cache"
import { Button } from "@/components/ui/button"

type Card = {
  id: string
  businesscard_name: string
  company_name: string
  created_at: string
}

const columnHelper = createColumnHelper<Card>()

const columns = [
  columnHelper.accessor("businesscard_name", {
    cell: (info) => info.getValue(),
    header: () => <span>Card Name</span>,
  }),
  columnHelper.accessor("company_name", {
    cell: (info) => info.getValue(),
    header: () => <span>Company</span>,
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    header: () => <span>Created At</span>,
  }),
  columnHelper.display({
    id: "actions",
    cell: (props) => (
      <div>
        <Button onClick={() => handleEdit(props.row.original)}>Edit</Button>
        <Button onClick={() => handleDelete(props.row.original.id)}>Delete</Button>
      </div>
    ),
  }),
]

function CardTable({ initialCards }: { initialCards: Card[] }) {
  const queryClient = useQueryClient()

  const { data: cards } = useQuery({
    queryKey: ["cards"],
    queryFn: getCards,
    initialData: initialCards,
  })

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string; data: Partial<Card> }) => updateCard(variables.id, variables.data),
    onSuccess: () => {
      invalidateSupabaseQueries(queryClient, "cards")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      invalidateSupabaseQueries(queryClient, "cards")
    },
  })

  const table = useReactTable({
    data: cards,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleEdit = (card: Card) => {
    // Implement edit functionality
    console.log("Edit card:", card)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CardTable


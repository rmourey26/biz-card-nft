import { Suspense } from "react"
import { getCards } from "../actions/cards"
import CardTable from "./CardTable"
import CardTableSkeleton from "./CardTableSkeleton"

export const revalidate = 0

export default async function CardsPage() {
  const cards = await getCards()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Your Business Cards</h1>
      <Suspense fallback={<CardTableSkeleton />}>
        <CardTable initialCards={cards} />
      </Suspense>
    </div>
  )
}


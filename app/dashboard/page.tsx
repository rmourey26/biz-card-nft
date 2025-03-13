import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessCardPreview } from "@/components/business-card-preview"
import { MintNFTButton } from "@/components/mint-nft-button"
import { DownloadPDFButton } from "@/components/download-pdf-button"
import { GenerateNewCardButton } from "@/components/generate-new-card-button"
import { ShareQRCodeButton } from "@/components/share-qr-code-button"
import { getBusinessCards } from "../actions/businessCard"
import { getProfile } from "../actions/profile"
import { Navbar } from "@/components/navbar"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getProfile(user.id)
  const cards = await getBusinessCards(user.id)

  // Fetch NFTs
  const { data: nfts, error: nftsError } = await supabase.from("nfts").select("*").eq("user_id", user.id)

  if (nftsError) {
    console.error("Error fetching NFTs:", nftsError)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Navbar showAuth={true} isLoggedIn={true} />

      <main className="flex-1 container py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Your Business Cards</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          <div>
            {cards && cards.length > 0 ? (
              <BusinessCardPreview
                card={{
                  ...cards[0],
                  user_id: user.id, // Ensure user_id is passed
                }}
                userData={{
                  full_name: profile.full_name,
                  company: profile.company,
                  job_title: profile.job_title,
                  email: profile.email,
                  website: profile.website,
                  linkedin_url: profile.linkedin_url,
                  avatar_url: profile.avatar_url,
                  company_logo_url: profile.company_logo_url,
                  xhandle: profile.xhandle,
                }}
                showEditor={true}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border rounded-lg">
                <p className="text-gray-500 mb-4">No business card created yet</p>
                <GenerateNewCardButton userId={user.id} />
              </div>
            )}

            {cards && cards.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-6">
                <MintNFTButton userId={user.id} cardId={cards[0].id} />
                <DownloadPDFButton cardId={cards[0].id} />
                <ShareQRCodeButton cardId={cards[0].id} />
                <GenerateNewCardButton userId={user.id} />
              </div>
            )}
          </div>

          <div>
            <Tabs defaultValue="cards" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cards">My Cards</TabsTrigger>
                <TabsTrigger value="nfts">My NFTs</TabsTrigger>
              </TabsList>
              <TabsContent value="cards" className="border rounded-lg p-4 mt-2">
                {cards && cards.length > 0 ? (
                  <div className="space-y-4">
                    {cards.map((card) => (
                      <Card key={card.id} className="cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <div
                              className="w-12 h-12 rounded mr-4"
                              style={{ backgroundColor: card.style?.primaryColor || "#3b82f6" }}
                            />
                            <div>
                              <h3 className="font-medium">{card.businesscard_name || "Business Card"}</h3>
                              <p className="text-sm text-gray-500">
                                Created: {new Date(card.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No business cards yet</p>
                    <GenerateNewCardButton userId={user.id} />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="nfts" className="border rounded-lg p-4 mt-2">
                {nfts && nfts.length > 0 ? (
                  <div className="space-y-4">
                    {nfts.map((nft) => (
                      <Card key={nft.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded mr-4 flex items-center justify-center bg-gray-100">
                              <svg
                                className="h-6 w-6 text-gray-500"
                                fill="none"
                                height="24"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                width="24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M19.5 12.572 12 17l-7.5-4.428V7.572L12 3l7.5 4.572v5" />
                                <path d="M12 17v4" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-medium">{nft.name}</h3>
                              <p className="text-sm text-gray-500">
                                <a
                                  href={`https://goerli.basescan.org/tx/${nft.tx_hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  View on BaseScan
                                </a>
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No NFTs minted yet</p>
                    {cards && cards.length > 0 && <MintNFTButton userId={user.id} cardId={cards[0].id} />}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}


import { getCampaigns } from "@/services/campaigns"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, PhoneIcon, ChevronRightIcon, PlusIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { PrimaryButton } from "@/components/custom/Buttons"
const Campaigns = () => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns
  })

  if (isLoading) return <div>Loading campaigns...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h2 className="text-3xl font-bold mb-6">Campaigns</h2>
        {
          /*
           <Link to={'/campaigns/create'}>
          <Button variant='default' className="flex gap-2">Create <PlusIcon /> </Button>
        </Link>
           * */
        }
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns?.data?.map((campaign: any) => (
          <Card key={campaign._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{campaign.name}</CardTitle>
                <Badge
                  variant={campaign.status === "draft" ? "outline" : "default"}
                  className="capitalize"
                >
                  {campaign.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Type:</span>
                  <span className="capitalize">{campaign.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Channel:</span>
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="h-4 w-4" />
                    <span className="capitalize">{campaign.channel}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-medium">Description:</span>
                  <span>{campaign.description}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t bg-muted/20 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>Starts: {campaign.start_date}</span>
              </div>
              <Link
                to="/campaigns/$campaignId"
                params={{ campaignId: campaign._id.toString() }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  View Details
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Campaigns

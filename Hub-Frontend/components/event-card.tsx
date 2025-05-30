import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"

interface EventCardProps {
  event: any;
  isAdmin?: boolean;
  onAction: (action: string) => void;
}

export function EventCard({ event, isAdmin = false, onAction }: EventCardProps) {
  if (!event) return null;

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={event.imageUrl || "/placeholder.svg"}
          alt={event.name}
          className="h-full w-full object-cover"
        />
      </div>

      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{event.name}</h3>
          <Badge variant="outline">{event.category}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{new Date(event.startDate).toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="outline"
          size="sm"
          className="caret-black"
          onClick={() => onAction('details')}
        >
          Details
        </Button>
        <Button 
          size="sm"
          onClick={() => onAction('rsvp')}
        >
          Register
        </Button>
      </CardFooter>
    </Card>
  );
}
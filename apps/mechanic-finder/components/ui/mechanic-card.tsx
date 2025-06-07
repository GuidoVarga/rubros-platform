import type { Business, Category, Location, City, Zone } from "@rubros/db/generated/prisma";
import Link from "next/link";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@rubros/ui";
import { Button } from "@rubros/ui";

interface MechanicCardProps {
  business: Business & {
    category: Category;
    location: Location & {
      city?: City | null;
      zone?: Zone | null;
    };
  };
}

export function MechanicCard({ business }: MechanicCardProps) {
  const location = business.location.city?.name || business.location.zone?.name;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{business.name}</CardTitle>
        <CardDescription>{business.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
        {business.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{business.phone}</span>
          </div>
        )}
        {business.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="break-words w-full">{business.email}</span>
          </div>
        )}
        {business.website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="break-words w-full">{business.website}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/mechanic/${business.slug}`} className="w-full">
          <Button variant="secondary" className="w-full">Ver más</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
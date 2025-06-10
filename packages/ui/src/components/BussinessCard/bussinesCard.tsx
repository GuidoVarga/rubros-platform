import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Card";
import { BussinessCardProps } from "./types";

export function BussinessCard({ name, description, location, phone, email, website, footerButton }: BussinessCardProps) {

  return (
    <Card className="flex flex-col w-full h-full">
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {location && (
          <div className="flex items-center gap-2">
            <div>
              <MapPin className="h-4 w-4" />
            </div>
            <span className="break-words min-w-0">{location}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2">
            <div>
              <Phone className="h-4 w-4" />
            </div>
            <span className="break-words min-w-0">{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2">
            <div>
              <Mail className="h-4 w-4" />
            </div>
            <span className="break-words min-w-0">{email}</span>
          </div>
        )}
        {website && (
          <div className="flex items-center gap-2">
            <div>
              <Globe className="h-4 w-4" />
            </div>
            <span className="break-words min-w-0">{website}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto">
        {footerButton}
      </CardFooter>
    </Card>
  );
}
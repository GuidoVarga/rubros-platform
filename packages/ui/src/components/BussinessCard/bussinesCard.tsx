'use server';

import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Card";
import { BussinessCardProps } from "./types";

export function BussinessCard({ name, description, location, phone, email, website, footerButton }: BussinessCardProps) {

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{phone}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="break-words w-full">{email}</span>
          </div>
        )}
        {website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="break-words w-full">{website}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {footerButton}
      </CardFooter>
    </Card>
  );
}
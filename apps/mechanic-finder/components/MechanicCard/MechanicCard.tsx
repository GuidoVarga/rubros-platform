import { BussinessCard, Button } from "@rubros/ui";
import { BusinessEntity } from "@rubros/db/entities";
import Link from "next/link";
import { getOpenDays, HourEntry, isOpenNow, useGeolocation, calculateDistance, formatDistance } from "@rubros/ui/utils";

type MechanicCardProps = {
  business: BusinessEntity;
  href: string;
}

export const MechanicCard = ({ business, href }: MechanicCardProps) => {
  const { name, description, city, phone, email, openingHours, closedOn, website, hours, address, latitude, longitude } = business;

  console.log('business ', business);

  const openingDays = getOpenDays(closedOn, openingHours, hours as HourEntry[]);
  const isOpen = isOpenNow(hours as HourEntry[]);

  return (
    <BussinessCard
      name={name}
      description={description}
      address={address}
      phone={phone}
      email={email}
      website={website}
      openDays={openingDays}
      isOpen={isOpen}
      latitude={latitude}
      longitude={longitude}
      footerButton={(
        <>
          <Link href={href} className="w-full">
            <Button variant="primary" className="w-full">Ver más</Button>
          </Link>
        </>
      )}
    />
  );
}
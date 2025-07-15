import { BussinessCard, Button } from "@rubros/ui";
import { BusinessEntity } from "@rubros/db/entities";
import Link from "next/link";
import { getOpenDays, HourEntry, isOpenNow, useGeolocation, calculateDistance, formatDistance } from "@rubros/ui/utils";

type MechanicCardProps = {
  business: BusinessEntity & { distance?: number | null };
  href: string;
}

export const MechanicCard = ({ business, href }: MechanicCardProps) => {
  const { name, description, phone, email, openingHours, closedOn, website, hours, address, latitude, longitude, distance } = business;
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
      distance={distance ? +distance.toFixed(1) : null}
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
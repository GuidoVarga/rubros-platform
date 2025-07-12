import { BussinessCard, Button } from "@rubros/ui";
import { BusinessEntity } from "@rubros/db/entities";
import Link from "next/link";
import { getOpenDays, HourEntry } from "@rubros/ui/utils";

type MechanicCardProps = {
  business: BusinessEntity;
  href: string;
}

export const MechanicCard = ({ business, href }: MechanicCardProps) => {
  const { name, description, city, phone, email, openingHours, closedOn, website, hours, address } = business;

  const openingDays = getOpenDays(closedOn, openingHours, hours as HourEntry[])

  console.log('openingDays ', openingDays);

  return (
    <BussinessCard
      name={name}
      description={description}
      address={address}
      phone={phone}
      email={email}
      website={website}
      openDays={openingDays}
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
import { BussinessCard, Button } from "@rubros/ui";
import { BusinessEntity } from "@rubros/db/entities";
import Link from "next/link";
import { getOpenDays, HourEntry } from "@rubros/ui/utils";

type MechanicCardProps = {
  business: BusinessEntity;
  href: string;
}

export const MechanicCard = ({ business, href }: MechanicCardProps) => {
  const { name, description, city, phone, email, openingHours, closedOn, website, hours } = business;

  const openingDays = getOpenDays(closedOn, openingHours, hours as HourEntry[])

  return (
    <BussinessCard
      name={name}
      description={description}
      location={city?.name}
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
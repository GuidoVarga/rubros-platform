import { BussinessCard, Button } from "@rubros/ui";
import { DAYS_OF_WEEK } from "@rubros/ui/constants";
import { BusinessEntity } from "@rubros/db/entities";
import Link from "next/link";
import { clearAccents, getOpenDays } from "@rubros/ui/utils";

type MechanicCardProps = {
  business: BusinessEntity;
  href: string;
}

export const MechanicCard = ({ business, href }: MechanicCardProps) => {
  const { name, description, city, phone, email, openingHours, closedOn, website } = business;

  const openDays = getOpenDays(closedOn);

  return (
    <BussinessCard
      name={name}
      description={description}
      location={city?.name}
      phone={phone}
      email={email}
      website={website}
      openingHours={openingHours}
      openDays={openDays}
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
import { BussinessCard, Button } from "@rubros/ui";
import { BusinessEntity } from "@rubros/db/entities";
import { getLocationName } from "@rubros/db/utils";
import Link from "next/link";

type MechanicCardProps = {
  business: BusinessEntity;
  href: string;
}

export const MechanicCard = ({ business, href }: MechanicCardProps) => {
  const { name, description, location, phone, email, website } = business;
  return (
    <BussinessCard
      name={name}
      description={description}
      location={getLocationName(location)}
      phone={phone}
      email={email}
      website={website}
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
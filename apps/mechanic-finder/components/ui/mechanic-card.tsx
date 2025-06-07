import { redirect } from "next/navigation";
import { BussinessCard, BussinessCardProps } from "@rubros/ui";
import { BusinessEntity } from "@rubros/db/entities";
import { getLocationName } from "@rubros/db/utils";

type MechanicCardProps = {
  business: BusinessEntity;
  footerButton: React.ReactNode;
}

export const MechanicCard = ({ business, footerButton }: MechanicCardProps) => {
  const { name, description, location, phone, email, website } = business;
  return (
    <BussinessCard
      name={name}
      description={description}
      location={getLocationName(location)}
      phone={phone}
      email={email}
      website={website}
      footerButton={footerButton}
    />
  );
}
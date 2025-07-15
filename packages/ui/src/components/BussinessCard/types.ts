export type BussinessCardProps = {
  name: string | null;
  description: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  footerButton: React.ReactNode;
  openingHours?: string | null;
  openDays?: string[] | null;
  address: string | null;
  isOpen?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number | null;
};

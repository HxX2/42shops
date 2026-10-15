export type Campus = {
  id: number;
  name: string;
  country: string;
  city: string;
  usersCount: number;
  timeZone: string | null;
  website: string | null;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number | null;
  beginAt: string | null;
  endAt: string | null;
  createdAt: string | null;
  slug: string | null;
  image: string | null;
  isUnique: boolean;
  oneTimePurchase: boolean;
};

export type ProductStatus = "available" | "soldout" | "upcoming" | "ended";

export type CountryGroup = {
  country: string;
  code: string;
  campuses: Campus[];
};

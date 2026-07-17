import { api } from "@/shared/api/axios";
import type { DonationItem } from "../model/types";

export const donationItemApi = {
  getByFacility: (facilityId: number) =>
    api
      .get<DonationItem[]>(`/api/facilities/${facilityId}/items`)
      .then((r) => r.data),
  getById: (id: number) =>
    api.get<DonationItem>(`/api/donation-items/${id}`).then((r) => r.data),
};

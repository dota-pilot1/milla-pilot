import { apiRequest } from "../../../shared/api/client";
import type {
  DonationItem,
  CreateDonationItemInput,
  UpdateDonationItemInput,
} from "../../../entities/donation-item/model/types";

export function fetchFacilityItems(facilityId: number) {
  return apiRequest<DonationItem[]>(`/api/facilities/${facilityId}/items`);
}

export function createDonationItem(token: string, body: CreateDonationItemInput) {
  return apiRequest<DonationItem>("/api/donation-items", { method: "POST", token, body });
}

export function updateDonationItem(token: string, id: number, body: UpdateDonationItemInput) {
  return apiRequest<DonationItem>(`/api/donation-items/${id}`, { method: "PATCH", token, body });
}

export function deleteDonationItem(token: string, id: number) {
  return apiRequest<void>(`/api/donation-items/${id}`, { method: "DELETE", token });
}

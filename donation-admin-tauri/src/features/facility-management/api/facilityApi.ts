import { apiRequest } from "../../../shared/api/client";
import type {
  Facility,
  CreateFacilityInput,
  UpdateFacilityInput,
} from "../../../entities/facility/model/types";

export function fetchFacilities() {
  return apiRequest<Facility[]>("/api/facilities");
}

export function fetchFacility(id: number) {
  return apiRequest<Facility>(`/api/facilities/${id}`);
}

export function createFacility(token: string, body: CreateFacilityInput) {
  return apiRequest<Facility>("/api/facilities", { method: "POST", token, body });
}

export function updateFacility(token: string, id: number, body: UpdateFacilityInput) {
  return apiRequest<Facility>(`/api/facilities/${id}`, { method: "PATCH", token, body });
}

export function deleteFacility(token: string, id: number) {
  return apiRequest<void>(`/api/facilities/${id}`, { method: "DELETE", token });
}

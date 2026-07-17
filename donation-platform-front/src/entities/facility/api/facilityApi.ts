import { api } from "@/shared/api/axios";
import type { Facility } from "../model/types";

export const facilityApi = {
  getAll: () => api.get<Facility[]>("/api/facilities").then((r) => r.data),
  getById: (id: number) =>
    api.get<Facility>(`/api/facilities/${id}`).then((r) => r.data),
};

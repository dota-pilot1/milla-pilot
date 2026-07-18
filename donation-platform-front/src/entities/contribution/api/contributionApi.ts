import { api } from "@/shared/api/axios";
import type { MyContribution } from "../model/types";

export interface CreateContributionBody {
  donationItemId: number;
  amount: number;
}

export const contributionApi = {
  create: (body: CreateContributionBody) =>
    api.post("/api/contributions", body).then((r) => r.data),
  getMine: () =>
    api.get<MyContribution[]>("/api/contributions/me").then((r) => r.data),
};

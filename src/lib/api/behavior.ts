import { apiFetch } from "./config";
import type { ApiResponse, PaginatedResponse } from "./types";
import type {
  BehaviorViolation,
  GetViolationsResponse,
  CreateViolationRequest,
  PositiveBehavior,
  CreatePositiveBehaviorRequest,
} from "./types";

interface GetViolationsParams {
  page?: number;
  limit?: number;
  severity?: "low" | "medium" | "high";
  status?: "pending" | "resolved";
  isChildProtectionCase?: boolean;
}

export const behaviorApi = {
  // GET /behavior/violations
  getViolations: async (
    params: GetViolationsParams = {}
  ): Promise<ApiResponse<GetViolationsResponse>> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.severity) searchParams.append("severity", params.severity);
    if (params.status) searchParams.append("status", params.status);
    if (params.isChildProtectionCase !== undefined) {
      searchParams.append("isChildProtectionCase", params.isChildProtectionCase.toString());
    }

    const query = searchParams.toString();

    return apiFetch<ApiResponse<GetViolationsResponse>>(
      `/behavior/violations${query ? `?${query}` : ""}`
    );
  },

  // POST /behavior/violations
  createViolation: async (
    data: CreateViolationRequest
  ): Promise<ApiResponse<BehaviorViolation>> => {
    return apiFetch(`/behavior/create-violations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // GET /behavior/positive
  getPositiveBehaviors: async (): Promise<
    ApiResponse<PositiveBehavior[]>
  > => {
    return apiFetch<ApiResponse<PositiveBehavior[]>>(
      `/behavior/positive`
    );
  },

  // POST /behavior/positive
  createPositiveBehavior: async (
    data: CreatePositiveBehaviorRequest
  ): Promise<ApiResponse<PositiveBehavior>> => {
    return apiFetch(`/behavior/create-positive`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

import type {
  AdminAuthToken,
  AdminUser,
  AuthToken,
  District,
  Kyc,
  KycStatus,
  LoanApplication,
  LoanStatus,
  Municipality,
  Notification,
  Passbook,
  PassbookTransaction,
  Province,
  User,
} from "../types/sahakari";

const url = (baseUrl: string, path: string) => `${baseUrl}/v1${path}`;

const fetch_ = async (input: RequestInfo, init?: RequestInit) => {
  const hasBody = init?.body !== undefined && init.body !== null;
  const res = await fetch(input, {
    ...init,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Request failed");
  }
  return res.json();
};

export function createAuthApi(baseUrl: string) {
  return {
    register: async (data: {
      phone: string;
      fullName: string;
      cooperative: string;
      passbookNumber: string;
      password: string;
    }): Promise<AuthToken> => {
      return fetch_(url(baseUrl, "/auth/register"), {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    login: async (data: {
      phone: string;
      password: string;
    }): Promise<AuthToken> => {
      return fetch_(url(baseUrl, "/auth/login"), {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    me: async (token: string): Promise<User> => {
      return fetch_(url(baseUrl, "/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
    },

    adminSendOtp: async (email: string): Promise<{ message: string }> => {
      return fetch_(url(baseUrl, "/auth/admin/send-otp"), {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },

    adminVerifyOtp: async (data: {
      email: string;
      otp: string;
    }): Promise<AdminAuthToken> => {
      return fetch_(url(baseUrl, "/auth/admin/verify-otp"), {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    adminMe: async (token: string): Promise<AdminUser> => {
      return fetch_(url(baseUrl, "/auth/admin/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  };
}

export function createGeoApi(baseUrl: string) {
  return {
    getProvinces: async (): Promise<Province[]> => {
      return fetch_(url(baseUrl, "/geo/provinces"));
    },
    getDistricts: async (provinceId?: string): Promise<District[]> => {
      const qs = provinceId ? `?provinceId=${provinceId}` : "";
      return fetch_(url(baseUrl, `/geo/districts${qs}`));
    },
    getMunicipalities: async (districtId?: string): Promise<Municipality[]> => {
      const qs = districtId ? `?districtId=${districtId}` : "";
      return fetch_(url(baseUrl, `/geo/municipalities${qs}`));
    },
  };
}

export function createKycApi(baseUrl: string) {
  const headers = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  return {
    getMine: async (token: string): Promise<Kyc | null> => {
      const res = await fetch(url(baseUrl, "/kyc/me"), {
        headers: headers(token),
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message ?? "Request failed");
      }
      return res.json();
    },

    create: async (token: string): Promise<Kyc> => {
      return fetch_(url(baseUrl, "/kyc"), {
        method: "POST",
        headers: headers(token),
      });
    },

    updateBasicInfo: async (
      token: string,
      id: string,
      data: Partial<Kyc>,
    ): Promise<Kyc> => {
      return fetch_(url(baseUrl, `/kyc/${id}/basic-info`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    updateMandatory: async (
      token: string,
      id: string,
      data: Partial<Kyc>,
    ): Promise<Kyc> => {
      return fetch_(url(baseUrl, `/kyc/${id}/mandatory`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    updateNominee: async (
      token: string,
      id: string,
      data: Partial<Kyc>,
    ): Promise<Kyc> => {
      return fetch_(url(baseUrl, `/kyc/${id}/nominee`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    updateSignature: async (
      token: string,
      id: string,
      data: Partial<Kyc>,
    ): Promise<Kyc> => {
      return fetch_(url(baseUrl, `/kyc/${id}/signature`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    submit: async (token: string, id: string): Promise<Kyc> => {
      return fetch_(url(baseUrl, `/kyc/${id}/submit`), {
        method: "POST",
        headers: headers(token),
      });
    },

    listAdmin: async (
      token: string,
      params?: { status?: KycStatus; page?: number; limit?: number },
    ): Promise<{ data: Kyc[]; total: number }> => {
      const ps = new URLSearchParams();
      if (params?.status) ps.set("status", params.status);
      if (params?.page) ps.set("page", String(params.page));
      if (params?.limit) ps.set("limit", String(params.limit));
      const qs = ps.toString() ? `?${ps.toString()}` : "";
      return fetch_(url(baseUrl, `/kyc${qs}`), { headers: headers(token) });
    },

    getById: async (token: string, id: string): Promise<Kyc> => {
      return fetch_(url(baseUrl, `/kyc/${id}`), { headers: headers(token) });
    },

    review: async (
      token: string,
      id: string,
      data: { action: "APPROVED" | "REJECTED"; reason?: string },
    ): Promise<Kyc> => {
      return fetch_(url(baseUrl, `/kyc/${id}/review`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },
  };
}

export function createLoanApi(baseUrl: string) {
  const headers = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  return {
    listMine: async (token: string): Promise<LoanApplication[]> => {
      return fetch_(url(baseUrl, "/loans/me"), { headers: headers(token) });
    },

    create: async (token: string): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, "/loans"), {
        method: "POST",
        headers: headers(token),
      });
    },

    updatePersonalInfo: async (
      token: string,
      id: string,
      data: Partial<LoanApplication>,
    ): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, `/loans/${id}/personal-info`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    updateLoanDetails: async (
      token: string,
      id: string,
      data: Partial<LoanApplication>,
    ): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, `/loans/${id}/loan-details`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    updateAddress: async (
      token: string,
      id: string,
      data: Partial<LoanApplication>,
    ): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, `/loans/${id}/address`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    updateTermsGuarantor: async (
      token: string,
      id: string,
      data: Partial<LoanApplication>,
    ): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, `/loans/${id}/terms-guarantor`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    updateDocuments: async (
      token: string,
      id: string,
      data: Partial<LoanApplication>,
    ): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, `/loans/${id}/documents`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },

    submit: async (token: string, id: string): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, `/loans/${id}/submit`), {
        method: "POST",
        headers: headers(token),
      });
    },

    listAdmin: async (
      token: string,
      params?: { status?: LoanStatus; page?: number; limit?: number },
    ): Promise<{ data: LoanApplication[]; total: number }> => {
      const ps = new URLSearchParams();
      if (params?.status) ps.set("status", params.status);
      if (params?.page) ps.set("page", String(params.page));
      if (params?.limit) ps.set("limit", String(params.limit));
      const qs = ps.toString() ? `?${ps.toString()}` : "";
      return fetch_(url(baseUrl, `/loans${qs}`), { headers: headers(token) });
    },

    getById: async (token: string, id: string): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, `/loans/${id}`), { headers: headers(token) });
    },

    review: async (
      token: string,
      id: string,
      data: { action: "APPROVED" | "REJECTED"; reason?: string },
    ): Promise<LoanApplication> => {
      return fetch_(url(baseUrl, `/loans/${id}/review`), {
        method: "PATCH",
        headers: headers(token),
        body: JSON.stringify(data),
      });
    },
  };
}

export function createNotificationApi(baseUrl: string) {
  const headers = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  return {
    list: async (token: string): Promise<Notification[]> => {
      return fetch_(url(baseUrl, "/notifications"), {
        headers: headers(token),
      });
    },
    markRead: async (token: string, id: string): Promise<Notification> => {
      return fetch_(url(baseUrl, `/notifications/${id}/read`), {
        method: "PATCH",
        headers: headers(token),
      });
    },
  };
}

export function createPassbookApi(baseUrl: string) {
  const headers = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  return {
    getMine: async (token: string): Promise<Passbook | null> => {
      const res = await fetch(url(baseUrl, "/passbook/me"), {
        headers: headers(token),
      });
      if (res.status === 404) return null;
      return fetch_(url(baseUrl, "/passbook/me"), { headers: headers(token) });
    },
    getTransactions: async (token: string): Promise<PassbookTransaction[]> => {
      return fetch_(url(baseUrl, "/passbook/me/transactions"), {
        headers: headers(token),
      });
    },
  };
}

export function createUploadApi(baseUrl: string) {
  const headers = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  return {
    upload: async (token: string, file: File): Promise<{ url: string }> => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(url(baseUrl, "/upload"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
  };
}

export type {
  Province,
  District,
  Municipality,
  User,
  Kyc,
  LoanApplication,
  Notification,
  Passbook,
  PassbookTransaction,
  AdminUser,
  AuthToken,
  AdminAuthToken,
};

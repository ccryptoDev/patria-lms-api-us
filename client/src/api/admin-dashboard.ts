import axios, { AxiosResponse } from "axios";

import { getRequester } from "./requester";
import { TableRequestEvent } from "../types/tables";
import baseUrl from "../../app.config";
import { getUserToken } from "@/user-application/authentication/helpers";

class AdminDashboardRequests {
  async getLoans({
    search,
    perPage,
    page,
    status,
    source,
    type,
  }: TableRequestEvent): Promise<AxiosResponse<any>> {
    const requestParams: {
      status: string | string[];
      perPage: number;
      page: number;
      search?: string;
      source?: string;
      type?: string;
    } = { perPage, page, status };
    if (search) {
      requestParams.search = search;
    }
    if (source) {
      requestParams.source = source;
    }

    if (type) {
      requestParams.type = type;
    }

    const response = await getRequester().get(`/api/admin/dashboard/loans`, {
      params: requestParams,
    });
    return response;
  }

  async getTotalRowsByStatus(): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      "/api/admin/dashboard/loans/counters"
    );

    return response;
  }

  async getUsers({
    search,
    page,
  }: TableRequestEvent): Promise<AxiosResponse<any>> {
    const requestParams: {
      page: number;
      search?: string;
    } = { page };
    if (search) {
      requestParams.search = search;
    }

    const response = await getRequester().get("/api/admin/dashboard/users", {
      params: { page, search },
    });

    return response;
  }

  async getUser(userId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/users/${userId}`
    );

    return response;
  }

  async getUserName(): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(`/api/admin/dashboard/users`);

    return response;
  }

  async adminSaveEFTA(requestBody: {
    userId: string;
    applicationReference: string;
    cardCode: string;
    cardHolder: string;
    cardIssuer: string;
    cardNumber: string;
    city: string;
    expirationMonth: string;
    expirationYear: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    selectedOffer: Record<string, any>;
    selectedState: string;
    signature: string;
    street: string;
    zipCode: string;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/efta`,
      requestBody
    );
    return response;
  }

  async getApplication(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/application/info/${screenTrackingId}`
    );

    return response;
  }

  async removeCardOrAchAccount(context: {
    screenTrackingId: string, paymentType: string,
    paymentId: string,
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/remove-accounts`, context
    );

    return response;
  }

  async updateUserData(context: any): Promise<AxiosResponse<any>> {
    const response = await getRequester().put(
      `/api/admin/dashboard/loans/userInfo`, context
    );
    return response;
  }

  async getCreditReport(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/creditReport/${screenTrackingId}`
    );

    return response;
  }

  async getClarityReport(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/application/clarity/${screenTrackingId}`
    );

    return response;
  }

  async resignEFTA(
    screentrackingId: string,
    cardToken: string
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/resignEFTA/${screentrackingId}/${cardToken}`
    );
    return response;
  }

  async getPaymentManagement(
    screenTrackingId: string
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `api/admin/dashboard/loans/paymentSchedule/${screenTrackingId}`
    );

    return response;
  }

  async getPaymentPreview(
    screenTrackingId: string,
    params?: Record<string, any>
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `api/admin/dashboard/loans/previewPayment/${screenTrackingId}`,
      { params }
    );

    return response;
  }

  async getUserCards(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `api/admin/dashboard/users/cards/${screenTrackingId}`
    );

    return response;
  }

  async updateUserCard(paymentMethodToken: string) {
    await getRequester().patch(
      `api/admin/dashboard/users/cards/${paymentMethodToken}`
    );
  }

  async submitPayment(
    screenTrackingId: string,
    data: { paymentMethodToken: string; amount: number; paymentDate: Date }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `api/admin/dashboard/loans/submitPayment/${screenTrackingId}`,
      data
    );

    return response;
  }

  async amendPayment(
    screenTrackingId: string,
    data: { paymentMethodToken: string; amount: number; paymentDate: Date }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `api/admin/dashboard/loans/amendPayment/${screenTrackingId}`,
      data
    );

    return response;
  }

  async promisetoPay(data: {
    paymentId: string;
    isRemovingSchedule: boolean;
    promiseScheduleDate: string;
    promiseScheduleTime: string;
    promiseDescription: string;
    promisedPayAmount: number;
    promiseScheduleStatus: string;
    customerContacted: boolean;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `api/admin/dashboard/loans/promisetopay/${data.paymentId}`,
      data
    );

    return response;
  }

  async updatePromisetopay(data: {
    paymentId: string;
    promiseScheduleDate: string;
    newPromiseDate: string;
    promisedPayAmount: number;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `api/admin/dashboard/loans/promisetopay/update/${data.paymentId}`,
      data
    );
    return response;
  }

  async changeStatusPromisetopay(data: {
    paymentId: string;
    promiseScheduleDate: string;
    promiseScheduleStatus: string;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `api/admin/dashboard/loans/promisetopay/changestatus/${data.paymentId}`,
      data
    );
    return response;
  }

  async changePaymentAmount(
    screenTrackingId: string,
    data: { amount: number }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().patch(
      `api/admin/dashboard/loans/changePaymentAmount/${screenTrackingId}`,
      data
    );

    return response;
  }

  async changePromoAmount(
    screenTrackingId: string,
    data: { amount: number }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().patch(
      `api/admin/dashboard/loans/changePromoAmount/${screenTrackingId}`,
      data
    );

    return response;
  }

  async checkPromoAmount(
    screenTrackingId: string,
    data: { amount: number }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().patch(
      `api/admin/dashboard/loans/checkPromoAmount/${screenTrackingId}`,
      data
    );

    return response;
  }

  async listUserBanks(
    screenTrackingId: string
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `api/admin/dashboard/users/bank-accounts/${screenTrackingId}`
    );

    return response;
  }

  async addBank(
    screenTrackingId: string,
    data: {
      bankName: string;
      accountHolder: string;
      routingNumber: string;
      accountNumber: string;
    }
  ) {
    const response = await getRequester().post(
      `api/admin/dashboard/users/bank-accounts/${screenTrackingId}`,
      data
    );

    return response;
  }

  async addCard(
    screenTrackingId: string,
    data: {
      billingAddress1: string;
      billingCity: string;
      billingFirstName: string;
      billingLastName: string;
      billingState: string;
      billingZip: string;
      cardCode: string;
      cardNumber: string;
      expMonth: string;
      expYear: string;
      isDefaultCard: boolean;
    }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `api/admin/dashboard/users/cards/${screenTrackingId}`,
      data
    );

    return response;
  }

  async getAdmins({
    search,
    page,
  }: TableRequestEvent): Promise<AxiosResponse<any>> {
    const requestParams: {
      page: number;
      search?: string;
    } = { page };
    if (search) {
      requestParams.search = search;
    }

    const response = await getRequester().get("/api/admin/dashboard/admins", {
      params: { page, search },
    });

    return response;
  }

  async getLocations(): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      "/api/admin/dashboard/practiceManagements/locations"
    );

    return response;
  }

  async getRoles(): Promise<AxiosResponse<any>> {
    const response = await getRequester().get("/api/admin/roles");

    return response;
  }

  async addAdmin(data: {
    email: string;
    phoneNumber: string;
    practiceManagement: string;
    role: string;
    userName: string;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      "/api/admin/dashboard/admins",
      data
    );

    return response;
  }

  async getAdminById(id: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/admins/${id}`
    );

    return response;
  }

  async getAdmin(): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(`/api/admin/dashboard/admins`);

    return response;
  }
  async updateManualReviewed(payload: any): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(`/api/admin/dashboard/loan-status`, payload);
    return response;
  }

  async updateAdminById(
    id: string,
    data?: {
      email?: string;
      phoneNumber?: string;
      practiceManagement?: string;
      role?: string;
      userName?: string;
    }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().patch(
      `/api/admin/dashboard/admins/${id}`,
      data
    );

    return response;
  }

  async getUserDocuments(
    screenTrackingId: string
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/users/documents/${screenTrackingId}`
    );
    return response;
  }

  async getUserConsents(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/users/consents/${screenTrackingId}`
    );

    return response;
  }

  async uploadDocument(
    screenTrackingId: string,
    data: {
      documentType: "drivers license" | "passport";
      passport?: string;
      driversLicenseFront?: string;
      driversLicenseBack?: string;
    }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/users/documents/${screenTrackingId}`,
      data
    );

    return response;
  }

  async userUploadDocument(
    screenTrackingId: string,
    data: {
      documentType: "drivers license" | "passport" | "paystub" | "other" | "proofOfResidence";
      passport?: string;
      driversLicenseFront?: string;
      driversLicenseBack?: string;
      paystub?: string;
      proofOfResidence?: string;
      otherDoc?: string;
    }
  ): Promise<AxiosResponse<any>> {
    const response = await axios.post(`${baseUrl}/api/application/uploadDocument`, data, {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    });
    return response;
  }

  async getAllPracticeManagements({
    search,
    page,
  }: TableRequestEvent): Promise<AxiosResponse<any>> {
    const requestParams: {
      page: number;
      search?: string;
    } = { page };
    if (search) {
      requestParams.search = search;
    }

    const response = await getRequester().get(
      "/api/admin/dashboard/practiceManagements",
      {
        params: { page, search },
      }
    );

    return response;
  }

  async addPracticeManagement(data: {
    address: string;
    city: string;
    location: string;
    managementRegion: string;
    openDate: string;
    phone: string;
    region: string;
    regionalManager: string;
    stateCode: string;
    zip: string;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      "/api/admin/dashboard/practiceManagements",
      data
    );

    return response;
  }

  async getPracticeManagementById(id: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/practiceManagements/${id}`
    );

    return response;
  }

  async updatePracticeManagementById(
    id: string,
    data?: {
      address?: string;
      city?: string;
      location?: string;
      managementRegion?: string;
      openDate?: string;
      phone?: string;
      region?: string;
      regionalManager?: string;
      stateCode?: string;
      zip?: string;
    }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().patch(
      `/api/admin/dashboard/practiceManagements/${id}`,
      data
    );

    return response;
  }

  async changePassword(
    existingPassword: string,
    newPassword: string
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().patch(`/api/admin/changePassword`, {
      existingPassword,
      newPassword,
    });

    return response;
  }

  async sendApplicationLink(requestBody: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    practiceManagement: string;
    sendEmail?: boolean;
    sendSms?: boolean;
    source: "web" | "lead-list";
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `${baseUrl}/api/admin/dashboard/application/link`,
      requestBody
    );

    return response;
  }

  async forgotPassword(email: string): Promise<AxiosResponse<any>> {
    const response = await axios.patch(`${baseUrl}/api/admin/forgotPassword`, {
      email,
    });

    return response;
  }

  async getAllLogActivities({
    search,
    page,
  }: TableRequestEvent): Promise<AxiosResponse<any>> {
    const requestParams: {
      page: number;
      search?: string;
    } = { page };
    if (search) requestParams.search = search;

    const response = await getRequester().get(
      "/api/admin/dashboard/logActivities",
      {
        params: { page, search },
      }
    );
    return response;
  }

  async getAllLogActivitiesByScreenTrackingId(
    screenTrackingId: string,
    { search, page }: TableRequestEvent
  ): Promise<AxiosResponse<any>> {
    const requestParams: {
      page: number;
      search?: string;
    } = { page };
    if (search) requestParams.search = search;

    const response = await getRequester().get(
      `/api/admin/dashboard/logActivities/user/${screenTrackingId}`,
      {
        params: { page, search },
      }
    );
    return response;
  }

  async getCommunicationHistoryLogActivity(
    screenTrackingId: string,
    { search, page }: TableRequestEvent
  ): Promise<AxiosResponse<any>> {
    const requestParams: {
      page: number;
      search?: string;
    } = { page };
    if (search) requestParams.search = search;

    const response = await getRequester().get(
      `/api/admin/dashboard/logActivities/user/communicationHistory/${screenTrackingId}`,
      {
        params: { page, search },
      }
    );
    return response;
  }

  async getRulesDetailsByScreenTrackingId(
    screenTrackingId: string,
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/application/ruleDetails/${screenTrackingId}`,
    );
    return response;
  }


  async addCommunicationHistory(
    screenTrackingId: string,
    requestBody: { method: string; summary: string; email: null | string; cellPhone: null | number }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/logActivities/user/communicationHistory/${screenTrackingId}`,
      requestBody
    );

    return response;
  }

  async getLogActivityById(id: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      `/api/admin/dashboard/logActivities/${id}`
    );

    return response;
  }

  async createLogActivity(requestBody: {
    moduleName: string;
    message: string;
    data?: any;
    loanReference?: string;
    paymentManagementId?: string;
    screenTrackingId?: string;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      "/api/admin/dashboard/logActivities",
      requestBody
    );

    return response;
  }

  async getAllCommentsByScreenTrackingId(
    screenTrackingId: string,
    { search, page }: TableRequestEvent
  ): Promise<AxiosResponse<any>> {
    const requestParams: {
      page: number;
      search?: string;
    } = { page };
    if (search) requestParams.search = search;

    const response = await getRequester().get(
      `/api/admin/dashboard/comments/${screenTrackingId}`,
      {
        params: { page, search },
      }
    );
    return response;
  }

  async addComment(
    screenTrackingId: string,
    requestBody: { subject: string; comment: string }
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/comments/${screenTrackingId}`,
      requestBody
    );

    return response;
  }

  async validateCard(requestBody: {
    cardCode: string;
    cardNumber: string;
    expMonth: string;
    expYear: string;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      "/api/validateCard",
      requestBody
    );

    return response;
  }

  async toggleAutopay(
    paymentManagementId: string
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().patch(
      `/api/admin/dashboard/loans/toggleAutopay/${paymentManagementId}`
    );
    return response;
  }

  async getLoanSettings(): Promise<AxiosResponse<any>> {
    const response = await getRequester().get(
      "/api/admin/dashboard/loans/settings"
    );
    return response;
  }

  async updateLoanSettings(requestBody: {
    lateFee: number;
    nsfFee: number;
    lateFeeGracePeriod: number;
    delinquencyPeriod: number;
  }): Promise<AxiosResponse<any>> {
    const response = await getRequester().patch(
      "/api/admin/dashboard/loans/settings",
      requestBody
    );
    return response;
  }

  async forgivePayment(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/loans/forgivePayment/${screenTrackingId}`
    );

    return response;
  }

  async forgiveLatefee(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/loans/forgiveLatefee/${screenTrackingId}`
    );

    return response;
  }

  async forgiveNsfFee(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/loans/forgiveNsfFee/${screenTrackingId}`
    );

    return response;
  }

  async deferPayment(screenTrackingId: string): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/loans/deferPayment/${screenTrackingId}`
    );

    return response;
  }

  async forgiveSingleLateFee(
    screenTrackingId: string,
    payment: any
  ): Promise<AxiosResponse<any>> {
    const response = await getRequester().post(
      `/api/admin/dashboard/loans/forgiveSingleLateFee/${screenTrackingId}`,
      payment
    );

    return response;
  }
}

export const adminDashboardRequests = new AdminDashboardRequests();

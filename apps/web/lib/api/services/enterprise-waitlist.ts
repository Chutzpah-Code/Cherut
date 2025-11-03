import { apiClient } from '../client';

export interface EnterpriseWaitlistDto {
  contactName: string;
  phoneNumber: string;
  companyName: string;
  numberOfEmployees?: string;
  companyRevenue?: string;
  intendedUse?: string;
  desiredFeatures?: string;
}

export const enterpriseWaitlistApi = {
  create: async (dto: EnterpriseWaitlistDto): Promise<{ id: string; message: string }> => {
    const { data } = await apiClient.post('/enterprise-waitlist', dto);
    return data;
  },
};

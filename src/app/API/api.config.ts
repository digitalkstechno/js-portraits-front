import environment from "../../../environment/env";

const baseUrl = `${environment.baseurl}`;

export const Endpoints = {
  LOGIN: `${baseUrl}/admin`,
  LOGOUT: `${baseUrl}/logout`,
  REFRESH_TOKEN: `${baseUrl}/refresh-token`,

  STAFF: `${baseUrl}/staff`,
  ROLE: `${baseUrl}/role`,
  ITEMS: `${baseUrl}/items`,
  PRODUCTS: `${baseUrl}/products`,
  QUOTATION: `${baseUrl}/quotation`,
  OUTDOOR_ORDER: `${baseUrl}/order`,
};

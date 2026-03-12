import environment from '../../../environment/env';

const baseUrl = `${environment.baseurl}`;

export const Endpoints = {
  LOGIN: `${baseUrl}/admin`,
  LOGOUT: `${baseUrl}/logout`,
  REFRESH_TOKEN: `${baseUrl}/refresh-token`,

  STAFF: `${baseUrl}/staff`,
  STAFF_SALARY: `${baseUrl}/staffSalary`,
  ROLE: `${baseUrl}/role`,
  ITEMS: `${baseUrl}/items`,
  PRODUCTS: `${baseUrl}/products`,
  QUOTATION: `${baseUrl}/quotation`,
  OUTDOOR_ORDER: `${baseUrl}/order`,
  OUTDOOR_BILL: `${baseUrl}/outdoorbill`,
  OUTDOOR_BOOKS: `${baseUrl}/outdoorBookMaster`,
  PRODUCT_SELL: `${baseUrl}/productSell`,
  OUTDOOR_PARTY_PAYMENT: `${baseUrl}/outdoorPayment`,

  CUSTOMERS: `${baseUrl}/outdoorParty`,
  NOTE_SETTINGS: `${baseUrl}/noteSettings`,
  TERMS_AND_CONDITIONS: `${baseUrl}/termsAndConditions`,
  GST_CONFIGURATION: `${baseUrl}/gstConfig`,
  PRINT_SETTINGS: `${baseUrl}/printSettings`,
};

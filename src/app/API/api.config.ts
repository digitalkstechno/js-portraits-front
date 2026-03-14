import environment from '../../../environment/env';

const baseUrl = `${environment.baseurl}`;

export const Endpoints = {
  LOGIN: `${baseUrl}/admin`,
  LOGOUT: `${baseUrl}/logout`,
  REFRESH_TOKEN: `${baseUrl}/refresh-token`,

  ROLE: `${baseUrl}/role`,

  ITEMS: `${baseUrl}/items`,
  PRODUCTS: `${baseUrl}/products`,
  OUTDOOR_BOOKS: `${baseUrl}/outdoorBookMaster`,

  STAFF: `${baseUrl}/staff`,
  STAFF_SALARY: `${baseUrl}/staffSalary`,
  CUSTOMERS: `${baseUrl}/outdoorParty`,

  QUOTATION: `${baseUrl}/quotation`,
  OUTDOOR_ORDER: `${baseUrl}/order`,
  OUTDOOR_BILL: `${baseUrl}/outdoorbill`,
  OUTDOOR_PARTY_PAYMENT: `${baseUrl}/outdoorPayment`,
  PRODUCT_SELL: `${baseUrl}/productSell`,
  PRODUCT_PURCHASE: `${baseUrl}/productPurchase`,

  REVENUE_REPORT: `${baseUrl}/summary`,

  NOTE_SETTINGS: `${baseUrl}/noteSettings`,
  TERMS_AND_CONDITIONS: `${baseUrl}/termsAndConditions`,
  GST_CONFIGURATION: `${baseUrl}/gstConfig`,
  PRINT_SETTINGS: `${baseUrl}/printSettings`,
};

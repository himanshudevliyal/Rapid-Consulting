import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchProductInquiries = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.productInquiries.getAll}?${searchParams}`,
  );

  return data;
};

export const fetchProductInquiry = async (id) => {
  const { data } = await http().get(
    `${endpoints.productInquiries.getAll}/${id}`,
  );

  return data;
};

export const updateProductInquiryStatus = async (id, status) => {
  return await http().put(
    `${endpoints.productInquiries.getAll}/${id}/status`,
    { status },
  );
};

export const deleteProductInquiry = async (id) => {
  return await http().delete(`${endpoints.productInquiries.getAll}/${id}`);
};

import { StatusCodes } from "http-status-codes";
import table from "../../db/models.js";

// NOTE: this previously called several model methods that no longer exist
// (UserModel.getUserStats, OrderModel.*, BookModel.getTopBooks) and crashed
// on every request. Trimmed down to the data that's actually available.
const getDashboardData = async (req, res) => {
  try {
    const products_by_category =
      await table.ProductModel.getProductByCategory(req);
    const inquiries_trend =
      await table.ProductInquiryModel.getInquiriesTrend(req);

    res.code(StatusCodes.OK).send({
      status: true,
      data: {
        charts: {
          products_by_category,
          inquiries_trend,
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

export default {
  getDashboardData: getDashboardData,
};

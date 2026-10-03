"use strict";
import orderItemModel from "./models/order-item.model.js";
import orderModel from "./models/order.model.js";
import paymentModel from "./models/payment.model.js";
import userModel from "./models/user.model.js";
import cartModel from "./models/cart.model.js";
import userAddressModel from "./models/user-address.model.js";
import inventoryModel from "./models/inventory.model.js";
import categoryModel from "./models/category.model.js";
import subCategoryModel from "./models/sub-category.model.js";
import queryModel from "./models/query.model.js";
import productInquiryModel from "./models/product-inquiry.model.js";
import blogModel from "./models/blog.model.js";
import serviceModel from "./models/service.model.js";
import serviceTranslationModel from "./models/service-translation.model.js";
// ── Rapid Consulting additions ────────────────────────────────────
import enquiryModel from "./models/enquiry.model.js";
import articleModel from "./models/article.model.js";
import caseStudyModel from "./models/case-study.model.js";
import adviserModel from "./models/adviser.model.js";
import jobModel from "./models/job.model.js";
import industryModel from "./models/industry.model.js";
import schemeModel from "./models/scheme.model.js";


export default {
  UserModel: userModel,
  CategoryModel: categoryModel,
  SubCategoryModel: subCategoryModel,
  OrderModel: orderModel,
  OrderItemModel: orderItemModel,
  PaymentModel: paymentModel,
  CartModel: cartModel,
  UserAddressModel: userAddressModel,
  InventoryModel: inventoryModel,
  QueryModel: queryModel,
  ProductInquiryModel: productInquiryModel,
  BlogModel: blogModel,
  ServiceModel: serviceModel,
  ServiceTranslationModel: serviceTranslationModel,
  // ── Rapid Consulting ──────────────────────────────────────────
  EnquiryModel: enquiryModel,
  ArticleModel: articleModel,
  CaseStudyModel: caseStudyModel,
  AdviserModel: adviserModel,
  JobModel: jobModel,
  IndustryModel: industryModel,
  SchemeModel: schemeModel,
};

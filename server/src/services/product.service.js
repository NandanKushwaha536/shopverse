import Product from "../models/Product.js";
import { getPagination } from "../utils/pagination.js";

export const getAllProductsService = async (queryData) => {
  const {
    keyword,
    category,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 8,
  } = queryData;

  const query = {};

  if (keyword) {
    query.name = {
      $regex: keyword,
      $options: "i",
    };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) query.price.$gte = Number(minPrice);

    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let productsQuery = Product.find(query);

  if (sort === "price_asc") {
    productsQuery = productsQuery.sort({ price: 1 });
  } else if (sort === "price_desc") {
    productsQuery = productsQuery.sort({ price: -1 });
  } else if (sort === "newest") {
    productsQuery = productsQuery.sort({ createdAt: -1 });
  }

  const { currentPage, perPage, skip } = getPagination(page, limit);

    productsQuery = productsQuery
        .skip(skip)
        .limit(perPage);

  const products = await productsQuery;

  const totalProducts = await Product.countDocuments(query);

 return {
        totalProducts,
        currentPage,
        totalPages: Math.ceil(totalProducts / perPage),
        products,
  };
};
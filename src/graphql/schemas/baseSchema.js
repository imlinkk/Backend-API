const baseTypeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: Int!
    name: String!
    slug: String!
    description: String
    createdAt: String!
    updatedAt: String!
  }

  type Product {
    id: Int!
    name: String!
    slug: String!
    description: String!
    price: Float!
    stock: Int!
    category: Category!
    images: [String!]!
    rating: Float!
    numReviews: Int!
    createdAt: String!
    updatedAt: String!
  }

  type Review {
    id: ID!
    user: User!
    product: Product!
    rating: Int!
    comment: String!
    createdAt: String!
    updatedAt: String!
  }

  type CartItem {
    product: Product
    quantity: Int!
    price: Float!
    subtotal: Float!
  }

  type Cart {
    id: ID!
    user: User!
    items: [CartItem!]!
    totalItems: Int!
    totalAmount: Float!
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    product: Product
    name: String!
    price: Float!
    quantity: Int!
    subtotal: Float!
  }

  type Order {
    id: ID!
    user: User!
    items: [OrderItem!]!
    totalAmount: Float!
    status: String!
    deliveredAt: String
    createdAt: String!
    updatedAt: String!
  }

  type ProductPage {
    items: [Product!]!
    totalItems: Int!
    totalPages: Int!
    currentPage: Int!
    pageSize: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  input ProductFilterInput {
    category: Int
    minPrice: Float
    maxPrice: Float
    search: String
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

module.exports = baseTypeDefs;

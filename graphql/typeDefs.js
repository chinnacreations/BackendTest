// graphql/typeDefs.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    ISBN: String!
    publicationDate: String!
    genre: String!
    copies: Int!
  }

  type Borrowing {
    id: ID!
    user: User!
    book: Book!
    borrowedAt: String!
    returnedAt: String
  }

  type Query {
    users: [User!]!
    books: [Book!]!
    borrowings: [Borrowing!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): String!
    login(email: String!, password: String!): String!
    addBook(title: String!, author: String!, ISBN: String!, publicationDate: String!, genre: String!, copies: Int!): Book!
    borrowBook(bookId: ID!): Borrowing!
    returnBook(bookId: ID!): String!
  }
`;

module.exports = typeDefs;

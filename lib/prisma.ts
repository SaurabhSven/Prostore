import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price.toString();
        },
      },
      rating: {
        compute(product) {
          return product.rating.toString();
        },
      },
    },
  },
})

export { prisma }
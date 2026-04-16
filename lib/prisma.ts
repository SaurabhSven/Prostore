import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@/lib/generated/prisma/client";

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
    cart:{
      itemsPrice:{
        needs:{itemsPrice:true},
        compute(cart){
          return cart.itemsPrice.toString();
        }
      },
      shippingPrice:{
        needs:{shippingPrice:true},
        compute(cart){
          return cart.shippingPrice.toString();
        }
      },
      taxPrice:{
        needs:{taxPrice:true},
        compute(cart){
          return cart.taxPrice.toString();
        }
      },
      totalPrice:{
        needs:{totalPrice:true},
        compute(cart){
          return cart.totalPrice.toString();
        }
      },
    },
    order:{
      itemsPrice:{
        needs:{itemsPrice:true},
        compute(cart){
          return cart.itemsPrice.toString();
        }
      },
      shippingPrice:{
        needs:{shippingPrice:true},
        compute(cart){
          return cart.shippingPrice.toString();
        }
      },
      taxPrice:{
        needs:{taxPrice:true},
        compute(cart){
          return cart.taxPrice.toString();
        }
      },
      totalPrice:{
        needs:{totalPrice:true},
        compute(cart){
          return cart.totalPrice.toString();
        }
      },
    },
    orderItem:{
      price:{
        needs:{price:true},
        compute(cart){
          return cart.price.toString();
        }
      },
    }
  },
})

export { prisma }
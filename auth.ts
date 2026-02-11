import NextAuth from "next-auth";
import {PrismaAdapter} from "@auth/prisma-adapter";
import {prisma} from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials"
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const config = {
    pages:{
        signIn: '/sign-in',
        error: '/sign-in',
    },
    session:{
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    adapter: PrismaAdapter(prisma),
    providers:[
        CredentialsProvider({
            credentials:{
                email: {type: "email",},
                password: {type: "password",}
            },
            async authorize(credentials) {
                if(!credentials || credentials == null){
                    return null;
                }

                // Find user in database
                const user = await prisma.user.findFirst({
                    where: {email:credentials.email as string}
                })

                // Check if user exists and password matches
                if(user && user.password){
                    const isMatch = compareSync(credentials.password as string, user.password);

                    // If Password matches, return user
                    if(isMatch){
                        return {
                            id:user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                        }
                    }
                }

                // If no user or password doesn't match, return null
                return null;
            }
        })
    ],
    callbacks: {
        async session({ session, user, trigger, token }:any) {
            // Set the user id from the token
            session.user.id = token.sub;

            session.user.role = token.role;
            session.user.name = token.name;

            // If there is an update, set the user name
            if(trigger === 'update'){
                session.user.name = user.name;
            }
            return session
        },
        async jwt({token, user, trigger, session}:any) {
            // Assign user fields to token 
            if(user){
                token.role = user.role

                // If user has no name then use the email as name
                if(!user.name){
                    token.name = user.email.split('@')[0];

                    //update database to reflect the token name
                    await prisma.user.update({
                        where: {id: user.id},
                        data: {name: token.name}
                    });
                }
            }
            return token;
        },
        authorized({request, auth}:any){
            // Check for session cart cookie
            if(!request.cookies.get('sessionCartId')){
                // Generate new session cart id
                const sessionCartId = crypto.randomUUID();
                
                // Clone the request headers
                const newReqHeaders = new Headers(request.headers);

                // Create new response and add the new headers
                const response = NextResponse.next({
                    request: {
                        headers: newReqHeaders,
                    }
                });

                // Set newly generated session cart id in the response cookies
                response.cookies.set('sessionCartId', sessionCartId);

                return response;
            }else{
                return true;
            }
        },
    },
} satisfies NextAuthConfig;

export const {handlers, auth, signIn, signOut} = NextAuth(config);
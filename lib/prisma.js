import { PrismaClient } from "@prisma/client"

export const db= globalThis.prisma || new PrismaClient();

if(process.env.NODE_ENV !== "production"){
    globalThis.prisma = db;
}


// globaThis.prisma: this global bariable ensures that the prisma client instance is 
//redused across hot reloads during-development,without this, each time your application
//reloads, a new instance of the prisma client would be created, ppotentially leading to connection issues
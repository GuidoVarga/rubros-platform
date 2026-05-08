import {PrismaClient} from "./generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

global.prisma = prisma;

export {prisma};

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://neondb_owner:npg_TU1yQvMS3loF@ep-frosty-pine-aym5yz4h.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
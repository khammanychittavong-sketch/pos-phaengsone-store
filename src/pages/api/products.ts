import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { name, retailPrice, categoryId, unit, costPrice } = req.body;
      
      const newProduct = await prisma.product.create({
        data: {
          name,
          retailPrice: parseFloat(retailPrice),
          categoryId,
          unit: unit || "ຊິ້ນ",
          costPrice: costPrice ? parseFloat(costPrice) : 0,
        },
      });
      
      return res.status(200).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }
  return res.status(405).json({ message: "Method not allowed" });
}
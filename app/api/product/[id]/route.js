import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "../../../../config/db";
import Product from "../../../../models/Product";
import authSeller from "../../../../lib/authSeller";

/**
 * This API route deletes a product.
 * 
 * @param {Request} request - The request object
 * @param {Object} params - The parameters of the request
 * @returns {Promise<NextResponse>} - A promise that resolves to a NextResponse object with a JSON response
 */
export async function DELETE(request, { params }) {
  try {
    /**
     * Get the user ID from the authentication middleware
     */
    const { userId } = getAuth(request);

    /**
     * Check if the user is a seller
     */
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      /**
       * Return an error response if the user is not a seller
       */
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    /**
     * Connect to the database
     */
    await connectDB();

    /**
     * Find the product from the database
     */
    const product = await Product.findById(params.id);

    if (!product) {
      /**
       * Return an error response if the product is not found
       */
      return NextResponse.json({ success: false, message: "Product not found" });
    }

    /**
     * Delete the product from the database
     */
    await Product.findByIdAndDelete(params.id);

    /**
     * Return a success response with a message
     */
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    /**
     * Return an error response with the error message
     */
    return NextResponse.json({ success: false, message: error.message });
  }
}

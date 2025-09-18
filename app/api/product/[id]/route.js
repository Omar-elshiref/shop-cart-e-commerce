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
/**
 * Deletes a product by its ID.
 * 
 * If the user is not a seller, it returns an Unauthorized error.
 * If the product is not found, it returns a Product not found error.
 * If the product is deleted successfully, it returns a success message.
 * If there is an error, it returns an error message.
 */
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const { userId } = getAuth(request);

    // Check if the user is a seller
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    // Connect to the database
    await connectDB();

    // Find the product by its ID
    const product = await Product.findById(params.id);

    // If the product is not found, return an error
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" });
    }

    // Delete the product
    await Product.findByIdAndDelete(params.id);

    // Return a success message if the product is deleted successfully
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    // Return an error message if there is an error
    return NextResponse.json({ success: false, message: error.message });
  }
}
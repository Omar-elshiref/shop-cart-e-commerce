import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "../../../../lib/authSeller";
import connectDB from "../../../../config/db";
import Product from "../../../../models/Product";

/**
 * GET /api/product/seller-list
 * 
 * Returns a list of all products from the database if the user is a seller
 * 
 * @param {Request} request - The request object
 * @returns {Promise<NextResponse>} - The response object
 */
export async function GET(request) {
    try {
        // Get the user ID from the authentication middleware
        const { userId } = getAuth(request);

        const isSeller = await authSeller(userId);

        if (!isSeller) {
            // If the user is not a seller, return an error
            return NextResponse.json({ success: false, message: "not authorized" });
        }

        // Connect to the database
        await connectDB();

        // Get all products from the database
        const products = await Product.find({});

        // Return the list of products
        return NextResponse.json({ success: true, products });

  
    } catch (error) {
        // Log any errors
        console.log(error);
        // Return an error response
        return NextResponse.json({ success: false, message: error.message });
    }
}

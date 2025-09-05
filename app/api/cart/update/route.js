import { getAuth } from "@clerk/nextjs/server";
import connectDB from "../../../../config/db";
import User from "../../../../models/User";
import { NextResponse } from "next/server";
/**
 * This API route updates the cart items of a user.
 * 
 * @param {Request} request - The request object containing the cart data to be updated.
 * @returns {Promise<NextResponse>} - A promise that resolves to a NextResponse object with a JSON response.
 */
export async function Post(request) {
    try {
        const { userId } = getAuth(request);

        // Get the cart data from the request body
        const {cartData} = await request.json();

        // Connect to the database
        await connectDB();

        // Find the user from the database
        const user = await User.findById(userId);

        // Update the cart items of the user
        user.cartItems = cartData;

        // Save the updated user to the database
      await  user.save();

        // Return a success response with the updated cart data
        return NextResponse.json({
            success: true,
            message: "Cart updated successfully"
        });   
    } catch (error) {
        // Log any errors
        console.log(error);
        // Return an error response with the error message
        return NextResponse.json({ success: false, message: error.message });
        
    }
}

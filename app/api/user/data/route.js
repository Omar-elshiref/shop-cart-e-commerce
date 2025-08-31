import { getAuth } from "@clerk/nextjs/server";
import User from "../../../../models/User";
import { NextResponse } from "next/server";
import connectDB from "../../../../config/db";


/**
 * GET /api/user/data
 * 
 * Returns the user data from the database
 * 
 * @param {Request} request - The request object
 * @returns {Promise<Response>} - The response object
 */
export async function GET(request) {
    // Get the user id from the authentication middleware
    const { userId } = getAuth(request);
    // Connect to the database
    await connectDB();
    try {
        // Find the user in the database
        const user = await User.findById(userId);
        // If the user is not found, return an error
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }
        // Return the user data
        return NextResponse.json({ success: true, user });
    } catch (error) {
        // Log any errors
        console.log(error);
        // Return an error response
        return NextResponse.json({ success: false, message: error.message });
    }
}

import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Checks if a user is a seller or not.
 *
 * @param {string} userId The ID of the user to check.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is a seller, false otherwise.
 */
const authSeller = async (userId) => {
    try {
        // Get the user from the Clerk client
        const client = await clerkClient()
        const user = await client.users.getUser(userId)

        // Check if the user is a seller
        if (user.publicMetadata.role === 'seller') {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        // If there is an error, return a JSON response with the error message
        return NextResponse.json({ success: false, message: error.message });
    }
}

export default authSeller;
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import authSeller from "../../../../lib/authSeller";
import connectDB from "../../../../config/db";
import Product from "../../../../models/Product";

// ده الاعدادات بتاعت الكلاودناري
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


/**
 * This is the API route that handles the request from the client
 * when they want to upload a file to Cloudinary
 *
 * @param {Request} request - The request object
 * @returns {Promise<Response>} - The response object
 */
export async function POST(request) {
    try {
        // Get the user ID from the authentication middleware

        const { userId } = getAuth(request);

        const isSeller = await authSeller(userId);

        if (!isSeller) {
            return NextResponse.json({ success: false, message: "not authorized" });
        }
        // Get the file from the request
        const formData = await request.formData();

        const name = formData.get("name");
        const description = formData.get("description");
        const category = formData.get("category");
        const price = formData.get("price");
        const offerPrice = formData.get("offerPrice");

        const files = formData.getAll("images");

        if (!files || files.length === 0) {
            return NextResponse.json({ success: false, message: "No files uploaded" });
        }

        // Upload the images to Cloudinary and get the URLs
        const result = await Promise.all(
            files.map(async (file) => {
                // Convert the file to an array buffer
                const arrayBuffer = await file.arrayBuffer(); 
                const buffer = Buffer.from(arrayBuffer);

                // Upload the image to Cloudinary
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        // Set the resource type to auto so that Cloudinary can detect the file type
                        {resource_type: "auto"},
                        (error, result) => {
                            if (error) {
                                reject(error)
                            } else {
                                resolve(result);
                            }
                        }
                    );

                    // Write the image to the stream
                    stream.end(buffer);
                });
            })
        );

        // Extract the URLs from the results
        const image = result.map(result => result.secure_url);

        // Connect to the database
        await connectDB();

        // Create a new product with the uploaded images
        const newProduct = await Product.create({
            userId,
            name,
            description,
            category,
            price: Number(price),
            offerPrice: Number(offerPrice),
            image,
            date: Date.now(),
        });

        // Return the new product
        return NextResponse.json({ success: true, product: newProduct, message: "Product added successfully" });
       
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: error.message });
    }
}

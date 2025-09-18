import { getAuth } from "@clerk/nextjs/server";
import connectDB from "../../../../config/db";
import Address from "../../../../models/Address";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";
import authSeller from "../../../../lib/authSeller";


export async function GET(request) {
    try {

        const {userId} = getAuth(request);

        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({ success: false, message: "Unauthorized" });
        }

        await connectDB()

        Address.length

const orders = await Order.find({})
            .populate({ path: "address", model: "Address" })
            .populate({ path: "items.product", model: "Product" });
                    
        return NextResponse.json({ success: true, orders });
    
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: error.message });

    }
}
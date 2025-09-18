import { getAuth } from "@clerk/nextjs/server";
import connectDB from "../../../../config/db";
import Address from "../../../../models/Address";
import Product from "../../../../models/Product";
import Order from "../../../../models/Order";
import { NextResponse } from "next/server";


export async function GET(request) {
    try {

        const {userId} = getAuth(request);

        await connectDB()

        Address.length
        Product.length

const orders = await Order.find({ userId })
            .populate({ path: "address", model: "Address" })
            .populate({ path: "items.product", model: "Product" });
                    
        return NextResponse.json({ success: true, orders });
    
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: error.message });

    }
}
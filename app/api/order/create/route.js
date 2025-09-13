import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { inngest } from "../../../../config/inngest";
import User from "../../../../models/User";


export async function POST(request) {
    try {
        const { userId } = getAuth(request);

        const {address, items} = await request.json();
        if (!address ||  items.length === 0) {
            return NextResponse.json({ success: false, message: "invalid data" });
        }

        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                amount += product.price * item.quantity;
            }
        }

        await inngest.send({
            name: "order/created",
            data: { userId,
                    items,
                    amount: amount + Math.floor( amount * 0.02),
                    address,
                    date: Date.now(),
                 }
        })

        const user = await User.findById(userId);
        user.cartItems = {}
        await user.save();

        return NextResponse.json({ success: true, message: "Order placed successfully" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: error.message });
        
    }
}
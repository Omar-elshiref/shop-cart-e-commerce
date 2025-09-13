import { Inngest } from "inngest";
import connectDB from "./db.js";
import User from "../models/User.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "shopcart-next" });

export const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk"},
    { event: "clerk/user.created" },
    async ({ event}) => {
        const { id, first_name, last_name, email_addresses, image_url  } = event.data;
        const userData = {
            _id: id,
            email: email_addresses?.[0]?.email_address || "",
            name: first_name + " " + last_name,
            imageUrl: image_url || "",
        };
        await connectDB();
        await User.create( userData)
    }
)

export const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk"},
    { event: "clerk/user.updated" },
    async ({ event}) => {
        const { id, first_name, last_name, email_addresses, image_url  } = event.data;
        const userData = {
            name: first_name + " " + last_name,
            email: email_addresses?.[0]?.email_address || "",
            imageUrl: image_url || "",
        };
        await connectDB();
        await User.findByIdAndUpdate( id, userData)
    }
)

export const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-from-clerk"},
    { event: "clerk/user.deleted" },
    async ({ event}) => {
        const { id } = event.data;
        await connectDB();
        await User.findByIdAndDelete( id)   
    }
)

export const createUserOrder = inngest.createFunction(
    { id: "create-user-order",
        batchEvents: {
            maxSize: 5,
            timeout: '5s',
        }
    },
    { event: "order/created" },
    async ({ events}) => {
        const orders = events.map((e) => {
            return {
                userId: e.data.userId,
                items: e.data.items,
                amount: e.data.amount,
                address: e.data.address,
                status: e.data.status,
            }
        });

        await connectDB();
        await Order.insertMany( orders);

        return { success: true, processed: orders.length };
      
    }
)
'use client'
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, PropsWithChildren } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { ProductType, User } from "@/interface/Index";
import axios from "axios";
import toast from "react-hot-toast";


type AppContextValue = {
  user: User | null;
getToken: () => Promise<string | null>;
  currency: string;
  router: ReturnType<typeof useRouter> | null;
  isSeller: boolean;
    userData: User | undefined;
  products: ProductType[];
  cartItems: { [key: string]: number };
  setIsSeller: (isSeller: boolean) => void;
  fetchUserData: () => Promise<void>;
  fetchProductData: () => Promise<void>;
  setCartItems: (cartItems: { [key: string]: number }) => void;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  addToCart: (productId: string) => Promise<void>;
  getCartCount: () => number;
  getCartAmount: () => number;
}

const defaultValue: AppContextValue = {
  user: null,
    getToken: async () => null,
  currency: '',
  router: null,
  isSeller: false,
  userData: userDummyData,
  products: productsDummyData,
  cartItems: {},
  setIsSeller: () => {},
  fetchUserData: async () => {},
  fetchProductData: async () => {},
  setCartItems: () => {},
  updateCartQuantity: async () => {},
  addToCart: async () => {},
  getCartCount: () => 0,
  getCartAmount: () => 0,
};

export const AppContext = createContext(defaultValue);

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = (props: PropsWithChildren<{ children: React.ReactNode }>) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY ?? 'USD'
    const router = useRouter()

    const { user } = useUser()
    const { getToken} = useAuth()


    const [products, setProducts] = useState<ProductType[]>([])
    const [userData, setUserData] = useState<User>(false as unknown as User)
    const [isSeller, setIsSeller] = useState(false)
    const [cartItems, setCartItems] = useState<{ [key: string]: number }>({})

    const fetchProductData = async () => {
       
        setProducts(productsDummyData)
    }

    const fetchUserData = async () => {
        try {
         if (user?.publicMetadata?.role === 'seller') {
            setIsSeller(true)

        }
        const token = await getToken()
        
        const {data} = await axios.get('/api/user/data', {headers: {Authorization: `Bearer ${token}`}})
        
            if (data.seccess) {
                setUserData(data.user)
                setCartItems(data.user.cartItems)
            } else {
                toast.error(data.message)
            }
            
        
        setUserData(userDummyData)
        } catch (error) {
            toast.error((error as Error).message)
        }
   
    }

    const addToCart = async (itemId: string) => {

        const cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);

    }

    const updateCartQuantity = async (itemId: string, quantity: number) => {

        const cartData = structuredClone(cartItems);
        if (quantity === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = quantity;
        }
        setCartItems(cartData)

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                totalCount += cartItems[items];
            }
        }
        return totalCount;
    }

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
        const itemInfo = products.find((product) => product._id === items);
        if (itemInfo && cartItems[items] > 0) {
            totalAmount += itemInfo.offerPrice * cartItems[items];
        }
    }
    return Math.floor(totalAmount * 100) / 100;
}

    useEffect(() => {
        fetchProductData();
        
    }, [])

    useEffect(() => {
        if (user) {

            fetchUserData()
        }
    }, [user])

    const value: AppContextValue = {
        user: user as User | null,
        getToken,
        currency, router,
        isSeller, setIsSeller,
        userData, fetchUserData,
        products, fetchProductData,
        cartItems, setCartItems,
        addToCart, updateCartQuantity,
        getCartCount, getCartAmount
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
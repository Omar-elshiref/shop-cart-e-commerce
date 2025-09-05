"use client";
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
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
};

const defaultValue: AppContextValue = {
  user: null,
  getToken: async () => null,
  currency: "",
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

/**
 * A hook to access the application context.
 *
 * @returns The application context
 */
export const useAppContext = (): AppContextValue => {
  return useContext(AppContext);
};

export const AppContextProvider = (
  props: PropsWithChildren<{ children: React.ReactNode }>
) => {
  /**
   * The currency symbol to use for the application.
   * Defaults to "USD".
   */
  const currency = process.env.NEXT_PUBLIC_CURRENCY ?? "USD";

  /**
   * The router from the next/navigation package.
   */
  const router = useRouter();

  /**
   * The user details from the Clerk SDK.
   */
  const { user } = useUser();

  /**
   * The function to get the authentication token.
   */
  const { getToken } = useAuth();

  /**
   * The list of products.
   */
  const [products, setProducts] = useState<ProductType[]>([]);

  /**
   * The user data.
   */
  const [userData, setUserData] = useState<User>(false as unknown as User);

  /**
   * Whether the user is a seller or not.
   */
  const [isSeller, setIsSeller] = useState(false);

  /**
   * The items in the cart.
   */
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});

  /**
   * Fetch the products data from the server.
   *
   * This function fetches the list of products from the server and updates the
   * products state in the context. If the response is successful, it sets the
   * products state to the products received from the server. If the response is
   * not successful, it shows an error message.
   *
   * @returns {void}
   */
  const fetchProductData = async (): Promise<void> => {
    try {
      // Fetch the list of products from the server
      const { data } = await axios.get('/api/product/list');

      // If the response is successful, set the products state to the products received from the server
      if (data?.success) {
        setProducts(data?.products);
      } else {
        // Otherwise, show an error message
        toast.error(data?.message);
      }
    } catch (error) {
      // If there is an error, show an error message
      toast.error((error as Error).message);
      console.log("fetchProductData error", error);
    }
  };

  /**
   * Fetch the user data from the server.
   *
   * This function fetches the user data from the server and updates the user
   * data in the context. It also checks if the user is a seller or not and
   * updates the context accordingly.
   */
  const fetchUserData = async () => {
    try {
      // Check if the user is a seller or not
      if (user?.publicMetadata?.role === "seller") {
        setIsSeller(true);
      }

      // Get the authentication token
      const token = await getToken();

      // Fetch the user data from the server
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check if the response is successful
      if (data.success) {
        // Update the user data in the context
        setUserData(data.user);
        // Update the cart items in the context
        setCartItems(data.user.cartItems);
      } else {
        // Show an error message if the response is not successful
        toast.error(data.message);
      }

      // Set the default user data if the user data is not available
      setUserData(userDummyData);
    } catch (error) {
      // Show an error message if there is an error
      toast.error((error as Error).message);
    }
  };

  /**
   * Add a product to the cart.
   *
   * This function adds a product to the cart by increasing the quantity of the
   * product in the cart by 1. If the product is not in the cart, it will be added
   * with a quantity of 1.
   *
   * @param itemId The ID of the product to add.
   */
  const addToCart = async (itemId: string) => {
    // Make a deep copy of the cart items
    const cartData = structuredClone(cartItems);

    // If the product is already in the cart, increase the quantity by 1
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      // If the product is not in the cart, add it with a quantity of 1
      cartData[itemId] = 1;
    }

    // Update the cart items in the context
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken();
        await axios.post('/api/cart/update', { cartData }, {
          headers: { Authorization: `Bearer ${token}` },
        });
    toast.success("Product added to cart");

      } catch (error) {
        toast.error((error as Error).message);
        
      }

    }
  };

  /**
   * Update the quantity of a product in the cart.
   *
   * This function updates the quantity of a product in the cart. If the quantity
   * is 0, the product will be removed from the cart.
   *
   * @param itemId The ID of the product to update.
   * @param quantity The new quantity of the product. If the quantity is 0, the
   * product will be removed from the cart.
   */
  const updateCartQuantity = async (itemId: string, quantity: number) => {
    // Make a deep copy of the cart items
    const cartData = structuredClone(cartItems);

    // If the quantity is 0, remove the product from the cart
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      // If the quantity is greater than 0, update the quantity of the product in the cart
      cartData[itemId] = quantity;
    }

    // Update the cart items in the context
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken();
        await axios.post('/api/cart/update', { cartData }, {
          headers: { Authorization: `Bearer ${token}` },
        });
    toast.success("cart updated");

      } catch (error) {
        toast.error((error as Error).message);
        
      }

    }
  };

  /**
   * Get the total number of items in the cart.
   *
   * This function loops through the cart items and adds up the quantity of each
   * item. It returns the total count of items in the cart.
   */
  const getCartCount = (): number => {
    let totalCount = 0;
    // Loop through the cart items
    for (const items in cartItems) {
      // If the quantity of the item is greater than 0, add it to the total count
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    // Return the total count
    return totalCount;
  };

  /**
   * Get the total amount of the items in the cart.
   *
   * This function loops through the cart items and multiplies the quantity of each
   * item by its offer price. It returns the total amount of the items in the cart.
   */
  const getCartAmount = (): number => {
    let totalAmount = 0;
    // Loop through the cart items
    for (const items in cartItems) {
      // Get the product info of the item
      const itemInfo = products.find((product) => product._id === items);
      // If the item is found and the quantity is greater than 0
      if (itemInfo && cartItems[items] > 0) {
        // Add the amount of the item to the total amount
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }

    // Return the total amount with 2 decimal places
    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const value: AppContextValue = {
    user: user as User | null,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

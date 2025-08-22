export interface ProductType {
    _id: string,
    userId: string,
    name: string,
    description: string,
    price: number,
    offerPrice: number,
    image: string[],
    category: string,
    date: number,
    __v: number
}

export interface User {
      _id: string,
  name: string,
  email: string,
  imageUrl: string,
  cartItems: { [key: string]: number };
  __v: number
}

export interface  orderDummyDataType {
    _id: string;
    userId: string;
    items: {
        product: {
            _id: string;
            userId: string;
            name: string;
            description: string;
            price: number;
            offerPrice: number;
            image: string[];
            category: string;
            date: number;
            __v: number;
        };
        quantity: number;
        _id: string;
    }[];
    amount: number;
    address: {
        _id: string;
        userId: string;
        fullName: string;
        phoneNumber: string;
        pincode: number;
        area: string;
        city: string;
        state: string;
        __v: number;
    };
    status: string;
    date: number;
    __v: number;
}

export interface addressDummyDataType {
    _id: string;
    userId: string;
    fullName: string;
    phoneNumber: string;
    pincode: number;
    area: string;
    city: string;
    state: string;
    __v: number;
}

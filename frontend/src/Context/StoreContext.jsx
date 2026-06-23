import { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { food_list as staticFoodList } from "../assets/assets";

// eslint-disable-next-line react-refresh/only-export-components
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem("cartItems");
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const loadCartFromAPI = useCallback(async (authToken) => {
        try {
            const response = await axios.get(url + "/api/cart", {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            if (response.data.success) {
                const apiCart = {};
                response.data.cart.items.forEach((item) => {
                    const foodId = item.foodId._id || item.foodId;
                    apiCart[foodId] = item.quantity;
                });
                setCartItems(apiCart);
                localStorage.removeItem("cartItems");
            }
        } catch (error) {
            console.log("Error loading cart from API:", error);
        }
    }, [url]);

    const addToCart = async (itemId) => {
        setCartItems((prev) => {
            const updated = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
            if (!token) localStorage.setItem("cartItems", JSON.stringify(updated));
            return updated;
        });

        if (token) {
            try {
                await axios.post(url + "/api/cart/add", { foodId: itemId, quantity: 1 }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.log("Error adding to cart:", error);
            }
        }
    };

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const updated = { ...prev, [itemId]: Math.max((prev[itemId] || 0) - 1) };
            if (!token) localStorage.setItem("cartItems", JSON.stringify(updated));
            return updated;
        });

        if (token) {
            try {
                await axios.put(url + `/api/cart/update/${itemId}`, { quantity: Math.max((cartItems[itemId] || 1) - 1, 0) }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.log("Error removing from cart:", error);
            }
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => String(product._id) === item);
                if (itemInfo) {
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    const clearCart = async () => {
        setCartItems({});
        localStorage.removeItem("cartItems");
        if (token) {
            try {
                await axios.delete(url + "/api/cart/clear", {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.log("Error clearing cart:", error);
            }
        }
    };

    useEffect(() => {
        async function loadFoodData() {
            try {
                const response = await axios.get(url + "/api/foods/list");
                if (response.data.success && response.data.data.length > 0) {
                    setFoodList(response.data.data);
                } else {
                    setFoodList(staticFoodList);
                }
            } catch (error) {
                console.log("Error fetching food data:", error);
                setFoodList(staticFoodList);
            }
        }
        loadFoodData();
    }, [url]);

    useEffect(() => {
        if (token) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadCartFromAPI(token);
        }
    }, [token, loadCartFromAPI]);

    const contextValue = {
        food_list,
        setFoodList,
        cartItems,
        addToCart,
        setCartItems,
        removeFromCart,
        getTotalCartAmount,
        clearCart,
        url,
        token,
        setToken,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;

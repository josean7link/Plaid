import React, { useCallback, useContext, useEffect } from "react";
import styles from "./App.module.scss";
import Header from "./Components/Headers";
import Items from "./Components/ProductTypes/Items";
import Products from "./Components/ProductTypes/Products";
import Context from "./Context";



const App = () => {
  const { linkSuccess, isItemAccess, dispatch } = useContext(Context);

  const getInfo = useCallback(async () => {
    const response = await fetch("http://localhost:8000/api/v1/plaid/info", {
      method: "POST",
      headers: new Headers({
        'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
      }),
    });
    if (!response.ok) {
      dispatch({ type: "SET_STATE", state: { backend: false } });
      return { paymentInitiation: false };
    }
    const data = await response.json();
    const paymentInitiation: boolean = data.products.includes(
      "payment_initiation"
    );
    dispatch({
      type: "SET_STATE",
      state: {
        products: data.products,
      },
    });
    return { paymentInitiation };
  }, [dispatch]);

  const generateToken = useCallback(
    async (paymentInitiation) => {
      const path = paymentInitiation
        ? "http://localhost:8000/api/create_link_token_for_payment"
        : "http://localhost:8000/api/v1/plaid/create_link_token";
      const response = await fetch(path, {
        method: "POST",
        headers: new Headers({
          'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
        }),
      });
      if (!response.ok) {
        dispatch({ type: "SET_STATE", state: { linkToken: null } });
        return;
      }
      const data = await response.json();
      if (data) {
        if (data.error != null) {
          dispatch({
            type: "SET_STATE",
            state: {
              linkToken: null,
              linkTokenError: data.error,
            },
          });
          return;
        }
        dispatch({ type: "SET_STATE", state: { linkToken: data.link_token } });
      }
      localStorage.setItem("link_token", data.link_token); //to use later for Oauth
    },
    [dispatch]
  );

  useEffect(() => {
    const init = async () => {
      const { paymentInitiation } = await getInfo(); // used to determine which path to take when generating token
      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes("?oauth_state_id=")) {
        dispatch({
          type: "SET_STATE",
          state: {
            linkToken: localStorage.getItem("link_token"),
          },
        });
        return;
      }
      generateToken(paymentInitiation);
    };
    init();
  }, [dispatch, generateToken, getInfo]);

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <Header />
        {linkSuccess && isItemAccess && (
          <>
            <Products />
            <Items />
          </>
        )}
      </div>
    </div>
  );
};

export default App;

import Button from "plaid-threads/Button";
import React, { useContext, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import Context from "../../Context";


const Link = () => {
  const { linkToken, dispatch } = useContext(Context);

  const onSuccess = React.useCallback(
    (public_token: string, metadata: any) => {
      // send public_token to server
      console.log('public token ', public_token);
      console.log('metadata ', metadata);
      console.log('Authorization: Bearer', process.env.REACT_APP_API_TOKEN);
      const setToken = async () => {
        // const url = `http://localhost:8000/api/v1/plaid/set_access_token?account=${metadata.accounts[0].id}&public_token=${public_token}`;
        const url = `http://localhost:8000/api/v1/plaid/set_access_token`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            //"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            'Authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
          },
          // body: {
          //   'public_token': public_token
          // },
        });
        if (!response.ok) {
          console.log(response)
          dispatch({
            type: "SET_STATE",
            state: {
              itemId: `no item_id retrieved`,
              accessToken: `no access_token retrieved`,
              isItemAccess: false,
            },
          });
          return;
        }
        const data = await response.json();
        // coloco el codigo para reenviar el responde.
        dispatch({
          type: "SET_STATE",
          state: {
            itemId: data.item_id,
            accessToken: data.access_token,
            isItemAccess: true,
          },
        });
      };
      setToken();
      dispatch({ type: "SET_STATE", state: { linkSuccess: true } });
      window.history.pushState("", "", "/");
    },
    [dispatch]
  );

  let isOauth = false;
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: linkToken!,
    onSuccess,
  };

  if (window.location.href.includes("?oauth_state_id=")) {
    // TODO: figure out how to delete this ts-ignore
    // @ts-ignore
    config.receivedRedirectUri = window.location.href;
    isOauth = true;
  }

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (isOauth && ready) {
      open();
    }
  }, [ready, open, isOauth]);

  return (
    <Button type="button" large onClick={() => open()} disabled={!ready}>
      Launch Link
    </Button>
  );
};

Link.displayName = "Link";

export default Link;

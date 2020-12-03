import React, { useState, useEffect } from "react";
import { TextInput, StyleSheet } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
const apiTokenInput = (props) => {
  const [apiToken, setApiToken] = useState("");
  const setToken = async (token) => {
    setApiToken(token);
    await AsyncStorage.setItem("@pinboardToken", token);
  };

  const testToken = async (testToken) => {
    try {
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const apiUrl = `https://api.pinboard.in/v1/posts/recent?auth_token=${testToken}&format=json`;
      const response = await fetch(proxyUrl + apiUrl);
      return response.ok;
    } catch (err) {
      console.log("error:", err);
      return false;
    }
  };

  const getStoredToken = async () => {
    const storedToken = await AsyncStorage.getItem("@pinboardToken");
    const tokenTest = await testToken(storedToken);
    console.log("token test:", tokenTest);
    console.log("stored token:", storedToken);
    // if we have a stored token and it's good
    if (storedToken && tokenTest) {
      console.log("setting stored api token because it was fine");
      setToken(storedToken);
    } else {
      console.log("resetting our stored token");
      // otherwise reset the token
      setToken("");
    }
  };

  useEffect(() => {
    if (apiToken !== "") {
      setToken(apiToken);
      props.setToken(apiToken);
    } else {
      getStoredToken();
    }
  });

  return (
    <TextInput
      style={styles.textInputStyle}
      editable
      onChangeText={(text) => setApiToken(text)}
    ></TextInput>
  );
};

const styles = StyleSheet.create({
  textInputStyle: {
    width: "100%",
    borderWidth: 2,
    padding: 2,
    margin: 5,
    borderColor: "black",
  },
});
export default apiTokenInput;

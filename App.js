import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import ReaderView from "./components/ReaderView";
import ApiTokenInput from "./components/PinboardLogin";
import PinboardListView from "./components/PinboardListView";

export default function App() {
  const [apiToken, setApiToken] = useState("");
  const [currentArticleUrl, setCurrentArticleUrl] = useState("");

  return (
    <View style={styles.container}>
      {apiToken == "" ? <ApiTokenInput setToken={setApiToken} /> : <></>}
      {apiToken != "" ? (
        <PinboardListView
          token={apiToken}
          clickArticle={(l) => {
            console.log(`Clicked URL: ${l}`);
            setCurrentArticleUrl(l);
          }}
        />
      ) : (
        <></>
      )}
      {currentArticleUrl == "" ? <></> : <ReaderView url={currentArticleUrl} />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

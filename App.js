import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import ReaderView from "./components/ReaderView";
import ApiTokenInput from "./components/PinboardLogin";
import PinboardListView from "./components/PinboardListView";

export default function App() {
  const [apiToken, setApiToken] = useState("");
  const [currentArticleUrl, setCurrentArticleUrl] = useState("");
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    if (currentArticleUrl != "") {
      setIsReading(true);
    }
  });

  const ListOrArticle = () => {
    if (isReading) {
      return (
        <View style={styles.container}>
          <ReaderView url={currentArticleUrl} />
          <StatusBar style="light" />
        </View>
      );
    } else {
      return (
        <PinboardListView
          token={apiToken}
          clickArticle={(l) => {
            setCurrentArticleUrl(l);
          }}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {apiToken == "" ? (
        <ApiTokenInput setToken={setApiToken} />
      ) : (
        <ListOrArticle />
      )}
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

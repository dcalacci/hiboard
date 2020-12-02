import React, { useState, useEffect } from "react";
import { View, TouchableHighlight, Text, StyleSheet } from "react-native";

const PinboardListView = ({ token, clickArticle }) => {
  const [articles, setArticles] = useState([]);
  useEffect(() => {
    console.log("articles:", articles);
    console.log("token", token);
    if (articles.length == 0) {
      getArticles();
    }
  });

  const ArticleList = () => {
    return articles.map((a, i) => (
      <View key={i}>
        <TouchableHighlight onPress={() => clickArticle(a.href)}>
          <Text style={styles.articleItemStyle}>{a.description}</Text>
        </TouchableHighlight>
      </View>
    ));
  };

  const getArticles = async () => {
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";
    const apiUrl = `https://api.pinboard.in/v1/posts/recent?auth_token=${token}&format=json`;
    const response = await fetch(proxyUrl + apiUrl);
    const json = await response.json();
    console.log("got json", json);
    setArticles(json.posts);
  };

  return (
    <View>
      <ArticleList />
    </View>
  );
};

const styles = StyleSheet.create({
  articleItemStyle: {
    fontFamily: "Helvetica Neue",
    fontWeight: "500",
    padding: 10,
    fontSize: 24,
    borderBottomWidth: "2px",
  },
});
export default PinboardListView;

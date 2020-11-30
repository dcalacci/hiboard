import React, { PureComponent } from "react";
import {
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import HTMLView from "react-native-htmlview";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";

class ReaderView extends PureComponent {
  constructor(props) {
    super(props);
    this.parseHtml = this.parseHtml.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.mounted = false;
  }

  componentDidMount() {
    this.mounted = true;
    this.parseHtml();
  }

  async parseHtml() {
    const { config, url, title, onError, errorPage } = this.props;
    //TODO: update proxyUrl in deployment
    const proxyUrl = "https://cors-anywhere.herokuapp.com/";

    try {
      const response = await fetch(proxyUrl + url);
      console.log("response", response);
      const html = await response.text();
      const sanitized = sanitizeHtml(html);
      const doc = new JSDOM(sanitized, { url: proxyUrl + url });
      let reader = new Readability(doc.window.document);
      let readabilityArticle = reader.parse();
      this.setState({ title: readabilityArticle.title });
      this.mounted &&
        this.setState({
          cleanHtmlSource: !readabilityArticle
            ? errorPage || `<h1>Sorry, issue parsing ${url}</h1>`
            : readabilityArticle.content,
        });
    } catch (e) {
      console.error(e);
      if (onError) {
        this.mounted && onError(e);
      }
    }
  }

  handleMouseUp() {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const surroundEl = document.createElement("span");
      const contents = range.extractContents();
      // instead of using surround, we do this in order to allow the user to select
      // more than just one text node
      console.log(contents);

      surroundEl.appendChild(contents);
      surroundEl.style.backgroundColor = "#ffcc80";
      range.insertNode(surroundEl);
      // use selection.toString to extract the text iself.
      console.log(selection.toString());
    }
  }

  render() {
    const {
      containerStyle,
      loadingContainerStyle,
      titleStyle,
      indicatorProps,
      renderLoader,
      title,
    } = this.props;
    const cleanHtmlSource = this.state && this.state.cleanHtmlSource;

    //TODO: turn title into a link to original content
    return (
      <View style={[styles.viewContainer, containerStyle]}>
        {!cleanHtmlSource ? (
          renderLoader ? (
            renderLoader
          ) : (
            <View
              testID="reader-loader"
              style={[
                styles.flex,
                styles.loadingContainer,
                loadingContainerStyle,
              ]}
            >
              <ActivityIndicator {...indicatorProps} />
            </View>
          )
        ) : (
          <ScrollView
            style={[styles.flexContent, { flex: 5 }]}
            testID="reader-body"
          >
            {this.state.title ? (
              <Text testID="reader-title" style={[styles.title, titleStyle]}>
                {this.state.title}
              </Text>
            ) : null}
            <HTMLView
              value={cleanHtmlSource}
              rootComponentProps={{ onMouseUp: this.handleMouseUp }}
              {...this.props}
            />
          </ScrollView>
        )}

        <ScrollView style={{ flex: 1 }}></ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: "600",
  },
  viewContainer: {
    flex: 1,
    flexDirection: "row",
    alignContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 100,
    flexBasis: "60%",
  },
  container: {
    paddingHorizontal: 8,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  flexContent: {
    flex: 6,
  },
  flexGrotto: {
    flex: 4,
  },
});

export default ReaderView;

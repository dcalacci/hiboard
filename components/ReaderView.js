import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableHighlight,
} from "react-native";
import HTMLView from "react-native-htmlview";
import Spinner from "./Spinner";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "JSDOM";

const modalStyle = {
  position: "fixed",
  top: "10%",
  left: "10%",
  width: "80%",
  height: "20%",
  padding: 10,
  backgroundColor: "#ffffff",
  borderWidth: "5px",
  borderColor: "black",
};

const modalInputStyle = {
  fontSize: 24,
  padding: 5,
  fontWeight: "600",
  fontFamily: "HelveticaNeue",
};

const Modal = ({ handleClose, handleCancel, show, highlight, children }) => {
  const showHideStyle = show ? { display: "block" } : { display: "none" };

  if (highlight) {
    return (
      <View style={[showHideStyle, modalStyle]}>
        {children}
        <View style={[styles.modalMenuStyle]}>
          <TouchableHighlight onPress={handleClose}>
            <Text style={[modalInputStyle]}>Close</Text>
          </TouchableHighlight>

          <TouchableHighlight onPress={handleCancel}>
            <Text style={[modalInputStyle]}>Cancel</Text>
          </TouchableHighlight>
        </View>
      </View>
    );
  } else {
    return null;
  }
};

const ReaderView = ({ url }) => {
  const [cleanHtml, setCleanHtml] = useState("");
  const [title, setTitle] = useState("");
  const [articleDetails, setArticleDetails] = useState({});
  const [showGrotto, setGrottoShowing] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    showing: false,
    highlightIndex: 0,
  });
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    // parse HTML and turn into reader mode when URL changes
    parseHtml();
  }, [url]);

  useEffect(() => {
    getHighlightNotes(highlights.length - 1);
  }, [highlights]);

  const getHighlightNotes = (highlightIndex) => {
    setModalInfo({ highlightIndex, showing: true });
  };
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const surroundEl = document.createElement("span");
      const attrId = `${Date.now()}`;
      surroundEl.setAttribute("id", attrId);
      const contents = range.extractContents();
      // instead of using surround, we do this in order to allow the user to select
      // more than just one text node
      surroundEl.appendChild(contents);
      surroundEl.style.backgroundColor = "#ffcc80";
      range.insertNode(surroundEl);
      // use selection.toString to extract the text iself.
      const newHighlight = {
        text: selection.toString(),
        html: contents,
        date: new Date(),
        spanId: attrId,
        notes: "",
        saved: false,
      };
      setHighlights([newHighlight, ...highlights]);
      // modal will get the highlight to select from index
    }
  };

  const parseHtml = async () => {
    console.log("parsing html...");
    try {
      const response = await fetch(url);
      console.log("response", response);
      const html = await response.text();
      // const sanitized = sanitizeHtml(html);
      const doc = new JSDOM(html, { url: url });
      let reader = new Readability(doc.window.document);
      let readabilityArticle = reader.parse();
      setArticleDetails(readabilityArticle);
      setTitle(readabilityArticle.title);
      setCleanHtml(readabilityArticle.content);
    } catch (e) {
      console.error(e);
    }
  };
  const cancelHighlight = () => {
    setModalInfo({ ...modalInfo, showing: false });
    const spanEl = document.getElementById(highlights[0].spanId);
    spanEl.style.backgroundColor = "#ffffff";

    setHighlights(highlights.slice(1));
  };

  //TODO: turn title into a link to original content
  return (
    <View style={[styles.viewContainer]}>
      {!cleanHtml ? (
        <Spinner />
      ) : (
        <>
          <ScrollView
            style={[styles.flexContent, { flex: 5 }]}
            testID="reader-body"
          >
            {title ? (
              <Text testID="reader-title" style={[styles.title]}>
                {title}
              </Text>
            ) : null}
            {articleDetails ? (
              <Text style={[styles.author]}>{articleDetails.byline}</Text>
            ) : null}
            <HTMLView
              stylesheet={articleStyles}
              value={cleanHtml}
              rootComponentProps={{ onMouseUp: handleMouseUp }}
            />
          </ScrollView>
          <Modal
            show={modalInfo.showing}
            handleClose={() => setModalInfo({ ...modalInfo, showing: false })}
            handleCancel={() => cancelHighlight()}
            highlight={highlights[modalInfo.highlightIndex]}
          >
            <TextInput
              style={styles.textInputStyle}
              multiline
              numberOfLines={4}
              editable
              autoFocus={true}
              onKeyPress={(e) => {
                // enter automatically closes
                if (e.key == "Enter") {
                  setModalInfo({ ...modalInfo, showing: false });
                }
              }}
              onChangeText={(text) => {
                const i = modalInfo.highlightIndex;
                // some fancy spreading and destructuring to
                // inject our notes
                setHighlights([
                  ...highlights.slice(0, i),
                  { ...highlights[i], notes: text },
                  ...highlights.slice(i + 1),
                ]);
              }}
            ></TextInput>
          </Modal>
        </>
      )}

      {showGrotto ? <ScrollView style={{ flex: 1 }}></ScrollView> : <></>}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: "600",
  },
  author: {
    fontSize: 18,
    fontWeight: "400",
    textDecorationLine: "underline",
  },
  modalMenuStyle: {
    flex: 1,
    flexDirection: "row",
    alignContent: "space-between",
  },
  viewContainer: {
    flex: 1,
    flexDirection: "row",
    alignContent: "center",
    maxWidth: "850px",
    paddingHorizontal: 20,
    paddingVertical: 100,
    flexBasis: "60%",
  },
  textInputStyle: {
    borderWidth: 3,
    width: "100%",
    padding: 2,
    borderColor: "black",
    fontSize: 24,
    fontWeight: "600",
    fontFamily: "HelveticaNeue",
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
    margin: 20,
  },
  flexGrotto: {
    flex: 4,
  },
});

const articleStyles = {
  p: {
    margin: 10,
    fontSize: 24,
    // fontFamily: "Verdana",
    fontFamily: "Helvetica Neue",
    fontWeight: "400",
    lineHeight: "150%",
  },
};

export default ReaderView;

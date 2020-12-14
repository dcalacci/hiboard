import React, { Component } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/lib/pdf";
import PdfjsWorker from "pdfjs-dist/lib/pdf.worker";

setPdfWorker(PdfjsWorker);

export function setPdfWorker(workerSrcOrClass) {
  if (typeof window !== "undefined") delete window.pdfjsWorker;
  delete GlobalWorkerOptions.workerSrc;
  delete GlobalWorkerOptions.workerPort;

  if (typeof workerSrcOrClass === "string") {
    GlobalWorkerOptions.workerSrc = workerSrcOrClass;
  } else if (typeof workerSrcOrClass === "function") {
    GlobalWorkerOptions.workerPort = workerSrcOrClass();
  } else if (workerSrcOrClass instanceof Worker) {
    GlobalWorkerOptions.workerPort = workerSrcOrClass;
  } else if (typeof window !== "undefined" && workerSrcOrClass) {
    window.pdfjsWorker = workerSrcOrClass;
  }
}

class PdfLoader extends Component {
  state = {
    pdfDocument: null,
    error: null,
  };

  documentRef = React.createRef();

  componentDidMount() {
    console.log("Component mounting...");
    this.load();
  }

  componentWillUnmount() {
    const { pdfDocument: discardedDocument } = this.state;
    if (discardedDocument) {
      discardedDocument.destroy();
    }
  }

  componentDidUpdate({ url }) {
    if (this.props.url !== url) {
      this.load();
    }
  }

  componentDidCatch(error, info) {
    const { onError } = this.props;

    if (onError) {
      onError(error);
    }

    this.setState({ pdfDocument: null, error });
  }

  load() {
    const { ownerDocument = document } = this.documentRef.current || {};
    const { url } = this.props;
    const { pdfDocument: discardedDocument } = this.state;
    this.setState({ pdfDocument: null, error: null });
    const gd = url && getDocument({ url, ownerDocument });
    console.log("Getting document...", gd);
    console.log(gd.promise);
    // gd.promise
    //   .then((pdfDocument) => {
    //     this.setState({ pdfDocument });
    //   })
    //   .catch((e) => {
    //     console.log("caught error:", e);
    //     this.componentDidCatch(e);
    //   });

    Promise.resolve()
      .then(() => discardedDocument && discardedDocument.destroy())
      .then(
        () =>
          url &&
          getDocument({ url, ownerDocument }).promise.then((pdfDocument) => {
            console.log("pdf:", pdfDocument);
            this.setState({ pdfDocument });
          })
      )
      .catch((e) => this.componentDidCatch(e));
  }

  render() {
    const { children, beforeLoad } = this.props;
    const { pdfDocument, error } = this.state;

    console.log("rendering children with pdf document:", pdfDocument);

    return (
      <>
        <span ref={this.documentRef} />
        {error
          ? this.renderError()
          : !pdfDocument || !children
          ? beforeLoad
          : children(pdfDocument)}
      </>
    );
  }

  renderError() {
    const { errorMessage } = this.props;
    if (errorMessage) {
      return React.cloneElement(errorMessage, { error: this.state.error });
    }

    return null;
  }
}

export default PdfLoader;

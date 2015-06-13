// based on https://github.com/rarous/brackets-jsx/blob/cf2653505b2db92c5d8f8aa0fe68dc4774beefe5/main.js

var CodeMirror = require('codemirror')

CodeMirror.defineMode("jsx", function(config, parserConfig) {
  var jsMode = CodeMirror.getMode(config, "javascript");
  var xmlMode =  CodeMirror.getMode(config, {name: "xml", htmlMode: true});

  function js(stream, state) {
    if ((state.jsState.lastType == "operator"
         || state.jsState.lastType == "keyword c"
         || state.jsState.lastType == "=>"
         || /^[\[{}\(,;:]$/.test(state.jsState.lastType))
        && stream.match(/^<[a-zA-Z]+/i, false)) {
      state.token = xml;
      return xmlMode.token(stream, state.localState);
      state.localState = xmlMode.startState(jsMode.indent(state.jsState, ""));
      state.localMode = xmlMode;
      state.indented = stream.backUp(1);
      return xml(stream, state);
    }
    return jsMode.token(stream, state.jsState);;
  }

  function xml(stream, state) {
    var oldContext = state.localState.context
    var style = xmlMode.token(stream, state.localState);
    if(oldContext && !state.localState.context){
      state.token = js;
      return jsMode.token(stream, state.jsState);
    }
    return style
  }

  return {
    startState: function() {
      var state = jsMode.startState();
      var xmlState = xmlMode.startState();
      return {token: js, localState: xmlState, jsState: state};
    },

    copyState: function(state) {
      return {token: state.token,
              localState: CodeMirror.copyState(xmlMode, state.localState),
              jsState: CodeMirror.copyState(jsMode, state.jsState)};
    },

    token: function(stream, state) {
      return state.token(stream, state);
    },

    indent: function(state, textAfter) {
      if (state.token == js)
        return jsMode.indent(state.jsState, textAfter);
      else
        return xmlMode.indent(state.localState, textAfter);
    },
    blockCommentStart: "/*",
    blockCommentEnd: "*/",
    lineComment: "//",
    fold: "brace",
    closeBrackets: "()[]{}''\"\"``",
    electricChars: "/{}:"
  };
});

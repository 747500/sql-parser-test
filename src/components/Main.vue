<script setup lang="ts">
import { Parser, type AST } from 'node-sql-parser';
import { parse, toSql, type Statement } from 'pgsql-ast-parser';
import { format } from 'sql-formatter';
// import { EditorView } from 'codemirror';
// import { Facet } from '@codemirror/state';
import { ref } from 'vue';
import 'codemirror/mode/sql/sql';

import { JsonViewer } from 'vue3-json-viewer';
import "vue3-json-viewer/dist/index.css";

// defineProps<{ msg: string }>()

type ParserInfoItem = {
  id: "node-sql-parser" | "pgsql-ast-parser"
  makeIt: (data: string) => void;
};

const parserList: ParserInfoItem[] = [
{
  id: 'node-sql-parser',
  makeIt: (data: string) => {
    const parser = new Parser()
    ast.value = parser.astify(data, { database: 'postgresql'});
    msgRight.value = parser.sqlify(ast.value, { database: 'postgresql'});  
  }
},
{
  id: 'pgsql-ast-parser',
  makeIt: (data: string) => {
    ast.value = parse(data);
    msgRight.value = ast.value.map((stmnt) => toSql.statement(stmnt)).reduce((prev, curr) => prev + curr, '');
  }
},
];

const msgLeft = ref<string>('');

setTimeout(() => msgLeft.value = 'SELECT NOW();', 1);

const msgRight = ref<string | undefined>();
const msgErr = ref<string | undefined>();
const ast = ref<AST | AST[] | Statement[] | undefined>()
const parserType = ref<'pgsql-ast-parser' | 'node-sql-parser'>('pgsql-ast-parser');

const cmOptions = ref({
    // mode: "text/plain",
    mode: "text/x-pgsql",
    theme: 'default',
    lineNumbers: true, // Show line number
    smartIndent: true, // Smart indent
    indentUnit: 2, // The smart indent unit is 2 spaces in length
    autofocus: true,
    foldGutter: false, // Code folding
    styleActiveLine: true, // Display the style of the selected row
});

// const baseTheme = EditorView.baseTheme({
//   "&light .cm-zebraStripe": {backgroundColor: "#d4fafa"},
//   "&dark .cm-zebraStripe": {backgroundColor: "#1a2727"}
// })

// const stepSize = Facet.define<number, number>({
//   combine: values => values.length ? Math.min(...values) : 2
// })

let changeDelay: NodeJS.Timeout | undefined;

function onChange(data: string, force?: boolean) {
  if (changeDelay) {
    clearTimeout(changeDelay);
  }

  changeDelay = setTimeout(() => {
    clearTimeout(changeDelay);

    try {
      for (const pi of parserList) {
        if (pi.id === parserType.value) {
          pi.makeIt(data);
        }
      }

      // switch (parserType.value) {
      //   case 'node-sql-parser':
      //     const parser = new Parser()
      //     ast.value = parser.astify(data, { database: 'postgresql'});
      //     msgRight.value = parser.sqlify(ast.value, { database: 'postgresql'});
      //     break;

      //   case 'pgsql-ast-parser':
      //     ast.value = parse(data);
      //     msgRight.value = ast.value.map((stmnt) => toSql.statement(stmnt)).reduce((prev, curr) => prev + curr, '');
      //     break;
      // }

      msgErr.value = undefined;
    } catch (e: any) {
      msgErr.value = e.toString();
    }

    try {
      msgRight.value = format(msgRight.value || '', { language: 'postgresql' });
    } catch (e) {
      console.log(e)
    }

  }, force ? 1 : 1000);

}

function onParserChange(ev: Event, pi: ParserInfoItem) {
  parserType.value = pi.id;
  onChange(msgLeft.value, true);
}

</script>

<template lang="pug">
div.top.container
  div
    form
      div(v-for="parserInfo in parserList")
        input(
          type="radio" name="parserType"
          :id="parserInfo.id"
          @change="(ev) => onParserChange(ev, parserInfo)"
          checked
        )
        label(:for="parserInfo.id") {{ parserInfo.id }}
  div(style="text-align: center") AST
  div(style="text-align: center") SQLify + Formatter

div.content.container
  div(style="overflow: hidden;")
    Codemirror(
        v-model:value="msgLeft"
        :options="cmOptions"
        border
        placeholder="test placeholder"
        @change="onChange"
    )
  div
    JsonViewer(
      v-show="!msgErr"
      :value="ast || {}"
      theme="dark"
      :expanded="true"
      :expandDepth="10"
    )
    //- pre(v-show="!msgErr") {{ JSON.stringify(ast, undefined, 4) }}
  div
    pre(v-show="!msgErr") {{ msgRight }}
    pre(v-show="!!msgErr") {{ msgErr }}
</template>

<style scoped>

.container {
  display: flex;
  width: 95vw;
}

.top.container {
  border-bottom: 3px solid gold;
}

.top.container > div {
  flex: 1;
  padding: .33em 0;
  align-content: center;
}

.content.container {
  height: 85vh;
}

.container > div {
  flex: 1;
  margin: 0 .33em;
  overflow: auto;
  background-color: rgba(255, 255, 255, 0.1);
}
.container > div pre{
  overflow-y: scroll;
}

pre {
  margin: 0;
  padding: .33em
}

label:hover {
  color: gold;
  cursor: pointer;
}

.jv-container {
  font-size: 12px;
  /* padding: 0; */
}

.jv-code {
  height: 100%;
}

/* input[type='radio'] { */
input {
  accent-color: gold;
}
</style>

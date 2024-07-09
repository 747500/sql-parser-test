<script setup lang="ts">
import { Parser } from 'node-sql-parser';
import { parse, toSql, type Statement } from 'pgsql-ast-parser';
import { format } from 'sql-formatter';
// import { EditorView } from 'codemirror';
// import { Facet } from '@codemirror/state';
import { computed, ref } from 'vue';
import 'codemirror/mode/sql/sql';

import { JsonViewer } from 'vue3-json-viewer';
import "vue3-json-viewer/dist/index.css";

// defineProps<{ msg: string }>()

type ParserInfoItem = {
  id: string
  toAst: (data: string) => any;
  toString: () => string;
};

const parserList: ParserInfoItem[] = [
  {
    id: 'node-sql-parser',
    toString: () => {
      const parser = new Parser()
      return format(
        parser.sqlify(
          msgAst.value,
          { database: 'postgresql'}
        ),
        { language: 'postgresql' }
      );
    },
    toAst: (data: string) => {
      const parser = new Parser()
      return parser.astify(
        data,
        { database: 'postgresql'}
      );
    }
  },
  {
    id: 'pgsql-ast-parser',
    toString: () => msgAst.value
        .map((stmnt: Statement) => format(
          toSql.statement(stmnt),
          { language: 'postgresql' }
        ))
        .reduce((prev: string, curr: string) => `${prev}${curr};\n`, ''),
    toAst: (data: string) => parse(data),
  },
];

typeof parserList

const parserType = ref<typeof parserList[number]['id']>('pgsql-ast-parser');

const msgLeft = ref<string>('SELECT NOW();');

const msgRight = computed(() => {
  const parser = parserList.find((item) => item.id === parserType.value);

  if (!parser) {
    throw new Error(`${parserType.value} was not found`);
  }

  return parser.toString();
});

const msgAst = computed(() => {
  const parser = parserList.find((item) => item.id === parserType.value);

  if (!parser) {
    throw new Error(`${parserType.value} was not found`);
  }

  return parser.toAst(msgLeft.value);
})

const msgErr = ref<string | undefined>();

const cmOptions = ref({
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

</script>

<template lang="pug">
div.top.container
  div
    form
      div(v-for="parserInfo in parserList")
        input(
          v-model="parserType"
          type="radio"
          name="parserType"
          :value="parserInfo.id"
          :id="parserInfo.id"
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
    )
  div(style="background-color: rgb(40, 44, 52)")
    JsonViewer(
      v-show="!msgErr"
      :value="msgAst || {}"
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
  width: 100%;
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
  /* height: 100%; */
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

<script setup>
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { computed } from 'vue'

const props = defineProps({
  tex: {
    type: String,
    required: true,
  },
})

const html = computed(() =>
  katex.renderToString(props.tex, {
    displayMode: true,
    throwOnError: false,
    output: 'htmlAndMathml',
  }),
)
</script>

<template>
  <div class="katex-formula" v-html="html" />
</template>

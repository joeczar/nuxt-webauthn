<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  inputType?: string
  placeholder?: string
  buttonText?: string
}>(), {
  inputType: 'email',
  placeholder: 'Enter your email',
  buttonText: 'Submit'
})

const emit = defineEmits<{
  (e: 'submit', value: string): void
}>()

const input = ref('')

function handleSubmit() {
  emit('submit', input.value)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input
        v-model="input"
        :type="inputType"
        required
        :placeholder="placeholder"
    >
    <button type="submit">{{ buttonText }}</button>
  </form>
</template>
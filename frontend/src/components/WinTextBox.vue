<script setup>
/**
 * WinTextBox - WinUI 3 风格文本框组件
 *
 * 用法：
 *   <WinTextBox v-model:Text="myVar" Header="用户名" PlaceholderText="请输入" />
 *   <WinTextBox v-model:Text="myVar" IsPassword />
 *   <WinTextBox v-model:Text="myVar" IsMultiline Rows="4" />
 */

const props = defineProps({
  Text: { type: [String, Number], default: '' },
  Header: { type: String, default: '' },
  PlaceholderText: { type: String, default: '' },
  IsPassword: { type: Boolean, default: false },
  IsMultiline: { type: Boolean, default: false },
  Rows: { type: [Number, String], default: 2 },
  IsReadOnly: { type: Boolean, default: false },
  Disabled: { type: Boolean, default: false },
  MaxLength: { type: [Number, String], default: null },
  Type: { type: String, default: 'text' },
})

const emit = defineEmits(['update:Text'])

function onInput(e) {
  emit('update:Text', e.target.value)
}
</script>

<template>
  <div class="win-textbox-group">
    <label v-if="Header" class="win-textbox-label">{{ Header }}</label>
    <textarea
      v-if="IsMultiline"
      class="win-textarea"
      :value="Text"
      :placeholder="PlaceholderText"
      :rows="Number(Rows)"
      :readonly="IsReadOnly"
      :disabled="Disabled"
      :maxlength="MaxLength ? Number(MaxLength) : undefined"
      @input="onInput"
    ></textarea>
    <input
      v-else
      class="win-textbox"
      :type="IsPassword ? 'password' : Type"
      :value="Text"
      :placeholder="PlaceholderText"
      :readonly="IsReadOnly"
      :disabled="Disabled"
      :maxlength="MaxLength ? Number(MaxLength) : undefined"
      @input="onInput"
    />
  </div>
</template>
<template>
  <div>
    <h1>Test Component:</h1>
    <MyComponent />
  </div>
</template>

<script>
import externalComponent from "vue-external-component";

const MyComponent = () =>
  externalComponent(`http://localhost:8200/MyComponent/test.umd.min.js`);

export default {
  name: `App`,
  components: {
    MyComponent,
  },
};
</script>

<style>
</style>

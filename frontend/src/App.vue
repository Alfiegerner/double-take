<template>
  <div class="wrapper">
    <Toast position="bottom-left" />
    <ConfirmDialog />
    <!-- <Navigation /> -->
    <router-view />
  </div>
</template>

<script>
import 'primevue/resources/themes/bootstrap4-dark-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '@/assets/font-awesome/css/all.min.css';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
// import Navigation from '@/components/Navigation.vue';

export default {
  name: 'App',
  components: {
    Toast,
    ConfirmDialog,
    // Navigation,
  },
  data() {
    return {
      info: null,
    };
  },
};
</script>

<style lang="scss">
html {
  font-size: 15px;
}
body {
  margin: 0;
  background: var(--surface-b);
  color: var(--text-color);
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
    'Segoe UI Emoji', 'Segoe UI Symbol';
}

.p-toast .p-toast-message-content {
  align-items: center;
}

.p-toast .p-toast-detail {
  margin-top: 0 !important;
}

@media only screen and (max-width: 576px) {
  .p-toast {
    width: auto;
    right: 20px;
  }
}

.p-dialog.p-confirm-dialog {
  .p-confirm-dialog-message {
    text-align: center;
    margin-left: 0;
  }
}

.p-multiselect-panel .p-multiselect-items {
  font-size: 0.9rem;
}
</style>

<style scoped lang="scss">
.wrapper {
  max-width: 1000px;
  margin: auto;
}
</style>

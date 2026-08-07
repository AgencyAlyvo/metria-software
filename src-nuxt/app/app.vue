<template>
  <UApp :locale="fr">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script lang="ts" setup>
import { fr } from '@nuxt/ui/locale'
</script>

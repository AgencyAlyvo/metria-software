<template>
  <div class="flex h-screen flex-col bg-[#0a1120] text-slate-200">
    <WindowBar>
      <img class="h-5 select-none" src="/logo-metria.png" alt="Metria" draggable="false" />
    </WindowBar>

    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>

<template>
  <div class="flex h-screen flex-col bg-[#0a1120] text-slate-200">
    <WindowBar>
      <span class="text-sm font-semibold tracking-wide text-white">Metria</span>
    </WindowBar>

    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>

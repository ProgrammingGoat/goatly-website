<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <main class="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-20 sm:px-8">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

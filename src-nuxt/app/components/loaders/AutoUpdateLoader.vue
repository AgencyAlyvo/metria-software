<template>
  <span class="loader" aria-label="Checking for updates"></span>
</template>

<style scoped>
.loader {
  transform: rotateZ(45deg);
  perspective: 1000px;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: #fff;
  margin: 10px 0;
}

.loader::before,
.loader::after {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: inherit;
  height: inherit;
  border-radius: 50%;
  transform: rotateX(70deg);
  animation: 1s spin linear infinite;
}

.loader::after {
  color: #2fb7ff;
  transform: rotateY(70deg);
  animation-delay: 0.4s;
}

@keyframes spin {
  0%,
  100% {
    box-shadow: 0.2em 0 0 0 currentcolor;
  }

  12% {
    box-shadow: 0.2em 0.2em 0 0 currentcolor;
  }

  25% {
    box-shadow: 0 0.2em 0 0 currentcolor;
  }

  37% {
    box-shadow: -0.2em 0.2em 0 0 currentcolor;
  }

  50% {
    box-shadow: -0.2em 0 0 0 currentcolor;
  }

  62% {
    box-shadow: -0.2em -0.2em 0 0 currentcolor;
  }

  75% {
    box-shadow: 0 -0.2em 0 0 currentcolor;
  }

  87% {
    box-shadow: 0.2em -0.2em 0 0 currentcolor;
  }
}
</style>

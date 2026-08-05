<template>
  <button
    class="settings-btn"
    @click="handleClick"
    :title="title"
    :class="{ 'settings-btn--fixed': fixed }"
  >
    <span class="settings-icon">⚙️</span>
  </button>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Ajustes',
  },
  fixed: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.settings-btn {
  all: unset;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(138, 0, 255, 0.15);
  border: 2px solid rgba(138, 0, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 200ms ease;
  position: relative;
  z-index: 50;
}

.settings-btn:hover {
  background: rgba(138, 0, 255, 0.25);
  border-color: rgba(138, 0, 255, 0.7);
  transform: scale(1.1) rotate(15deg);
}

.settings-btn:active {
  transform: scale(0.95);
}

.settings-btn--fixed {
  position: fixed;
  bottom: 30px;
  right: 30px;
}

.settings-icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 3s linear infinite;
  animation-play-state: paused;
}

.settings-btn:hover .settings-icon {
  animation-play-state: running;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .settings-btn {
    width: 45px;
    height: 45px;
  }

  .settings-btn--fixed {
    bottom: 20px;
    right: 20px;
  }

  .settings-icon {
    font-size: 20px;
  }
}
</style>

<template>
  <div class="room-modal-overlay">
    <div class="room-modal">
      <h2>CREATE ROOM</h2>
      <form @submit.prevent="handleCreateRoom">
        <div class="form-group">
          <label>Room Name:</label>
          <input v-model="roomName" type="text" placeholder="My Battle Arena" />
        </div>

        <div class="form-group">
          <label>Opponent:</label>
          <select v-model="opponentType">
            <option value="bot">Play vs Bot</option>
            <option value="player">Play vs Player (LAN)</option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-create">CREATE</button>
          <button type="button" class="btn-cancel" @click="emit('cancel')">CANCEL</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['room-created', 'cancel']);

const roomName = ref('');
const opponentType = ref('bot');

const handleCreateRoom = () => {
  const roomData = {
    name: roomName.value || 'Battle Arena',
    opponentType: opponentType.value,
    createdAt: new Date()
  };
  
  emit('room-created', roomData);
};
</script>

<style scoped>
.room-modal-overlay {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
}

.room-modal {
  background: rgba(20, 18, 17, 0.95);
  border: 1px solid rgba(138, 117, 102, 0.22);
  padding: 40px;
  border-radius: 6px;
  width: 400px;
}

.room-modal h2 {
  color: #ffaba2;
  text-align: center;
  margin-bottom: 30px;
  font-family: 'Cinzel', serif;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #8a7566;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  background: #090807;
  border: 1px solid rgba(138, 117, 102, 0.25);
  border-radius: 4px;
  color: #e8d6c7;
  font-family: 'Montserrat', sans-serif;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn-create {
  flex: 1;
  padding: 12px;
  background: #ff5b26;
  color: #1b1816;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-family: 'Cinzel', serif;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  background: transparent;
  color: #8a7566;
  border: 1px solid #8a7566;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
}

.btn-cancel:hover {
  border-color: #ffaba2;
  color: #ffaba2;
}
</style>

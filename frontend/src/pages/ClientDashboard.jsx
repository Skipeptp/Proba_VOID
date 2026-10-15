import React, { useState } from 'react';
import ScheduleList from '../components/ScheduleList';
import { apiRequest } from '../api';

export default function ClientDashboard() {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  async function handleBook() {
    if (!selected) return;
    const clientId = 1; // TODO: получить из профиля клиента
    try {
      await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({ schedule_id: selected.id, client_id: clientId }),
      });
      setMessage('Вы успешно записаны');
    } catch (e) {
      setMessage(e.message);
    }
  }

  return (
    <main>
      <h1>Личный кабинет клиента</h1>
      <ScheduleList onSelect={setSelected} />
      {selected && (
        <div>
          <p>Выбрано занятие id {selected.id}</p>
          <button onClick={handleBook}>Подтвердить запись</button>
        </div>
      )}
      {message && <p>{message}</p>}
    </main>
  );
}

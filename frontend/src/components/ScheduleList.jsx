import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api';

export default function ScheduleList({ onSelect }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    apiRequest('/schedule')
      .then(setItems)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Расписание тренировок</h2>
      <ul>
        {items.map(s => (
          <li key={s.id}>
            {s.weekday} {s.start_time} - {s.end_time} {s.workout_name} ({s.hall_name})
            <button onClick={() => onSelect(s)}>Записаться</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

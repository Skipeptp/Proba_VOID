import React, { useState } from 'react';
import { useAuth } from '../authContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(form.login, form.password);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main>
      <h1>Вход в систему</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Логин
          <input
            value={form.login}
            onChange={e => setForm({ ...form, login: e.target.value })}
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Войти</button>
      </form>
    </main>
  );
}

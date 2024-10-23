import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login/Login';
import Dashboard from './dashboard/Dashboard';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redireciona a rota inicial "/" para a página de login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rota para a página de login */}
        <Route path="/login" element={<Login />} />

        {/* Rota protegida para o dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Ir adicionando outras rotas protegidas aqui */}
      </Routes>
    </Router>
  );
}

export default App;

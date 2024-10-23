import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        navigate('/login');  // Redireciona para a tela de login se não estiver autenticado
      }
      setLoading(false);
    });

    return () => unsubscribe();  // Cleanup listener on unmount
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;  // Ou um spinner
  }

  return authenticated ? children : null;
};

export default PrivateRoute;
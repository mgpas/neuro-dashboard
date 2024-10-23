import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CssBaseline from '@mui/material/CssBaseline';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para buscar dados da API
  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/data'); // Requisição para a API
      setData(response.data); // Salva os dados no estado
      setLoading(false); // Indica que terminou de carregar
    } catch (err) {
      setError('Erro ao buscar dados da API: ' + err.message);
      setLoading(false);
    }
  };

  // Faz a chamada à API quando o componente for montado
  useEffect(() => {
    fetchData();
  }, []); // O array vazio significa que a chamada será feita apenas uma vez, ao montar o componente

  if (loading) {
    return <p>Carregando dados...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : theme.palette.background.default,
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <MainGrid data={data} /> {/* Passa os dados para o MainGrid */}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
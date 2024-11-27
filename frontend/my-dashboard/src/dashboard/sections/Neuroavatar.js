import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import { LineChart } from '@mui/x-charts/LineChart';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Neuroavatar() {
  const [AtividadeMes, setAtividadeMes] = useState([]);
  const [SessionMes, setSessionMes] = useState([]);
  const [sessionValueTotal, setSessionValueTotal] = useState(0);
  const [sessionDurationTotal, setSessionDurationTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);  // Novo estado para contar as sessões

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/sessionAvatar');
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        let sessionAvatarData;
        try {
          sessionAvatarData = await response.json();
        } catch (jsonError) {
          const rawText = await response.text();
          console.error('Erro ao parsear JSON. Resposta bruta:', rawText);
          throw new Error('A resposta da API não está em formato JSON.');
        }

        const sessionsArray = Object.values(sessionAvatarData);
        setTotalSessions(sessionsArray.length);  // Atualiza o estado com o número de sessões

        const atividadeMensal = {};
        let totalValue = 0;
        let totalSessionDuration = 0;

        sessionsArray.forEach((session) => {
          const updatedAt = new Date(session.updated_at);
          const month = updatedAt.getMonth();
          
          if (!atividadeMensal[month]) atividadeMensal[month] = { avatar_value: 0, session_value: 0, count: 0, total_duration: 0 };

          atividadeMensal[month].avatar_value += session.avatar_value || 0;
          atividadeMensal[month].session_value += session.session_value || 0;
          atividadeMensal[month].count += 1;
          atividadeMensal[month].total_duration += session.session_duration || 0;

          totalValue += session.session_value || 0;
          totalSessionDuration += session.session_duration || 0;
        });

        const chartDataAvatarValue = Object.keys(atividadeMensal).map((monthIndex) => ({
          month: monthNames[monthIndex],
          avatar_value: atividadeMensal[monthIndex].avatar_value / atividadeMensal[monthIndex].count,
        }));

        const chartDataSessionValue = Object.keys(atividadeMensal).map((monthIndex) => ({
          month: monthNames[monthIndex],
          session_value: atividadeMensal[monthIndex].session_value / atividadeMensal[monthIndex].count,
        }));

        setAtividadeMes(chartDataAvatarValue);
        setSessionMes (chartDataSessionValue);
        setSessionValueTotal(totalValue);
        setSessionDurationTotal(totalSessionDuration);
      } catch (error) {
        console.error('Erro ao buscar dados:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const months = AtividadeMes.map((data) => data.month);
  const avatarValues = AtividadeMes.map((data) => data.avatar_value);
  const sessionValues = SessionMes.map((data) => data.session_value);

  // Converte o total de duração de sessão em segundos para formato hh:mm
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, textAlign: 'center' }}>
      {loading ? (
        <Typography variant="h6">Carregando...</Typography>
      ) : (
        <>
          <Grid
            container
            spacing={1}
            columns={12}
            sx={{ mb: (theme) => theme.spacing(2), height: '100vh', display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}
          >
            <Grid container item xs={1} sm={4} lg={6} justifyContent="center" alignContent="space-between" sx={{ display: 'flex' }}>
            {/* Box 1: Média de session_value total */}
              <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper' }}>
                <Typography variant="h6">Média de Atividade Cerebral</Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {((sessionValueTotal / totalSessions) || 0).toFixed(2)}%
                </Typography>
              </Box>

            {/* Box 2: Duração Total */}
              <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper' }}>
                <Typography variant="h6">Duração Total</Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {formatDuration(sessionDurationTotal)}
                </Typography>
              </Box>
          </Grid>

          {/* Gráficos */}
            {/* Gráfico 1: avatar_value */}
            <Grid container item xs={12}>
            <Box sx={{ p: 4, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                <Typography variant="h6">Pontuação de Sessão com Avatar</Typography>
                <LineChart
                  xAxis={[{
                    scaleType: 'band',
                    categoryGapRatio: 0.5,
                    data: months,
                  }]}
                  series={[{
                    id: 'avatar_value',
                    data: avatarValues,
                    stack: 'A',
                  }]}
                  height={250}
                  margin={{ left: 50, right: 10, top: 20, bottom: 20 }}
                  grid={{ horizontal: true }}
                />
              </Box>
              </Grid>

            {/* Gráfico 2: session_value */}
            <Grid container item xs={12}>
              <Box sx={{ p: 4, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                <Typography variant="h6">Evolução da Atividade Cerebral</Typography>
                <LineChart
                  xAxis={[{
                    scaleType: 'band',
                    categoryGapRatio: 0.5,
                    data: months,
                  }]}
                  series={[{
                    id: 'session_value',
                    data: sessionValues,
                    stack: 'B',
                  }]}
                  height={400}
                  margin={{ left: 50, right: 10, top: 20, bottom: 20 }}
                  grid={{ horizontal: true }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Copyright Section */}
          <Copyright sx={{ mt: 4 }} />
        </>
      )}
    </Box>
  );
}

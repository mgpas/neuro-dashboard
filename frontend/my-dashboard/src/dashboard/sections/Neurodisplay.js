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

export default function Neurodisplay() {
  const [AtividadeMes, setAtividadeMes] = useState([]);
  const [totalSessionDuration, setTotalSessionDuration] = useState({ hours: 0, minutes: 0 });
  const [AtividadeMedia, setAtividadeMedia] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/sessionMeditation');
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

        let sessionMeditation;
        try {
          sessionMeditation = await response.json();
        } catch (jsonError) {
          const rawText = await response.text();
          console.error('Erro ao parsear JSON. Resposta bruta:', rawText);
          throw new Error('A resposta da API não está em formato JSON.');
        }

        const sessionsArray = Object.values(sessionMeditation);

        const atividadeMensal = {};
        let totalValue = 0;
        let totalSessionCount = 0;
        let totalDuration = 0;

        sessionsArray.forEach((session) => {
          const updatedAt = new Date(session.updated_at);
          const month = updatedAt.getMonth();
          if (!atividadeMensal[month]) atividadeMensal[month] = { total: 0, count: 0 };
          atividadeMensal[month].total += session.session_value || 0;
          atividadeMensal[month].count += 1;
          totalValue += session.session_value || 0;
          totalDuration += session.session_duration || 0;
          totalSessionCount += 1;
        });

        const average = totalSessionCount > 0 ? totalValue / totalSessionCount : 0;
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);

        const chartData = Object.keys(atividadeMensal).map((monthIndex) => ({
          month: monthNames[monthIndex],
          activity: atividadeMensal[monthIndex].total / atividadeMensal[monthIndex].count,
        }));

        setAtividadeMes(chartData);
        setTotalSessionDuration({ hours, minutes });
        setAtividadeMedia(average.toFixed(2));
      } catch (error) {
        console.error('Erro ao buscar dados:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const months = AtividadeMes.map((data) => data.month);
  const activities = AtividadeMes.map((data) => data.activity);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {loading ? (
        <Typography variant="h6">Carregando...</Typography>
      ) : (
        <>
          {/* Boxes lado a lado */}
          <Grid
            container
            spacing={1}
            columns={12}
            sx={{ mb: (theme) => theme.spacing(2), height: '100vh', display: 'flex', justifyContent: 'flex-start', flexDirection: 'column' }}
          >
            <Grid container item xs={1} sm={4} lg={6} justifyContent="center" alignContent="space-between" sx={{ display: 'flex' }}>
            <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                <Typography variant="h6">Média de Atividade Cerebral</Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {AtividadeMedia}%
                </Typography>
              </Box>

              <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                <Typography variant="h6">Duração Total</Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {totalSessionDuration.hours}h {totalSessionDuration.minutes}m
                </Typography>
              </Box>
            </Grid>

          {/* Gráfico abaixo dos boxes */}
          <Grid container item xs={12}>
              <Box sx={{ p: 4, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Evolução da atividade cerebral
            </Typography>
            <LineChart
              xAxis={[
                {
                  scaleType: 'band',
                  categoryGapRatio: 0.5,
                  data: months,
                },
              ]}
              yAxis={[
                {
                  label: 'Atividade (%)',
                  labelProps: {
                    angle: -90,
                    textAnchor: 'middle',
                  },
                },
              ]}
              series={[
                {
                  id: 'activity',
                  data: activities,
                  stack: 'A',
                },
              ]}
              width={800}
              height={400}
              margin={{ left: 60, right: 10, top: 20, bottom: 20 }}
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

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import Copyright from '../internals/components/Copyright';

export default function Engajamento() {
  const [userCount, setUserCount] = useState(0);
  const [totalSessionDuration, setTotalSessionDuration] = useState(0);
  const [segmentData, setSegmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Função para buscar os dados da API (coleção sessionAvatar)
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/sessionAvatar'); // Altere a rota conforme necessário
        const sessionAvatars = await response.json();

        // Verifique a estrutura dos dados recebidos
        console.log(sessionAvatars);

        // Usando Set para garantir que contamos avatar_id distintos
        const userIds = new Set();
        let totalDuration = 0; // Variável para somar todas as durações
        const segmentDurations = {}; // Objeto para somar a duração por segmento

        // Itera sobre os objetos dentro da resposta
        for (const key in sessionAvatars) {
          if (sessionAvatars.hasOwnProperty(key)) {
            const session = sessionAvatars[key];
            if (session.user_id) {
              userIds.add(session.user_id); // Adiciona o avatar_id ao Set para garantir que sejam únicos
            }
            if (session.session_duration) {
              totalDuration += session.session_duration; // Soma a duração de cada sessão
            }
            if (session.segment) {
              // Somar a duração para cada segmento
              if (!segmentDurations[session.segment]) {
                segmentDurations[session.segment] = 0;
              }
              segmentDurations[session.segment] += session.session_duration;
            }
          }
        }

        // Converte segmentDurations para um formato que o gráfico entenda
        const chartData = Object.keys(segmentDurations).map(segment => ({
          segment,
          duration: segmentDurations[segment]
        }));

        // Calcula as horas e minutos
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);

        setUserCount(userIds.size); // O tamanho do Set será o número de avatar_ids distintos
        setTotalSessionDuration({ hours, minutes }); // Armazena as horas e minutos
        setSegmentData(chartData); // Atualiza os dados para o gráfico
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Preparando os dados para o gráfico
  const segmentNames = segmentData.map(segment => segment.segment);
  const durations = segmentData.map(segment => segment.duration);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, textAlign: 'center' }}>
      {/* Exibir carregamento enquanto busca dados */}
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
              {/* Box 1: Participantes Ativos */}
              <Box
                sx={{
                  p: 2,
                  boxShadow: 2,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  mb: 2, // Espaço entre os boxes
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Participantes Ativos
                </Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {userCount}
                </Typography>
              </Box>

              {/* Box 2: Tempo de Uso Total */}
              <Box
                sx={{
                  p: 2,
                  boxShadow: 2,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Tempo de Uso Total (h)
                </Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {totalSessionDuration.hours}h {totalSessionDuration.minutes}m
                </Typography>
              </Box>
            </Grid>     

          {/* Box 3: Gráfico de Barras abaixo das caixas */}
          <Grid container item xs={12}>
            <Box
              sx={{
                p: 4,
                boxShadow: 2,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                flexGrow: 1,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tempo de Uso - Neuroavatar
              </Typography>

              <BarChart
                borderRadius={8}
                xAxis={[
                  {
                    scaleType: 'band',
                    categoryGapRatio: 0.5,
                    data: segmentNames, // Usando os dados dinâmicos
                  },
                ]}
                series={[
                  {
                    id: 'duration',
                    label: 'Duração',
                    data: durations, // Usando os dados dinâmicos de duração
                    stack: 'A',
                  },
                ]}
                height={250}
                margin={{ left: 50, right: 10, top: 20, bottom: 20 }}
                grid={{ horizontal: true }}
                slotProps={{
                  legend: {
                    hidden: true,
                  },
                }}
              />
            </Box>
          </Grid>

          <Copyright sx={{ mt: 4 }} />
          </Grid>
        </>
      )}
    </Box>
  );
}

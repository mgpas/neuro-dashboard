import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BarChart } from '@mui/x-charts/BarChart';
import Copyright from '../internals/components/Copyright';

export default function Engajamento() {
  const [userCount, setUserCount] = useState(0);
  const [totalSessionDuration, setTotalSessionDuration] = useState({ hours: 0, minutes: 0 });
  const [avatarSegmentData, setAvatarSegmentData] = useState([]);
  const [meditationCategoryData, setMeditationCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let combinedDuration = 0; // Variável para armazenar a soma das durações

        // Fetch sessionAvatar
        const avatarResponse = await fetch('http://127.0.0.1:5000/api/sessionAvatar');
        const sessionAvatars = await avatarResponse.json();

        // Process sessionAvatar data
        const avatarUserIds = new Set();
        const avatarSegmentDurations = {};

        for (const key in sessionAvatars) {
          if (sessionAvatars.hasOwnProperty(key)) {
            const session = sessionAvatars[key];
            if (session.user_id) {
              avatarUserIds.add(session.user_id);
            }
            if (session.session_duration) {
              combinedDuration += session.session_duration; // Soma duração de avatar
            }
            if (session.segment) {
              if (!avatarSegmentDurations[session.segment]) {
                avatarSegmentDurations[session.segment] = 0;
              }
              avatarSegmentDurations[session.segment] += session.session_duration;
            }
          }
        }

        const avatarChartData = Object.keys(avatarSegmentDurations).map(segment => ({
          segment,
          duration: avatarSegmentDurations[segment] / 60, // Convert to minutes
        }));

        setUserCount(avatarUserIds.size);
        setAvatarSegmentData(avatarChartData);

        // Fetch sessionMeditation
        const meditationResponse = await fetch('http://127.0.0.1:5000/api/sessionMeditation');
        const sessionMeditations = await meditationResponse.json();

        // Process sessionMeditation data by "category"
        const meditationCategoryDurations = {};

        for (const key in sessionMeditations) {
          if (sessionMeditations.hasOwnProperty(key)) {
            const session = sessionMeditations[key];
            if (session.session_duration) {
              combinedDuration += session.session_duration; // Soma duração de meditação
            }
            if (session.category) {
              if (!meditationCategoryDurations[session.category]) {
                meditationCategoryDurations[session.category] = 0;
              }
              meditationCategoryDurations[session.category] += session.session_duration;
            }
          }
        }

        const meditationChartData = Object.keys(meditationCategoryDurations).map(category => ({
          category,
          duration: meditationCategoryDurations[category] / 60, // Convert to minutes
        }));

        setMeditationCategoryData(meditationChartData);

        // Converte a duração combinada total para horas e minutos
        const hours = Math.floor(combinedDuration / 3600);
        const minutes = Math.floor((combinedDuration % 3600) / 60);

        setTotalSessionDuration({ hours, minutes });
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const avatarSegmentNames = avatarSegmentData.map(data => data.segment);
  const avatarDurations = avatarSegmentData.map(data => data.duration);

  const meditationCategories = meditationCategoryData.map(data => data.category);
  const meditationDurations = meditationCategoryData.map(data => data.duration);

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
              {/* Box 1: Participantes Ativos */}
              <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Participantes Ativos
                </Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {userCount}
                </Typography>
              </Box>

              {/* Box 2: Tempo de Uso Total */}
              <Box sx={{ p: 2, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Tempo de Uso Total (h)
                </Typography>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {totalSessionDuration.hours}h {totalSessionDuration.minutes}m
                </Typography>
              </Box>
            </Grid>

            {/* Gráfico 1: Tempo de Uso - Neuroavatar */}
            <Grid container item xs={12}>
              <Box sx={{ p: 4, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tempo de Uso - Neuroavatar
                </Typography>

                <BarChart
                  borderRadius={8}
                  xAxis={[
                    {
                      scaleType: 'band',
                      categoryGapRatio: 0.5,
                      data: avatarSegmentNames,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Duração (minutos)', // Label vertical para o eixo Y
                      labelProps: {
                        angle: -90, // Rotação vertical
                        textAnchor: 'middle', // Centralizar o texto
                      },
                    },
                  ]}         
                  series={[
                    {
                      id: 'avatarDuration',
                      label: 'Duração (minutos)',
                      data: avatarDurations,
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

            {/* Gráfico 2: Tempo de Uso - Meditação */}
            <Grid container item xs={12}>
              <Box sx={{ p: 4, boxShadow: 2, borderRadius: 2, backgroundColor: 'background.paper', flexGrow: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tempo de Uso - Mindfullness
                </Typography>

                <BarChart
                  borderRadius={8}
                  xAxis={[
                    {
                      scaleType: 'band',
                      categoryGapRatio: 0.5,
                      data: meditationCategories,
                    },
                  ]}
                  yAxis={[
                    {
                      label: 'Duração (minutos)', 
                      labelProps: {
                        angle: -90, 
                        textAnchor: 'middle',
                      },
                    },
                  ]}
                  series={[
                    {
                      id: 'meditationDuration',
                      label: 'Duração (minutos)',
                      data: meditationDurations,
                      stack: 'B',
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
          </Grid>

          {/* Copyright Section */}
          <Copyright sx={{ mt: 4 }} />
        </>
      )}
    </Box>
  );
}

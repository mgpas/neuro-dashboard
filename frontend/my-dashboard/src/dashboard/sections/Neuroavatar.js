import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import { LineChart } from '@mui/x-charts';

export default function Neurodisplay({ data }) {
  const [segmentQuestData, setSegmentQuestData] = useState([]);
  
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
        
        const QuestionaryResponse = await fetch('http://127.0.0.1:5000/api/sessionQuestionary')
        const sessionQuestionary = await QuestionaryResponse.json();
        console.log(sessionQuestionary);
        // Usando Set para garantir que contamos avatar_id distintos
        const userIds = new Set();
        const segmentValue = {}; // Objeto para mostrar o Value por segmento
        const segmentQuestValue = {}

        // Itera sobre os objetos dentro da resposta
        for (const key in sessionAvatars) {
          if (sessionAvatars.hasOwnProperty(key)) {
            const session = sessionAvatars[key];
            if (session.user_id) {
              userIds.add(session.user_id); // Adiciona o avatar_id ao Set para garantir que sejam únicos
            }
            if (session.segment) {
              segmentValue[session.segment] = session.session_value;
            }
          }
        }

        for (const key in sessionQuestionary) {
          if (sessionQuestionary.hasOwnProperty(key)) {
            const session = sessionQuestionary[key];
            if (session.user_id) {
              userIds.add(session.user_id); // Adiciona o avatar_id ao Set para garantir que sejam únicos
            }
            const segmentKey = session.segment || 'Numeração';
            const hegDataArray = session.heg_data; // Assumindo que heg_data é um array
            
            if (Array.isArray(hegDataArray)) {
              if (!segmentQuestValue[segmentKey]) {
                segmentQuestValue[segmentKey] = [];
              }
              segmentQuestValue[segmentKey] = [...segmentQuestValue[segmentKey], ...hegDataArray.map(value => parseFloat(value || 0))];
            } else {
              console.warn(`HEG Data inválido ou não é um array para o segmento: ${segmentKey}`);
            }

            console.log(hegDataArray)
          }
        }
        

        // Converte segmentValue para um formato que o gráfico entenda
        const chartData = Object.keys(segmentValue).map(segment => ({
          segment,
          value: segmentValue[segment]
        }));
        
        const chartDataQuestionary = Object.keys(segmentQuestValue).flatMap(segment =>
          segmentQuestValue[segment].map(value => ({
            x: segment,
            y: value,
          }))
        );

        console.log('TESTE',segmentQuestValue);
  

        setSegmentQuestData(chartDataQuestionary)
        setSegmentData(chartData); // Atualiza os dados para o gráfico

      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const segmentNames = segmentData.map(segment => segment.segment);
  const sessionValue = segmentData.map(segment => segment.value);
  const SegmentQuestNames = segmentQuestData.map(segment => segment.x);
  const SegmentQuestValues = segmentQuestData.map(segment => segment.y);

  console.log(SegmentQuestNames);
  console.log(SegmentQuestValues);
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
        <Grid container item xs={12} alignContent="space-between" sx={{ display: 'flex' }}>
          {/* Box para Performance Global */}
          <Box
            sx={{
              p: 2,
              boxShadow: 2,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              width: '100%', maxWidth: { sm: '100%', md: '1700px' }
            }}
            >
            <Typography variant="h6" sx={{ mb: 1 }}>
                Performance em Valores fixos
            </Typography>
            <Typography variant='body1' sx={{ color: 'text.secondary' }}>
              Valores obtidos com testes realizados na Neurobots
            </Typography>
          </Box>
        </Grid>
      <Grid container item xs={10} justifyContent="center" alignContent="space-between">
        <Box sx={{
            p: 4,
            boxShadow: 2,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            width: '100%', maxWidth: { sm: '100%', md: '1700px' }
    }}>
        <Typography variant="h6" sx={{mb: 1}}>
          Pontuação mínima e máxima
        </Typography>
        <LineChart borderRadius={8}
                xAxis={[
                  {
                    scaleType: 'band',
                    categoryGapRatio: 0.5,
                    data: segmentNames // Usando os dados dinâmicos
                  },
                ]}
                series={[
                  {
                    id: 'Pontuação',
                    label: 'Pontuação',
                    data: sessionValue, // Usando os dados dinâmicos de duração
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
                }}/>
        </Box>
        </Grid>
        <Grid container item xs={10} justifyContent="center" alignContent="space-between">
          <Box sx={{
            p: 4,
            boxShadow: 2,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            width: '100%', maxWidth: { sm: '100%', md: '1700px' }
    }}>
            <Typography variant="h6" sx={{mb: 1}}>
              Pontos
            </Typography>
            <LineChart
                xAxis={[
                  {
                    scaleType: 'band',
                    categoryGapRatio: 0.5,
                    data: SegmentQuestNames // Segmentos do questionário
                  },
                ]}
                series={[
                  {
                    id: 'Pontos',
                    label: 'Pontuação',
                    data: SegmentQuestValues, // Usando os dados dinâmicos de duração
                    stack: 'A',
                  },
                ]}
                width={600}
                height={250}
                margin={{ left: 50, right: 10, top: 20, bottom: 20 }}
                grid={{ horizontal: true, vertical: true}}
                slotProps={{
                  legend: {
                    hidden: true,
                  },
                }}/>
          </Box>
        </Grid>
            </Grid>
    </>
  )}
        <Copyright sx={{ my: 4 }} />
  </Box>
  );
}

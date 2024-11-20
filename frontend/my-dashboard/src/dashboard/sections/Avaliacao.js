import * as React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';

export default function Avaliacao({ data }) {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* Verifica se há dados */}
      {data ? (
        <>
          {/* cards */}
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            AVALIACAO
          </Typography>
          <Grid
            container
            spacing={2}
            columns={12}
            sx={{ mb: (theme) => theme.spacing(2) }}
          >
            {/* Renderizando os dados recebidos */}
            {Object.keys(data).map((key, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    boxShadow: 1,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Typography variant="h6">{key}</Typography>
                  <Typography variant="body2">
                    {JSON.stringify(data[key], null, 2)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
          No data available
        </Typography>
      )}
      <Copyright sx={{ my: 4 }} />
    </Box>
  );
}
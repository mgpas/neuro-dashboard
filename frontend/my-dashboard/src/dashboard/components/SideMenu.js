import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuContent from './MenuContent';
import { auth } from '../../firebase';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu({ selectedMenu, onSelectMenu }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carregamento

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.name || 'Usuário',
          avatar: currentUser.image_url || '/static/images/avatar/placeholder.jpg', // URL da foto ou placeholder
        });
      } else {
        setUser(null); // Caso o usuário não esteja logado
      }
    });

    // Limpa o listener ao desmontar o componente
    return () => unsubscribe();
  }, []);

  // Função de logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null); // Redefine o usuário como null após o logout
    } catch (error) {
      console.error('Erro ao deslogar: ', error);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      ></Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ marginLeft: 1 }}>
        <Box sx={{ height: 50, width: 50 }}>
          <img
            src="https://neurobots.com.br/wp-content/uploads/2023/02/cropped-logo-neurobots.png"
            alt="Neurobots Icon"
            style={{ height: '100%', width: '100%' }}
          />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Neurobots
        </Typography>
      </Stack>
      <MenuContent selectedMenu={selectedMenu} onSelectMenu={onSelectMenu} />
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {loading ? ( // Renderiza um carregador enquanto os dados estão sendo buscados
          <Avatar sx={{ width: 36, height: 36 }} />
        ) : (
          <>
            <Avatar
              sizes="small"
              alt={user?.name || 'Usuário'}
              src={user?.avatar || '/static/images/avatar/placeholder.jpg'}
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ mr: 'auto' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
                {user?.name || 'Usuário'}
              </Typography>
            </Box>
          </>
        )}
      </Stack>
      <Stack sx={{ p: 1 }}>
        <Button variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
          Sair
        </Button>
      </Stack>
    </Drawer>
  );
}

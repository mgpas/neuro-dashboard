import * as React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { auth } from '../../firebase';

import MenuContent from './MenuContent';

function SideMenuMobile({ open, toggleDrawer }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName || 'Usuário',
          avatar: currentUser.photoURL || '/static/images/avatar/placeholder.jpg', // URL da foto ou placeholder
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
      toggleDrawer(false)(); // Fecha o Drawer após o logout
    } catch (error) {
      console.error('Erro ao deslogar: ', error);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={user?.name || 'Usuário'}
              src={user?.avatar}
              sx={{ width: 24, height: 24 }}
            />
            <Typography component="p" variant="h7">
              {user?.name || 'Usuário'}
            </Typography>
          </Stack>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogout} // Chama a função de logout ao clicar
          >
            Sair
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;

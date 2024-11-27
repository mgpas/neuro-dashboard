import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import PersonIcon from '@mui/icons-material/Person';
import PsychologyIcon from '@mui/icons-material/Psychology';

const mainListItems = [
  { text: 'Engajamento', icon: <BarChartIcon /> },
  { text: 'Avaliação', icon: <PieChartIcon /> },
  { text: 'Sessões: Neuroavatar', icon: <PersonIcon /> },
  { text: 'Sessões: Mindfullness', icon: <PsychologyIcon /> },
];

export default function MenuContent({ selectedMenu, onSelectMenu }) {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton selected={item.text === selectedMenu} // Marca o item como selecionado
              onClick={() => onSelectMenu(item.text)} // Atualiza a seleção
              >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

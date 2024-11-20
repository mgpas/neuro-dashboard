import React from 'react';
import Engajamento from '../sections/Engajamento';
import Avaliacao from '../sections/Avaliacao';
import Neuroavatar from '../sections/Neuroavatar';
import Neurodisplay from '../sections/Neurodisplay';

export default function MainGrid({ selectedMenu }) {
  const renderContent = () => {
    switch (selectedMenu) {
      case 'Engajamento':
        return <Engajamento />;
      case 'Avaliação':
        return <Avaliacao />;
      case 'Sessões: Neuroavatar':
        return <Neuroavatar />;
      case 'Sessões: Neurodisplay':
        return <Neurodisplay />;
      default:
        return <p>Selecione uma opção no menu</p>;
    }
  };

  return <div>{renderContent()}</div>;
}
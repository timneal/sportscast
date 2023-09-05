import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { Scorecard } from '@millicast-react/scoring';

import './styles/app.css';


function App() {
  return (
    <VStack background="background" height="100%" padding="24px" spacing="24px" width="100%">
      <VStack spacing="16px" width="100%">
        <Scorecard />
      </VStack>
      <Box bottom="5px" left="5px" position="fixed" test-id="appVersion" paddingTop="10px">
        <Text fontSize="12px">Version: {__APP_VERSION__}</Text>
      </Box>
    </VStack>
  );
}

export default App;

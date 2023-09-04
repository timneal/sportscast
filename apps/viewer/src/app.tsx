import { Box, Flex, Text, Heading, VStack, HStack } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import ConfettiExplosion, {ConfettiProps} from 'react-confetti-explosion';

import InfoLabel from '@millicast-react/info-label';
import useNotification from '@millicast-react/use-notification';
import usePageClosePrompt from '@millicast-react/use-page-close-prompt';
import useViewer from '@millicast-react/use-viewer';
import Timer from '@millicast-react/timer';
import ParticipantCount from '@millicast-react/participant-count';

import ViewerVideoTiles from './components/viewer-video-tiles';
import { NoStream } from './components/no-stream';

import PubNub from 'pubnub';
import { PubNubProvider, usePubNub } from 'pubnub-react';

import './styles/app.css';

const pubnub = new PubNub({
  publishKey: 'pub-c-b14caa5c-c35d-4da7-bed8-3fd3564f11bb',
  subscribeKey: 'sub-c-59bf0b71-9aa4-4168-9e57-139036b8bfd3',
  uuid: 'lijojatis'
});

const largeProps: ConfettiProps = {
  force: 0.8,
  duration: 3000,
  particleCount: 300,
  width: 1600,
  colors: ['#041E43', '#1471BF', '#5BB4DC', '#FC027B', '#66D805'],
};

const App = () => {
  const href = new URL(window.location.href);

  const streamName = href.searchParams.get('streamName') ?? import.meta.env.VITE_RTS_STREAM_NAME;
  const streamAccountId = href.searchParams.get('streamAccountId') ?? import.meta.env.VITE_RTS_ACCOUNT_ID;

  const { showError } = useNotification();
  usePageClosePrompt();

  const {
    mainMediaStream,
    mainSourceId,
    mainQualityOptions,
    mainStatistics,
    projectToMainStream,
    remoteTrackSources,
    setSourceQuality,
    startViewer,
    stopViewer,
    viewerCount,
  } = useViewer({ handleError: showError, streamAccountId, streamName });

  useEffect(() => {
    startViewer();
    return () => {
      stopViewer();
    };
  }, []);

  const hasMultiStream = remoteTrackSources.size > 1;
  const isStreaming = remoteTrackSources.size > 0;

  return (
    <VStack background="background" height="100%" padding="24px" spacing="24px" width="100%">
      <VStack spacing="16px" width="100%">
        <PubNubProvider client={pubnub}>
          <Scoreboard isActive={isStreaming} numViewers={viewerCount}/>  
        </PubNubProvider>
        {hasMultiStream ? (
          <Flex justifyContent="flex-end" width="100%">
            <InfoLabel
              bgColor="dolbyNeutral.300"
              color="white"
              fontWeight="600"
              height="auto"
              padding="6px 18px"
              test-id="multiSource"
              text="Multi–stream view"
            />
          </Flex>
        ) : undefined}
      </VStack>
      {mainMediaStream && mainSourceId ? (
          <ViewerVideoTiles
            mainMediaStream={mainMediaStream}
            mainSourceId={mainSourceId}
            mainQualityOptions={mainQualityOptions}
            mainStatistics={mainStatistics}
            projectToMainStream={projectToMainStream}
            remoteTrackSources={remoteTrackSources}
            setSourceQuality={setSourceQuality}
          />
      ) : (
        <NoStream />
      )}
      <Box bottom="5px" left="5px" position="fixed" test-id="appVersion" paddingTop="10px">
        <Text fontSize="12px">Version: {__APP_VERSION__}</Text>
      </Box>
    </VStack>
  );
};

interface ScoreboardProps {
  numViewers: number;
  isActive?: boolean;
}

const Scoreboard = ({ numViewers, isActive = false }: ScoreboardProps) =>  {
  const pubnub = usePubNub();
  const [channels] = useState<string[]>(['score-channel']);
  const [eventName, setEventName] = useState<string>('')
  const [maxScore, setMaxScore] = useState<string>('100')
  const [teamOneName, setTeamOneName] = useState<string>('')
  const [teamOneScore, setTeamOneScore] = useState<string>('0')
  const [teamOneWins, setTeamOneWins] = useState(false);
  const [teamTwoName, setTeamTwoName] = useState<string>('')
  const [teamTwoScore, setTeamTwoScore] = useState<string>('0 ')
  const [teamTwoWins, setTeamTwoWins] = useState(false);


  const handleMessage = (event: PubNub.MessageEvent) => {
    const message = event.message;
    const info = JSON.parse(message);
    setEventName(info.eventName);
    setMaxScore(info.maxScore);
    setTeamOneName(info.teamOne.name);
    setTeamOneScore(info.teamOne.score);
    setTeamTwoName(info.teamTwo.name);
    setTeamTwoScore(info.teamTwo.score);
  };

  useEffect(() => {
    const listenerParams = { message: handleMessage }
    pubnub.addListener(listenerParams);
    pubnub.subscribe({ channels });
    return () => {
        pubnub.unsubscribe({ channels })
        pubnub.removeListener(listenerParams)
    }
  }, [pubnub, channels]);

  useEffect(() => {
    setTeamOneWins(+teamOneScore >= +maxScore);
    setTeamTwoWins(+teamTwoScore >= +maxScore);
  }, [teamOneScore, teamTwoScore, maxScore]);

  return (
    <HStack
      alignItems="center"
      borderRadius="8px"
      background="dolbyNeutral.800"
      justifyContent="space-between"
      padding="8px 24px"
      test-id="actionBar"
      width="100%"
    >
        <Heading test-id="headingName" as="h3" fontSize="16px" fontWeight={600} lineHeight={1.5}>
          {eventName}
        </Heading>

      <HStack>
        <Text>{teamOneName}</Text>
        <Text>{teamOneScore}</Text>
        {teamOneWins && <ConfettiExplosion {...largeProps} />}
        <Text>|</Text>
        <Text>{teamTwoScore}</Text>
        {teamTwoWins && <ConfettiExplosion {...largeProps} />}
        <Text>{teamTwoName}</Text>
      </HStack>
      <HStack gap="20px">
        {isActive ? <ParticipantCount count={numViewers} /> : undefined}
        <Timer isActive={isActive} />
      </HStack>

    </HStack>
  );
}

export default App;

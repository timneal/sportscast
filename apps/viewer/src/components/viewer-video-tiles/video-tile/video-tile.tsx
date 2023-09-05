import { Box, Heading, HStack, Text } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';

import VideoView from '@millicast-react/video-view';

import { VideoTileProps } from './types';
import { delay } from './utils';
import VideoControlBar from './video-control-bar';

import ConfettiExplosion, {ConfettiProps} from 'react-confetti-explosion';
import PubNub from 'pubnub';
import { PubNubProvider, usePubNub } from 'pubnub-react';

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

const SHOW_CONTROL_BAR_DURATION = 2000;

const VideoTile = ({
  controls,
  isStreaming,
  isMain,
  settings,
  showControlBar,
  statistics,
  videoProps = {},
}: VideoTileProps) => {
  const {
    audioEnabled,
    fullScreen,
    onChangeVolume,
    onToggleAudio,
    onToggleFullScreen,
    onToggleVideo,
    videoEnabled,
    volume,
  } = controls ?? {};

  const videoViewRef = useRef<HTMLDivElement>(null);
  const isControlBarVisibleRef = useRef<boolean>();

  const [isPlaybackActive, setIsPlaybackActive] = useState(true);

  // Hide/show control bar on mouse move
  useEffect(() => {
    if (!videoViewRef.current) {
      return undefined;
    }

    const handleMouseMove = async (event: MouseEvent) => {
      event.preventDefault();

      isControlBarVisibleRef.current = true;

      await delay(SHOW_CONTROL_BAR_DURATION);

      isControlBarVisibleRef.current = false;
    };

    videoViewRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      videoViewRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [videoViewRef.current]);

  // Reenable playback when switching main source
  useEffect(() => {
    setIsPlaybackActive(true);
  }, [videoProps.label]);

  useEffect(() => {
    videoTrack.enabled = videoEnabled;
  }, [videoEnabled]);

  const { mediaStream } = videoProps;

  const [audioTrack] = mediaStream?.getAudioTracks() ?? [];
  const [videoTrack] = mediaStream?.getVideoTracks() ?? [];

  const handleToggleFullScreen = () => {
    onToggleFullScreen?.((prevIsFullScreen) => !prevIsFullScreen);
  };

  const handleChangeVolume = (newVolume: number) => {
    if (newVolume === 0 && audioEnabled) {
      onToggleAudio?.(false);
    } else if (!audioEnabled && newVolume > 0) {
      onToggleAudio?.(true);
    }

    onChangeVolume?.(newVolume);
  };

  const handleToggleAudio = () => {
    if (audioEnabled) {
      onToggleAudio?.(false);
    } else if (volume === 0) {
      handleChangeVolume(0.5);
    } else {
      onToggleAudio?.(true);
    }
  };

  const handleTogglePlayback = () => {
    setIsPlaybackActive((prevIsPlaysetIsPlaybackActive) => !prevIsPlaysetIsPlaybackActive);
  };

  const handleToggleVideo = () => {
    if (videoTrack) {
      onToggleVideo?.((prevIsVideoEnabled) => !prevIsVideoEnabled);
    }
  };

  return (
    <Box
      bottom={0}
      height={fullScreen ? '100vh' : '100%'}
      left={0}
      margin="0 auto"
      overflow="hidden"
      position={fullScreen ? 'fixed' : 'relative'}
      ref={videoViewRef}
      right={0}
      top={0}
      width={fullScreen ? '100vw' : '100%'}
      zIndex={fullScreen ? '1' : '0'}
    >
      <VideoView
        displayVideo={videoEnabled}
        muted={!audioEnabled}
        paused={!isPlaybackActive}
        volume={volume}
        {...videoProps}
      />
      {isMain &&
        <PubNubProvider client={pubnub}>
          <Scoreboard/>  
        </PubNubProvider>
      };

      {showControlBar ? (
        <VideoControlBar
          activeAudio={audioEnabled}
          activePlayback={isPlaybackActive}
          activeVideo={videoEnabled}
          hasAudioTrack={!!audioTrack}
          hasVideoTrack={!!videoTrack}
          isFullScreen={fullScreen}
          isStreaming={isStreaming}
          onChangeVolume={handleChangeVolume}
          onToggleAudio={handleToggleAudio}
          onToggleFullScreen={handleToggleFullScreen}
          onTogglePlayback={handleTogglePlayback}
          onToggleVideo={handleToggleVideo}
          opacity={isControlBarVisibleRef.current ? 1 : 0}
          settings={settings}
          statistics={statistics}
          sx={{
            ':hover': { opacity: 1 },
          }}
          test-id="videoControlBar"
          volume={audioEnabled ? volume : 0}
        />
      ) : undefined}
    </Box>
  );
};

const Scoreboard = () =>  {
  const pubnub = usePubNub();
  const [channels] = useState<string[]>(['score-channel']);
  const [eventName, setEventName] = useState<string>('')
  const [maxScore, setMaxScore] = useState<string>('')
  const [teamOneName, setTeamOneName] = useState<string>('')
  const [teamOneScore, setTeamOneScore] = useState<string>('')
  const [teamOneWins, setTeamOneWins] = useState(false);
  const [teamTwoName, setTeamTwoName] = useState<string>('')
  const [teamTwoScore, setTeamTwoScore] = useState<string>('')
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
    if (teamOneScore !== '')
      setTeamOneWins(+teamOneScore >= +maxScore);
    if (teamOneScore !== '')
      setTeamTwoWins(+teamTwoScore >= +maxScore);
  }, [teamOneScore, teamTwoScore, maxScore]);

  const isPopulated = (() => {
    return  eventName !== '' || 
            maxScore !== '' || 
            teamOneName !== '' ||
            teamOneScore !== '' ||
            teamTwoName !== '' ||
            teamTwoScore !== '';
  });

  return (
    <>
    {isPopulated() &&

    <HStack
      background="backgroundTranslucent"
      top="0"
      justify="space-between"
      padding="18px 12px"
      position="absolute"
      right="0"
      spacing="0"
      transition="opacity 0.5s"
      width="100%"
    >
        <Heading test-id="headingName" as="h3" fontSize="18px" fontWeight={600} lineHeight={1.5} backgroundColor={'dolbyPurple.500'} borderRadius={10} padding={2}>
          {eventName}
        </Heading>

        <HStack  backgroundColor={'dolbyPurple.500'} borderRadius={10} padding={1}>
            <Text casing={'uppercase'} color={'white'} padding={2}>{teamOneName}</Text>
            <Text bg={"white"} borderRadius={10} color={'black'} padding={2} width={10} align={'center'}>{teamOneScore}</Text>
            {teamOneWins && <ConfettiExplosion {...largeProps} />}
            <Text bg={"white"} borderRadius={10} color={'black'} padding={2} width={10} align={'center'}>{teamTwoScore}</Text>
            {teamTwoWins && <ConfettiExplosion {...largeProps} />}
            <Text casing={'uppercase'} color={'white'} padding={2}>{teamTwoName}</Text>
        </HStack>
    </HStack>
  };
  </>
  );
}

export default VideoTile;

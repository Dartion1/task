// Importing required modules and components
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TrackPlayer, {
  Event,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import localImages from '../../Assets/Images';
import CircularSlider from '../../Components/CircularSlider';
import colors from '../../Constants/colors';
import { addTracks, setupPlayer } from '../../Services/TrackPlayerServices';
import styles from './styles';

// Function to format time in minutes:seconds
function format(seconds) {
  let mins = parseInt(seconds / 60)
    .toString()
    .padStart(2, '0');
  let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Component for displaying track progress
function TrackProgress() {
  const {position, duration} = useProgress(200);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: 200,
        }}>
        <Text style={{color: 'black'}}>{format(position)}</Text>
        <Text style={{color: 'black'}}>{format(duration)}</Text>
      </View>
      <Slider
        style={{width: 200, height: 40}}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onValueChange={() => console.log()}
        minimumTrackTintColor="#3498db"
        maximumTrackTintColor="#bdc3c7"
        thumbTintColor="#3498db"
      />
    </View>
  );
}

// Playlist component
function Playlist() {
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);

  // Function to load the playlist
  async function loadPlaylist() {
    const queue = await TrackPlayer.getQueue();
    setQueue(queue);
  }

  useEffect(() => {
    loadPlaylist();
  }, []);

  // Listening to track change events
  useTrackPlayerEvents([Event.PlaybackTrackChanged], event => {
    if (event.state == State.nextTrack) {
      TrackPlayer.getCurrentTrack().then(index => setCurrentTrack(index));
    }
  });

  // Function to handle shuffle
  async function handleShuffle() {
    let queue = await TrackPlayer.getQueue();
    await TrackPlayer.reset();
    queue.sort(() => Math.random() - 0.5);
    await TrackPlayer.add(queue);

    loadPlaylist();
  }

  return (
    <View>
      <Controls onShuffle={handleShuffle} />
    </View>
  );
}

// Controls component
function Controls({onShuffle}) {
  // const playerState = usePlaybackState();
  const {state: playerState} = usePlaybackState();
  console.log('playbackState: ', playerState);
  // Function to handle play/pause button press
  async function handlePlayPress() {
    if ((await TrackPlayer.getState()) == State.Playing) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  }

  return (
    <View style={styles.controlsContainer}>
      <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()}>
        <Image source={localImages.refresh} style={styles.controlButton} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()}>
        <Image source={localImages.backIcon} style={styles.controlButton} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handlePlayPress()}>
        <Image
          source={
            playerState === 'paused'
              ? localImages.playIcon
              : localImages.pauseIcon
          }
          style={styles.controlButton}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => TrackPlayer.skipToNext()}>
        <Image source={localImages.nextIcon} style={styles.controlButton} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onShuffle()}>
        <Image source={localImages.shuffleIcon} style={styles.controlButton} />
      </TouchableOpacity>
    </View>
  );
}

// Individual Song Screen component
function IndivisualSongScreen({navigation}) {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    async function setup() {
      let isSetup = await setupPlayer();
      const queue = await TrackPlayer.getQueue();
      if (isSetup && queue.length <= 0) {
        await addTracks();
      }
      setIsPlayerReady(isSetup);
    }

    setup();
  }, []);

  // Loading screen while player is not ready
  if (!isPlayerReady) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#bbb" />
      </SafeAreaView>
    );
  }

  // Header component
  const header = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={40} color="#999dff" />
          </TouchableOpacity>
        </View>
        <View style={{flex: 4, justifyContent: 'center'}}></View>
        <View style={styles.menuButtonContainer}>
          <Icon name="menu" size={40} color="#999dff" />
        </View>
      </View>
    );
  };

  // Music container component
  const musicContainer = () => {
    return (
      <View style={styles.musiccontainer}>
        <View style={styles.circularSliderContainer}>
          <CircularSlider />
        </View>
        <View style={styles.trackInfoContainer}>
          <Text style={styles.titleText}>Breathing Practices</Text>
          <Text style={styles.subtitleText}>For relaxation</Text>
          <View style={styles.innerContainer}>
            <TrackProgress />
            <Playlist />
          </View>
        </View>
      </View>
    );
  };

  // Button container component
  const buttonContainer = () => {
    return (
      <TouchableOpacity
        style={styles.bottomBtnContainer}
        onPress={() => Alert.alert('Coming Soon...')}>
        <View style={styles.bottambtnText}>
          <Text style={{fontSize: 16, color: colors.textblack}}>
            Explore similar
          </Text>
        </View>
        <View style={styles.bottambtnIcon}>
          <Icon name="arrow-forward-outline" size={30} color="#4F8EF7" />
        </View>
      </TouchableOpacity>
    );
  };

  // Render components
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F2E6F2', '#E0E0F8', '#EDEFFC']}
        style={{flex: 1}}>
        {header()}
        {musicContainer()}
        {buttonContainer()}
      </LinearGradient>
    </SafeAreaView>
  );
}

export default IndivisualSongScreen;

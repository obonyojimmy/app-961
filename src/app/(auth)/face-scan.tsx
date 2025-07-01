import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Image, NativeModules, NativeEventEmitter } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mediaDevices, RTCView } from 'react-native-webrtc';

const { VideoEffectModule } = NativeModules;

const eventEmitter = new NativeEventEmitter(NativeModules.VideoEffectModule); // Replace with actual module name

export default function FaceScanScreen() {
  const { mode } = useLocalSearchParams<{ mode: 'signup' | 'login' }>();
  const [stage, setStage] = useState<'scanning' | 'verified'>('scanning');
  const [pin, setPin] = useState('');
  const [stream, setStream] = useState(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sub = eventEmitter.addListener('FaceProbabilities', (faces) => {
      console.log('Face data:', faces);
      if (faces.length > 0) {
        const firstFace = faces[0];
        console.log(`Smile: ${firstFace.smilingProbability}`);
        console.log(`Left Eye: ${firstFace.leftEyeOpenProbability}`);
        console.log(`Right Eye: ${firstFace.rightEyeOpenProbability}`);
      }
    });
  
    return () => sub.remove();
  }, []);

  useEffect(() => {
    (async () => {

      const newStream = await mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: 640,
          height: 480,
        },
      });
      try {
        VideoEffectModule.registerFaceDetectionMethod();
        //VideoEffectModule.registerFaceMeshMethod();
        newStream.getVideoTracks().forEach(track => {

          track._setVideoEffect('faceDetection');
        });
      } catch (error) {
        console.log(error);
      }
      setStream(newStream);
    })();
  }, []);

  useEffect(() => {
    if (stage === 'scanning' && stream) {
      simulateScan();
    }
  }, [stage, stream]);


  const simulateScan = () => {
    let count = 0;
    const interval = setInterval(() => {
      count += 10;
      setProgress(count);
      if (count >= 100) {
        clearInterval(interval);
        setImageUri('');
        //setStage('verified');
      }
    }, 300);
  };



  console.log("stage", stage)

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 mb-4">
        <Text className="text-lg font-semibold text-gray-700">Face detection</Text>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </Pressable>
      </View>

      {/* Scanning View */}
      {stage === 'scanning' && (
        <>
          <View className="self-center w-[90%] aspect-[3/4] rounded-xl overflow-hidden bg-black">
            {stream && (

              <RTCView
                streamURL={stream.toURL()}
                style={{ flex: 1 }}
                objectFit="cover"
                mirror
              />
            )}
            <View className="absolute inset-0 border-4 border-white opacity-20 rounded-xl" />
          </View>

          <View className="mt-6 items-center px-4">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              Saving your data
            </Text>
            <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <View
                className="h-full bg-green-500"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-sm text-gray-500">
              Please keep your face centered on the screen and facing forward
            </Text>
          </View>
        </>
      )}

      {/* Verified View */}
      {stage === 'verified' && (
        <View className="flex-1 items-center px-6 pt-8">
          {/* Captured Face */}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              className="w-40 h-40 rounded-full mb-6"
            />
          )}

          {/* Heading */}
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            Identity Verified
          </Text>

          {/* Subtext */}
          <Text className="text-center text-gray-600 text-sm mb-8">
            Your smile just unlocked a world of possibilities. You're officially you, and that’s awesome!
          </Text>

          {/* PIN Entry */}
          <View className="w-full">
            <TextInput
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              placeholder="Enter PIN for this device"
              value={pin}
              onChangeText={setPin}
              className="border border-gray-300 rounded px-4 py-3 mb-4 text-base"
            />
            <Pressable
              className="bg-green-600 py-3 rounded"
              onPress={() => {
                // TODO: Save PIN and face embedding
                router.replace('/dash');
              }}
            >
              <Text className="text-white text-center text-lg">Continue</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

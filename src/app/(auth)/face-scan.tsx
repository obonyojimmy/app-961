import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Image } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

export default function FaceScanScreen() {
  const { mode } = useLocalSearchParams<{ mode: 'signup' | 'login' }>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera | null>(null);

  const [stage, setStage] = useState<'scanning' | 'verified'>('scanning');
  const [pin, setPin] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        await requestPermission();
      }
    })();
  }, [requestPermission]);

  useEffect(() => {
    if (hasPermission && stage === 'scanning') {
      simulateScan();
    }
  }, [hasPermission, stage]);

  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current) {
      console.warn('Camera not ready');
      return;
    }
  
    try {
      const photo = await cameraRef.current.takePhoto();
      const path = `file://${photo.path}`
      console.log('photo', path);
      setImageUri(path);
      setStage('verified');
    } catch (err) {
      console.error('Capture error:', err);
    }
  }, []);

  const simulateScan = () => {
    let count = 0;
    const interval = setInterval(() => {
      count += 10;
      setProgress(count);
      if (count >= 100) {
        clearInterval(interval);
        capturePhoto();
      }
    }, 300);
  };

 
  if (!hasPermission) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-black">Requesting camera permission...</Text>
      </View>
    );
  }
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
            {device && (
              <Camera
                device={device}
                ref={cameraRef}
                style={{ flex: 1 }}
                isActive={true}
                photo
                className="rounded-xl"
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
        <View className="flex-1  gap-4">
          <View className="items-center">
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                className="w-40 h-40 rounded-full mb-4"
              />
            )}
            <Text className="text-xl font-bold text-center mb-1 text-black">
              Identity Verified
            </Text>
            <Text className="text-center text-gray-600 mb-4 px-8 text-sm">
              Your smile just unlocked a world of possibilities. You're officially you, and that’s awesome!
            </Text>
          </View>

          <View className="px-8">
            <TextInput
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              placeholder="Enter PIN for this device"
              value={pin}
              onChangeText={setPin}
              className="border border-gray-400 rounded px-4 py-3 mb-4"
            />
            <Pressable
              className="bg-green-600 py-3 rounded"
              onPress={() => {
                // TODO: Save PIN and face embedding
                router.replace('/');
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

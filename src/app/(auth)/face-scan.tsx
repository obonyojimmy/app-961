import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, NativeModules, NativeEventEmitter } from 'react-native';
import { mediaDevices, RTCView } from 'react-native-webrtc';
import { cn } from '@/lib/utils';

const { VideoEffectModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(NativeModules.VideoEffectModule); 

const { width } = Dimensions.get('window');
const CIRCLE_RADIUS = width * 0.9;

export default function FaceScanScreen() {
  const [stream, setStream] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Scanning ...');
  const [prompt, setPrompt] = useState('Align your face in the circle');

  const [faceData, setFaceData] = useState(null);
  const [faceInView, setFaceInView] = useState(false);
  const [livenessComplete, setlivenessComplete] = useState(false);

  const [validations, setValidations] = useState([
    { label: 'smile', prompt: 'Smile, look straight ahead', passed: false },
    { label: 'left-eye', prompt: 'Close your Left eye', passed: false },
    { label: 'right-eye', prompt: 'Close your Right eye', passed: false },
    { label: 'turn-left', prompt: 'Turn your head slightly to the left', passed: false },
    { label: 'turn-right', prompt: 'Turn your head slightly to the right', passed: false },
    { label: 'turn-up', prompt: 'Turn your head slightly up', passed: false },
  ])

  const markValidationPassed = (label: string) => {
    setValidations((prev) =>
      prev.map((v) => (v.label === label ? { ...v, passed: true } : v))
    );
  };

  useEffect(() => {
    const sub = eventEmitter.addListener('FaceProbabilities', (faces) => {
      console.log('Face data:', faces);
      if (!faces.length) {
        setStatusMessage('No face detected');
        setPrompt('Align your face in the circle');
        return;
      }
      //setStatusMessage('Scanning ...');

      if (faces.length > 1) {
        setStatusMessage('Only one face at a time');
        setPrompt('Look straight ahead');
      }
      const face = faces[0];
      //setStatusMessage('Scanning ...');
      setFaceData(face)

    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!faceData) return;
    const { smilingProbability, leftEyeOpenProbability, rightEyeOpenProbability, headEulerAngleX, headEulerAngleY } = faceData;
    setStatusMessage('');

    // Get the first validation that hasn't passed
    const nextValidation = validations.find((v) => !v.passed);
    if (!nextValidation) {
      setStatusMessage('✅ Liveness Verified');
      setPrompt('You may proceed');
      return;
    }
    setPrompt(nextValidation.prompt);
    setStatusMessage('Scanning ...');
    switch (nextValidation.label) {
      case 'smile':
        if (smilingProbability > 0.5) {
          markValidationPassed('smile');
        }
        break;
      case 'left-eye':
        if (leftEyeOpenProbability < 0.4 && rightEyeOpenProbability > 0.4) {
          markValidationPassed('left-eye');
        }
        break;
      case 'right-eye':
        if (rightEyeOpenProbability < 0.4 && leftEyeOpenProbability > 0.4) {
          markValidationPassed('right-eye');
        }
        break;
      case 'turn-left':
        if (headEulerAngleY < 10) {
          markValidationPassed('turn-left');
        }
        break;
      case 'turn-right':
        if (headEulerAngleY > -10) {
          markValidationPassed('turn-right');
        }
        break;
      case 'turn-up':
        if (Math.abs(headEulerAngleX) > 10) {
          markValidationPassed('turn-up');
        }
        break;

      default:
        break;
    }
  }, [faceData, validations]);



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
        newStream.getVideoTracks().forEach(track => {
          track._setVideoEffect('faceDetection');
        });
      } catch (error) {
        console.log(error);
      }
      setStream(newStream);
    })();
  }, []);


  return (
    <View className="flex-1 gap-4 bg-white items-center pt-20">
      {/* feedback messages: ie no face detected, face in view, scanning etc */}
      <Text className="text-gray-600 text-xl font-semibold">{statusMessage}</Text>

      {/* the camera feed */}
      <View
        className="self-center overflow-hidden bg-black"
        style={{
          width: CIRCLE_RADIUS,
          height: CIRCLE_RADIUS,
          borderRadius: CIRCLE_RADIUS / 2,
        }}
      >
        {stream && (

          <RTCView
            streamURL={stream.toURL()}
            style={{ flex: 1 }}
            objectFit="cover"
            mirror
          />
        )}
        <View style={{
          width: CIRCLE_RADIUS,
          height: CIRCLE_RADIUS,
          borderRadius: CIRCLE_RADIUS / 2,

        }} className="absolute inset-0 border-4 border-white opacity-20 " />
      </View>

      {/* show validation prompts */}
      <Text className="text-center text-xl font-semibold text-gray-800 mt-6 px-8">
        {prompt}
      </Text>
    </View>
  );
}



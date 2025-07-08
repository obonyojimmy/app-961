import React, { useEffect, useRef, useState } from "react";
import { Dimensions, NativeEventEmitter, EmitterSubscription, NativeModules, Text, View, TextInput, Pressable, Alert } from "react-native";
import { mediaDevices, RTCView } from "react-native-webrtc";
import { authenticateDevice, cn, getEmbedding, isInTrustedGeoZone, verifyUser } from '@/lib/utils';
import { router, useLocalSearchParams } from "expo-router";
import { getPin, getSavedEmbedding, saveFaceEmbedding, SavePin } from "@/lib/storage";

const { VideoEffectModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(NativeModules.VideoEffectModule);

const { width } = Dimensions.get("window");
const CIRCLE_RADIUS = width * 0.9;

export default function FaceScanScreen() {
  const { mode } = useLocalSearchParams<{ mode: 'signup' | 'login' }>();
  const [stream, setStream] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Scanning ...");
  const [prompt, setPrompt] = useState("Align your face in the circle");

  const [faceData, setFaceData] = useState(null);
  const [faceInView, setFaceInView] = useState(false);
  const [livenessComplete, setlivenessComplete] = useState(false);
  const [showPinFallback, setShowPhowPinFallback] = useState(false);

  const livenessEvent = useRef<EmitterSubscription | null>(null);

  const VALIDATION_COOLDOWN_MS = 1000; // 1 seconds between validations
  const [lastValidationTime, setLastValidationTime] = useState(0);

  const [pin, setPin] = useState<string | null>(null);

  const [validations, setValidations] = useState([
    { label: "smile", prompt: "Smile, look straight ahead", passed: false },
    { label: "blink", prompt: "Blink your eyes", passed: false },
    { label: "turn-left", prompt: "Turn your head slightly to the left", passed: false },
    { label: "turn-right", prompt: "Turn your head slightly to the right", passed: false },
    { label: "turn-up", prompt: "Look up slightly", passed: false },
  ]);

  const markValidationPassed = (label) => {
    setValidations((prev) => prev.map((v) => (v.label === label ? { ...v, passed: true } : v)));
  };

  const reset = () => {
    setlivenessComplete(false)
    setShowPhowPinFallback(false)
    setPin(null)
    setLastValidationTime(0)
  }

  const handleRegister = () => {
    if (!pin) return;
    getEmbedding().then((embedding) => {
      saveFaceEmbedding(embedding);
      SavePin(pin);
      router.replace('/dash');
      reset()

    })
  }

  const handlePinLogin = () => {
    if (!pin) return;
    const savedPin = getPin()
    if (savedPin === pin) {
      router.replace('/dash');
      reset()
    }
  }

  const handleLogin = () => {
    getEmbedding().then((embedding) => {

      setTimeout(async () => {
        const verified = verifyUser(embedding);
        if (verified) {
          router.replace('/dash');
        } else {
          //const authOk = await authenticateDevice();
          //if (!authOk) {
          //  Alert.alert('Authentication failed', 'Please try again');
          //  return;
          //}
          //if (authOk) {
            setShowPhowPinFallback(true)
          //  return
          //}
          const trustedZone = await isInTrustedGeoZone();
          if (trustedZone) {
            setShowPhowPinFallback(true)
            return
          } else {
            Alert.alert('Authentication failed', 'Please try again');
            return
          }

        }
      }, 1500); // stimulate delay to show processing

    })
  }

  useEffect(() => {
    (async () => {
      const newStream = await mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: 640,
          height: 480,
        },
      });
      try {
        VideoEffectModule.registerFaceDetectionMethod();
        newStream.getVideoTracks().forEach((track) => {
          track._setVideoEffect("faceDetection");
        });
      } catch (error) {
        console.log(error);
      }
      setStream(newStream);
    })();
  }, []);


  useEffect(() => {
    //if(livenessComplete) return
    livenessEvent.current = eventEmitter.addListener("FaceProbabilities", (faces) => {
      if (livenessComplete) return
      console.log("Face data:", faces);
      if (!faces.length) {
        setStatusMessage("No face detected");
        setPrompt("Align your face in the circle");
        return;
      }
      //setStatusMessage('Scanning ...');

      if (faces.length > 1) {
        setStatusMessage("Only one face at a time");
        setPrompt("Look straight ahead");
      }
      const face = faces[0];
      //setStatusMessage('Scanning ...');
      setFaceData(face);
    });

    return () => {
      livenessEvent.current.remove()
    };
  }, [livenessComplete]);


  useEffect(() => {
    if (!faceData || livenessComplete) return;
    if (livenessComplete && livenessEvent.current) {
      livenessEvent.current.remove()
    }

    
    const {
      smilingProbability,
      leftEyeOpenProbability,
      rightEyeOpenProbability,
      headEulerAngleX,
      headEulerAngleY,
      spoofScores,
    } = faceData;

    if (!spoofScores || spoofScores[0] < 0.3) {
      //setStatusMessage("No face detected");
      //setPrompt("Align your face in the circle");
      return;
    }

    const now = Date.now();
    if (now - lastValidationTime < VALIDATION_COOLDOWN_MS) return;


    setStatusMessage("");

    const nextValidation = validations.find((v) => !v.passed);
    if (!nextValidation) {
      setStatusMessage("Processing ...");
      setPrompt("");
      setlivenessComplete(true);
      if (mode === 'login') {
        handleLogin()
      }
      return;
    }

    setPrompt(nextValidation.prompt);
    setStatusMessage("Scanning ...");

    switch (nextValidation.label) {
      case "smile":
        if (smilingProbability > 0.3) {
          markValidationPassed("smile");
          setLastValidationTime(now);
        }
        break;

      case "blink":
        const leftClosed = leftEyeOpenProbability < 0.3;
        const rightClosed = rightEyeOpenProbability < 0.3;
        const bothClosed = leftClosed && rightClosed;
        const bothOpen = leftEyeOpenProbability > 0.6 && rightEyeOpenProbability > 0.6;

        // Check for rapid transition from open to closed (blink)
        if (bothClosed && lastValidationTime !== 0) {
          markValidationPassed("blink");
          setLastValidationTime(now);
        }
        break;

      case "turn-left":
        if (headEulerAngleY < 10) {
          markValidationPassed("turn-left");
          setLastValidationTime(now);
        }
        break;

      case "turn-right":
        if (headEulerAngleY > -10) {
          markValidationPassed("turn-right");
          setLastValidationTime(now);
        }
        break;

      case "turn-up":
        if (Math.abs(headEulerAngleX) > 10) {
          markValidationPassed("turn-up");
          setLastValidationTime(now);
        }
        break;

      default:
        break;
    }
  }, [faceData, validations, lastValidationTime, livenessComplete]);



  if (livenessComplete && mode === "login") {
    return (
      <View className="flex-1 justify-center items-center gap-4 bg-white pt-20">
        {!showPinFallback &&<Text className="text-xl font-semibold text-gray-600">Processing</Text>}

        {showPinFallback && (
          <>
            <Text className="text-xl font-semibold text-gray-600">Enter PIN</Text>
            <TextInput
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              //minLength={4}
              placeholder="Enter PIN for this device"
              //value={pin}
              onChangeText={setPin}
              className="border w-1/2 border-gray-300 rounded px-4 py-3 mb-4 text-base"
            />
            <Pressable
              className="bg-green-300 py-3 rounded px-6 "
              onPress={() => handlePinLogin()}
            >
              <Text className="text-white text-center text-lg">Confirm</Text>
            </Pressable>
          </>
        )}


      </View>
    )
  }

  if (livenessComplete && mode === "signup") {
    return (
      <View className="flex-1 items-center gap-4 bg-white pt-20">
        <Text className="text-xl font-semibold text-gray-600">Finalize Registration</Text>
        {/* PIN Entry */}

        <TextInput
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
          //minLength={4}
          placeholder="Enter PIN for this device"
          //value={pin}
          onChangeText={setPin}
          className="border w-1/2 border-gray-300 rounded px-4 py-3 mb-4 text-base"
        />
        <Pressable
          className="bg-green-300 py-3 rounded px-6 "
          onPress={() => handleRegister()}
        >
          <Text className="text-white text-center text-lg">Register</Text>
        </Pressable>
      </View>
    )
  }


  return (
    <View className="flex-1 items-center gap-4 bg-white pt-20">
      {/* feedback messages: ie no face detected, face in view, scanning etc */}
      <Text className="text-xl font-semibold text-gray-600">{statusMessage}</Text>

      {/* the camera feed */}
      <View
        className="self-center overflow-hidden bg-black"
        style={{
          width: CIRCLE_RADIUS,
          height: CIRCLE_RADIUS,
          borderRadius: CIRCLE_RADIUS / 2,
        }}>
        {stream && (
          <RTCView streamURL={stream.toURL()} style={{ flex: 1 }} objectFit="cover" mirror />
        )}
        <View
          style={{
            width: CIRCLE_RADIUS,
            height: CIRCLE_RADIUS,
            borderRadius: CIRCLE_RADIUS / 2,
          }}
          className="absolute inset-0 border-4 border-white opacity-20 "
        />
      </View>

      {/* show validation prompts */}
      <Text className="mt-6 px-8 text-center text-xl font-semibold text-gray-800">{prompt}</Text>
    </View>
  );
}

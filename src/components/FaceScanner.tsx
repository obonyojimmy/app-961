import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View,Text, Dimensions, NativeModules, NativeEventEmitter, EmitterSubscription } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { mediaDevices, RTCView, MediaStream } from "react-native-webrtc";
import { useFocusEffect, useNavigation } from "expo-router";
import { useIsFocused } from '@react-navigation/native';


const { width } = Dimensions.get("window");
const CIRCLE_RADIUS = width * 0.9;
const STROKE_WIDTH = 6;
const radius = (CIRCLE_RADIUS - STROKE_WIDTH) / 2;
const circumference = 2 * Math.PI * radius;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { VideoEffectModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(NativeModules.VideoEffectModule);


export default function FaceScanner() {
    const navigation = useNavigation();
    const isfocused = useIsFocused()
    const progress = useSharedValue(0);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [statusMessage, setStatusMessage] = useState("Scanning ...");
    const [prompt, setPrompt] = useState("Align your face in the circle");
    const [details, setDetails] = useState(null);

    const [faceData, setFaceData] = useState(null);
    const [faceInView, setFaceInView] = useState(false);
    const [livenessComplete, setlivenessComplete] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [isInvalid, setIsInvalid] = useState(false);

    const livenessEvent = useRef<EmitterSubscription | null>(null);

    const VALIDATION_COOLDOWN_MS = 1500; // 1 seconds between validations
    const [lastValidationTime, setLastValidationTime] = useState(0);

    const [validations, setValidations] = useState([
        { label: "smile", prompt: "Smile, look straight ahead", passed: false },
        { label: "blink", prompt: "Blink your eyes", passed: false },
        { label: "turn-left", prompt: "Turn your head slightly to the left", passed: false },
        { label: "turn-right", prompt: "Turn your head slightly to the right", passed: false },
        { label: "turn-up", prompt: "Look up slightly", passed: false },
    ]);

    const markValidationPassed = (label: string) => {
        setValidations((prev) => prev.map((v) => (v.label === label ? { ...v, passed: true } : v)));
        setScanning(false)
    };


    useEffect(() => {
        let mediaStream: MediaStream | null = null
        const startCamera = async () => {
            mediaStream = await mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: "user",
                    width: 640,
                    height: 480,
                },
            });

            try {
                VideoEffectModule.registerFaceDetectionMethod();
                mediaStream.getVideoTracks().forEach((track) => {
                    track._setVideoEffect("faceDetection");
                });
            } catch (error) {
                console.log(error);
            }
            setStream(mediaStream);
        }
        
        startCamera()
        
        return () => {
            console.log("FaceScanner cleanup")
            console.log("FaceScanner.unfocused")
            setScanning(false);
            //if (stream) {
            console.log("closing camera")
            if (mediaStream) {
                //console.log("stream active")
                mediaStream.getVideoTracks().forEach((track) => {
                    track._setVideoEffect("");
                    track.stop()
                });
                //stream?.getTracks().forEach(track => track.stop());
                mediaStream.release();
            }
            setStream(null);
        }



    }, [])




    useEffect(() => {
        //if(livenessComplete) return
        livenessEvent.current = eventEmitter.addListener("FaceProbabilities", (faces) => {
            if (livenessComplete) return
            console.log("Face data:", faces);
            if (!faces.length) {
                setScanning(false)
                setStatusMessage("No face detected");
                setPrompt("Align your face in the circle");
                return;
            }
            //setStatusMessage('Scanning ...');

            if (faces.length > 1) {
                setScanning(false)
                //setStatusMessage("Only one face at a time");
                //setPrompt("Look straight ahead");
                return
            }
            const face = faces[0];
            //setStatusMessage('Scanning ...');
            setFaceData(face);
        });

        return () => {
            livenessEvent?.current?.remove()
        };
    }, [livenessComplete]);

    useEffect(() => {
        if (!faceData || livenessComplete) return;
        if (livenessComplete && livenessEvent.current) {
            livenessEvent?.current?.remove()
        }
        //setScanning(true)


        const {
            smilingProbability,
            leftEyeOpenProbability,
            rightEyeOpenProbability,
            headEulerAngleX,
            headEulerAngleY,
            spoofScores,
        } = faceData;

        
        if (Array.isArray(spoofScores) && spoofScores[0] < 0.27) {
            //setStatusMessage("No face detected");
            setPrompt("Face not recognized");
            setDetails("Please adjust angle or lighting.")
            setIsInvalid(true)
            //setScanning(false)
            return;
        }
        

        const now = Date.now();
        if (now - lastValidationTime < VALIDATION_COOLDOWN_MS) return;


        setStatusMessage("");

        const nextValidation = validations.find((v) => !v.passed);
        if (!nextValidation) {
            setScanning(false)
            setStatusMessage("Processing ...");
            setPrompt("Looking great!");
            setIsInvalid(false)
        setDetails(null)
            setlivenessComplete(true);
            return
        }

        setIsInvalid(false)
        setDetails(null)
        setPrompt(nextValidation.prompt);
        setStatusMessage("Scanning ...");
        setScanning(true)

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



    useEffect(() => {
        if (scanning) {
            progress.value = 0;
            progress.value = withRepeat(
                withTiming(1, {
                    duration: 3000,
                    easing: Easing.linear,
                }),
                -1
            );
            /* progress.value = 0;
            progress.value = withTiming(1, {
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            }); */
        } else {
            progress.value = withTiming(0, { duration: 200 });
        }
    }, [scanning]);
    useEffect(() => {
        if(isInvalid || livenessComplete){
            progress.value = 1;
        }
    }, [isInvalid, livenessComplete])

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progress.value),
    }));

    

    return (
        <View className="flex-1 items-center gap-4 ">
            <View className="self-center" style={{ width: CIRCLE_RADIUS, height: CIRCLE_RADIUS }}>
                {/* Camera feed in a circle */}
                <View
                    className="overflow-hidden bg-black"
                    style={{
                        width: CIRCLE_RADIUS,
                        height: CIRCLE_RADIUS,
                        borderRadius: CIRCLE_RADIUS / 2,
                    }}>
                    {stream && (
                        <RTCView
                            streamURL={stream.toURL()}
                            style={{ flex: 1 }}
                            objectFit="cover"
                            mirror
                        />
                    )}

                    {/* Optional translucent ring for contrast */}
                    <View
                        className="absolute inset-0 border-4 border-white opacity-20"
                        style={{
                            width: CIRCLE_RADIUS,
                            height: CIRCLE_RADIUS,
                            borderRadius: CIRCLE_RADIUS / 2,
                        }}
                    />
                </View>

                {/* Scanning progress ring (animated) */}
                {(scanning || livenessComplete) && (
                    <View className="absolute" style={{ top: 0, left: 0 }}>
                    <Svg width={CIRCLE_RADIUS} height={CIRCLE_RADIUS}>
                        <AnimatedCircle
                            stroke={isInvalid ? "red" : "#00C853"}
                            fill="none"
                            cx={CIRCLE_RADIUS / 2}
                            cy={CIRCLE_RADIUS / 2}
                            r={radius}
                            strokeWidth={STROKE_WIDTH}
                            strokeDasharray={circumference}
                            animatedProps={animatedProps}
                            strokeLinecap="round"
                            rotation={-90}
                            originX={CIRCLE_RADIUS / 2}
                            originY={CIRCLE_RADIUS / 2}
                        />
                    </Svg>
                </View>
                )}
                
            </View>
            <Text className="px-8 text-center text-xl font-semibold text-gray-800">{prompt}</Text>
            {details && (
                <Text className="px-8 text-center text-lg text-gray-500">{details}</Text>
            )}
        </View>

    );
}

package com.anonymous.app961.common;

import org.json.JSONObject;
import org.json.JSONException;

import android.util.Log;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PointF;
import android.graphics.Rect;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.oney.WebRTCModule.videoEffects.VideoFrameProcessor;
import com.oney.WebRTCModule.videoEffects.VideoFrameProcessorFactoryInterface;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceContour;

import org.webrtc.SurfaceTextureHelper;
import org.webrtc.VideoFrame;

import java.util.List;
import java.util.Collections;
import java.util.Arrays;


public class FaceDetectionFactory implements VideoFrameProcessorFactoryInterface {

    private final ReactContext reactContext;
    private volatile Bitmap latestFrameBitmap = null;

    public FaceDetectionFactory(ReactContext context) {
        this.reactContext = context;
    }

    public Bitmap getLatestFrame() {
        return latestFrameBitmap;
    }

    @Override
    public VideoFrameProcessor build() {
        return new VideoFrameProcessor() {
            private BitmapVideoFrameConversion convertor;
            private final FaceDetectionHelper detector = new FaceDetectionHelper();
            private AntiSpoofingHelper antiSpoofHelper;

            {
                try {
                    antiSpoofHelper = new AntiSpoofingHelper(reactContext);
                } catch (Exception e) {
                    Log.e("FaceDetectionFactory:AntiSpoofingHelper", "Failed to initialize AntiSpoofingHelper", e);
                }
            }
            
            @Override
            public VideoFrame process(VideoFrame frame, SurfaceTextureHelper textureHelper) {
                if (convertor == null) {
                    convertor = new BitmapVideoFrameConversion(textureHelper);
                }

                Bitmap inputBitmap = convertor.videoFrame2Bitmap(frame);
                if (inputBitmap == null) return frame;

                List<Face> faces = detector.detectFacesSync(inputBitmap);
                Bitmap outputBitmap = inputBitmap.copy(Bitmap.Config.ARGB_8888, true);


                latestFrameBitmap = inputBitmap.copy(Bitmap.Config.ARGB_8888, true);

                //drawBoundingBoxes(outputBitmap, faces);
                //drawFaceLandmarks(outputBitmap, faces);
                //drawFaceLandmarks(outputBitmap, faces);  

                if (!faces.isEmpty()) {
                    emitFaceData(faces, inputBitmap, outputBitmap);
                } else {
                    emitFaceData(Collections.emptyList(), inputBitmap, outputBitmap);
                }

                VideoFrame resultFrame = convertor.bitmap2VideoFrame(outputBitmap,
                        outputBitmap.getWidth(), outputBitmap.getHeight());

                inputBitmap.recycle();
                outputBitmap.recycle();
                return resultFrame;
            }

            private void drawBoundingBoxes(Bitmap bitmap, List<Face> faces) {
                Canvas canvas = new Canvas(bitmap);
                Paint paint = new Paint();
                paint.setColor(Color.GREEN);
                paint.setStrokeWidth(5);
                paint.setStyle(Paint.Style.STROKE);

                for (Face face : faces) {
                    canvas.drawRect(face.getBoundingBox(), paint);
                }
            }

            private void drawFaceLandmarksOld(Bitmap bitmap, List<Face> faces) {
                Canvas canvas = new Canvas(bitmap);
            
                // Bounding box paint
                Paint boxPaint = new Paint();
                boxPaint.setColor(Color.GREEN);
                boxPaint.setStrokeWidth(4);
                boxPaint.setStyle(Paint.Style.STROKE);
            
                // Landmark paint
                Paint landmarkPaint = new Paint();
                landmarkPaint.setColor(Color.RED);
                landmarkPaint.setStyle(Paint.Style.FILL);
                landmarkPaint.setStrokeWidth(6);
            
                /* for (Face face : faces) {
                    // Draw bounding box
                    canvas.drawRect(face.getBoundingBox(), boxPaint);
            
                    // Draw landmarks (if available)
                    if (face.getLandmark(Face.Landmark.LEFT_EYE) != null) {
                        canvas.drawCircle(
                            face.getLandmark(Face.Landmark.LEFT_EYE).getPosition().x,
                            face.getLandmark(Face.Landmark.LEFT_EYE).getPosition().y,
                            6, landmarkPaint
                        );
                    }
                    if (face.getLandmark(Face.Landmark.RIGHT_EYE) != null) {
                        canvas.drawCircle(
                            face.getLandmark(Face.Landmark.RIGHT_EYE).getPosition().x,
                            face.getLandmark(Face.Landmark.RIGHT_EYE).getPosition().y,
                            6, landmarkPaint
                        );
                    }
                    if (face.getLandmark(Face.Landmark.NOSE_BASE) != null) {
                        canvas.drawCircle(
                            face.getLandmark(Face.Landmark.NOSE_BASE).getPosition().x,
                            face.getLandmark(Face.Landmark.NOSE_BASE).getPosition().y,
                            6, landmarkPaint
                        );
                    }
                    if (face.getLandmark(Face.Landmark.MOUTH_LEFT) != null) {
                        canvas.drawCircle(
                            face.getLandmark(Face.Landmark.MOUTH_LEFT).getPosition().x,
                            face.getLandmark(Face.Landmark.MOUTH_LEFT).getPosition().y,
                            6, landmarkPaint
                        );
                    }
                    if (face.getLandmark(Face.Landmark.MOUTH_RIGHT) != null) {
                        canvas.drawCircle(
                            face.getLandmark(Face.Landmark.MOUTH_RIGHT).getPosition().x,
                            face.getLandmark(Face.Landmark.MOUTH_RIGHT).getPosition().y,
                            6, landmarkPaint
                        );
                    }
                } */
            }

            private void drawFaceLandmarks(Bitmap bitmap, List<Face> faces) {
                Canvas canvas = new Canvas(bitmap);
            
                // Face bounding box paint
                Paint boxPaint = new Paint();
                boxPaint.setColor(Color.GREEN);
                boxPaint.setStrokeWidth(1);
                boxPaint.setStyle(Paint.Style.STROKE);
            
                // Contour paint
                Paint contourPaint = new Paint();
                contourPaint.setColor(Color.CYAN);
                contourPaint.setStrokeWidth(1);
                contourPaint.setStyle(Paint.Style.STROKE);
            
                for (Face face : faces) {
                    // Draw bounding box
                    canvas.drawRect(face.getBoundingBox(), boxPaint);
                    
                    
                    for (FaceContour contour : face.getAllContours()) {
                        for (PointF point : contour.getPoints()) {
                            canvas.drawCircle(point.x, point.y, 2, contourPaint);
                        }
                    }
                    
                }
            }

            
            

            private void emitFaceData(List<Face> faces, Bitmap inputBitmap, Bitmap outputBitmap) {
                if (reactContext == null || !reactContext.hasActiveCatalystInstance()) return;

                Canvas canvas = new Canvas(outputBitmap);
                // Face bounding box paint
                Paint boxPaint = new Paint();
                boxPaint.setColor(Color.GREEN);
                boxPaint.setStrokeWidth(1);
                boxPaint.setStyle(Paint.Style.STROKE);
            
                // Contour paint
                Paint contourPaint = new Paint();
                contourPaint.setColor(Color.CYAN);
                contourPaint.setStrokeWidth(1);
                contourPaint.setStyle(Paint.Style.STROKE);

                WritableArray faceArray = Arguments.createArray();
            
                if (faces.size() == 1 && antiSpoofHelper != null) {
                    // Crop the detected face from the frame and run spoof detection
                    Face face = faces.get(0);
                    WritableMap faceMap = Arguments.createMap();
                    
                    /* Bitmap croppedFace = cropFaceFromBitmap(inputBitmap, face); 
                    float[] spoofScores;
                    
                    try {
                        spoofScores = antiSpoofHelper.runInference(croppedFace);
                    } catch (Exception e) {
                        Log.e("FaceDetection:Antispoof", "Spoof detection failed", e);
                        spoofScores = new float[]{-1, -1}; // fallback values
                    } */
                    
                    //drawFaceLandmarks(outputBitmap, faces);  
                    
                    /* Rect box = face.getBoundingBox();
                    int x = Math.max(0, box.left);
                    int y = Math.max(0, box.top);
                    int w = Math.min(inputBitmap.getWidth() - x, box.width());
                    int h = Math.min(inputBitmap.getHeight() - y, box.height()); */

                    //if (w > 0 && h > 0) {
                        try {
                            //Bitmap croppedFace = Bitmap.createBitmap(inputBitmap, x, y, w, h);
                            //Bitmap resizedFace = Bitmap.createScaledBitmap(croppedFace, 80, 80, true); // Match your ONNX model input size
                            Bitmap croppedFace = cropAndResizeFace(inputBitmap, face.getBoundingBox(), 80, 80); // or 224x224 based on your model

                            float[] spoofScores = antiSpoofHelper.runInference(croppedFace);
                            Log.d("SpoofCheck", "Scores: " + Arrays.toString(spoofScores));
                            boolean isReal = spoofScores[1] > 0.006f;
                            if (isReal) {
                                canvas.drawRect(face.getBoundingBox(), boxPaint);
                                for (FaceContour contour : face.getAllContours()) {
                                    for (PointF point : contour.getPoints()) {
                                        canvas.drawCircle(point.x, point.y, 2, contourPaint);
                                    }
                                }
                                /* float[] embedding = embeddingHelper.runEmbedding(croppedFace);
                                Log.d("ArcFace", "Embedding Length: " + embedding.length);
                                Log.d("ArcFace", "Embedding[0..5]: " + embedding[0] + ", " + embedding[1] + ", " + embedding[2] + ", ...");
                                WritableArray embeddingArray = Arguments.createArray();
                                for (float v : embedding) {
                                    embeddingArray.pushDouble(v);
                                }

                                //WritableMap embeddingPayload = Arguments.createMap();
                                faceMap.putArray("embedding", embeddingArray); */

                                //drawFaceLandmarks(outputBitmap, faces);  
                            }
                            
                            WritableArray scoreArray = Arguments.createArray();
                            for (float score : spoofScores) {
                                scoreArray.pushDouble(score);
                            }
                            faceMap.putArray("spoofScores", scoreArray);
                           

                        } catch (Exception e) {
                            Log.e("SpoofCheck", "Spoof detection error", e);
                        }
                    //}
            
                   
                    //WritableMap faceMap = Arguments.createMap();
                    faceMap.putDouble("smilingProbability", face.getSmilingProbability() != null
                            ? face.getSmilingProbability() : -1);
            
                    faceMap.putDouble("leftEyeOpenProbability", face.getLeftEyeOpenProbability() != null
                            ? face.getLeftEyeOpenProbability() : -1);
            
                    faceMap.putDouble("rightEyeOpenProbability", face.getRightEyeOpenProbability() != null
                            ? face.getRightEyeOpenProbability() : -1);
                    //faceMap.putDouble("smilingProbability", getSafeProb(face.getSmilingProbability()));
                    //faceMap.putDouble("leftEyeOpenProbability", getSafeProb(face.getLeftEyeOpenProbability()));
                    //faceMap.putDouble("rightEyeOpenProbability", getSafeProb(face.getRightEyeOpenProbability()));
                    faceMap.putDouble("headEulerAngleX", face.getHeadEulerAngleX());
                    faceMap.putDouble("headEulerAngleY", face.getHeadEulerAngleY());
                    faceMap.putDouble("headEulerAngleZ", face.getHeadEulerAngleZ());
                    //faceMap.putDouble("antiSpoofScore", spoofProb);
            
                    faceArray.pushMap(faceMap);
                } else {
                    // Fallback: no spoof or multiple faces
                    for (Face face : faces) {
                        WritableMap faceMap = Arguments.createMap();
                        faceMap.putDouble("smilingProbability", face.getSmilingProbability() != null
                            ? face.getSmilingProbability() : -1);
            
                        faceMap.putDouble("leftEyeOpenProbability", face.getLeftEyeOpenProbability() != null
                                ? face.getLeftEyeOpenProbability() : -1);
                
                        faceMap.putDouble("rightEyeOpenProbability", face.getRightEyeOpenProbability() != null
                                ? face.getRightEyeOpenProbability() : -1);
                        //faceMap.putDouble("smilingProbability", getSafeProb(face.getSmilingProbability()));
                        //faceMap.putDouble("leftEyeOpenProbability", getSafeProb(face.getLeftEyeOpenProbability()));
                        //faceMap.putDouble("rightEyeOpenProbability", getSafeProb(face.getRightEyeOpenProbability()));
                        faceMap.putDouble("headEulerAngleX", face.getHeadEulerAngleX());
                        faceMap.putDouble("headEulerAngleY", face.getHeadEulerAngleY());
                        faceMap.putDouble("headEulerAngleZ", face.getHeadEulerAngleZ());
                        //faceMap.putDouble("spoofScores", -1); // Not available
                        faceArray.pushMap(faceMap);
                    }
                }
            
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("FaceProbabilities", faceArray);
            }
            
            
            private String runAntiSpoof(Bitmap faceBitmap) {
                try {
                    float[] output = antiSpoofHelper.runInference(faceBitmap);
                    int label = output[0] > output[1] ? 0 : 1; 
                    float score = Math.max(output[0], output[1]);
                    // todo
                    return label == 1 ? "Real Face: " + score : "Fake Face: " + score;
                } catch (Exception e) {
                    Log.e("AntiSpoof", "Inference failed", e);
                    return "Spoof detection error";
                }
            }

            private Bitmap cropFaceFromBitmap(Bitmap source, Face face) {
                try {
                    Rect bounds = face.getBoundingBox();
                    int left = Math.max(0, bounds.left);
                    int top = Math.max(0, bounds.top);
                    int right = Math.min(source.getWidth(), bounds.right);
                    int bottom = Math.min(source.getHeight(), bounds.bottom);
            
                    return Bitmap.createBitmap(source, left, top, right - left, bottom - top);
                } catch (Exception e) {
                    Log.e("FaceDetection", "Failed to crop face", e);
                    return source;
                }
            }

            private Bitmap cropAndResizeFace(Bitmap bitmap, Rect bbox, int targetWidth, int targetHeight) {
                // Padding factor (e.g., 20% extra on all sides)
                float paddingRatio = 0.2f;
            
                int paddingX = (int) (bbox.width() * paddingRatio);
                int paddingY = (int) (bbox.height() * paddingRatio);
            
                int x = Math.max(bbox.left - paddingX, 0);
                int y = Math.max(bbox.top - paddingY, 0);
                int width = Math.min(bbox.width() + 2 * paddingX, bitmap.getWidth() - x);
                int height = Math.min(bbox.height() + 2 * paddingY, bitmap.getHeight() - y);
            
                Bitmap cropped = Bitmap.createBitmap(bitmap, x, y, width, height);
            
                return Bitmap.createScaledBitmap(cropped, targetWidth, targetHeight, true);
            }
            
            
            
        };
    }
}

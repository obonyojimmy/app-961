package com.anonymous.app961.common;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PointF;

import com.oney.WebRTCModule.videoEffects.VideoFrameProcessor;
import com.oney.WebRTCModule.videoEffects.VideoFrameProcessorFactoryInterface;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceContour;

import org.webrtc.SurfaceTextureHelper;
import org.webrtc.VideoFrame;

import java.util.List;

public class FaceDetectionFactory implements VideoFrameProcessorFactoryInterface {
    @Override
    public VideoFrameProcessor build() {
        return new VideoFrameProcessor() {
            private BitmapVideoFrameConversion convertor;
            private final FaceDetectionHelper detector = new FaceDetectionHelper();

            @Override
            public VideoFrame process(VideoFrame frame, SurfaceTextureHelper textureHelper) {
                if (convertor == null) {
                    convertor = new BitmapVideoFrameConversion(textureHelper);
                }

                Bitmap inputBitmap = convertor.videoFrame2Bitmap(frame);
                if (inputBitmap == null) return frame;

                List<Face> faces = detector.detectFacesSync(inputBitmap);
                Bitmap outputBitmap = inputBitmap.copy(Bitmap.Config.ARGB_8888, true);

                //drawBoundingBoxes(outputBitmap, faces);
                //drawFaceLandmarks(outputBitmap, faces);
                drawFaceLandmarks(outputBitmap, faces);  

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
            
            
        };
    }
}

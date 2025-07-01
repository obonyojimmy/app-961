package com.anonymous.app961.common;

import android.graphics.Bitmap;
import android.util.Log;

import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.face.Face;
import com.google.mlkit.vision.face.FaceDetection;
import com.google.mlkit.vision.face.FaceDetector;
import com.google.mlkit.vision.face.FaceDetectorOptions;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;

public class FaceDetectionHelper {
    private final FaceDetector detector;

    public FaceDetectionHelper() {
        FaceDetectorOptions options = new FaceDetectorOptions.Builder()
                .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
                .setContourMode(FaceDetectorOptions.CONTOUR_MODE_ALL)
                .build();

        this.detector = FaceDetection.getClient(options);
    }

    public List<Face> detectFacesSync(Bitmap bitmap) {
        try {
            final InputImage image = InputImage.fromBitmap(bitmap, 0);
            final CountDownLatch latch = new CountDownLatch(1);
            final List<Face>[] resultHolder = new List[]{Collections.emptyList()};

            detector.process(image)
                    .addOnSuccessListener(new OnSuccessListener<List<Face>>() {
                        @Override
                        public void onSuccess(List<Face> faces) {
                            resultHolder[0] = faces;
                            latch.countDown();
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(Exception e) {
                            Log.e("FaceDetectionHelper", "Detection failed: " + e.getMessage());
                            latch.countDown();
                        }
                    });

            latch.await();
            return resultHolder[0];

        } catch (Exception e) {
            Log.e("FaceDetectionHelper", "Exception: ", e);
            return Collections.emptyList();
        }
    }

    public void close() {
        detector.close();
    }
}

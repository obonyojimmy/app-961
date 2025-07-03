package com.anonymous.app961;

import android.graphics.Bitmap;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.Arguments;

import com.oney.WebRTCModule.videoEffects.ProcessorProvider;

import com.anonymous.app961.common.FaceDetectionFactory;
import com.anonymous.app961.common.ArcFaceEmbeddingHelper;

public class VideoEffectModule extends ReactContextBaseJavaModule {
    private static FaceDetectionFactory faceDetectionFactory;

    VideoEffectModule(ReactApplicationContext context) {
        super(context);
    }

    // add to VideoEffectModule.java
    @Override
    public String getName() {
        return "VideoEffectModule";
    }

    @ReactMethod
    public String makeGreat(String name) {
        return name + " is great";
    }

    @ReactMethod
    public void registerFaceDetectionMethod() {
        faceDetectionFactory = new FaceDetectionFactory(getReactApplicationContext());
        ProcessorProvider.addProcessor("faceDetection", faceDetectionFactory);
    }

    @ReactMethod
    public void extractFaceEmbedding(Callback successCallback, Callback errorCallback) {
        if (faceDetectionFactory == null) {
            errorCallback.invoke("FaceDetection not initialized");
            return;
        }
    
        Bitmap latest = faceDetectionFactory.getLatestFrame();
        if (latest == null) {
            errorCallback.invoke("No frame captured yet");
            return;
        }
    
        try {
            ArcFaceEmbeddingHelper embedder = new ArcFaceEmbeddingHelper(getReactApplicationContext());
            float[] embedding = embedder.runEmbedding(latest);
            embedder.close();
    
            WritableArray jsArray = Arguments.createArray();
            for (float val : embedding) {
                jsArray.pushDouble(val);
            }
    
            successCallback.invoke(jsArray);
        } catch (Exception e) {
            errorCallback.invoke("Embedding failed: " + e.getMessage());
        }
    }
}
package com.anonymous.app961;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.oney.WebRTCModule.videoEffects.ProcessorProvider;

import com.anonymous.app961.common.FaceDetectionFactory;

public class VideoEffectModule extends ReactContextBaseJavaModule {
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
        FaceDetectionFactory processor = new FaceDetectionFactory();
        ProcessorProvider.addProcessor("faceDetection", processor);
    }
}
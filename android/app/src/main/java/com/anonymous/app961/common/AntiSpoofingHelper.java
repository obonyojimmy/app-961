package com.anonymous.app961.common;

import com.anonymous.app961.R;

import android.content.Context;
import android.graphics.Bitmap;
import android.util.Log;

import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;
import ai.onnxruntime.OrtException;
import ai.onnxruntime.OnnxTensor;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.FloatBuffer;
import java.util.Collections;

import java.util.Arrays;

public class AntiSpoofingHelper {
    private final OrtEnvironment env;
    private final OrtSession session;

    public AntiSpoofingHelper(Context context) throws OrtException, IOException {
        env = OrtEnvironment.getEnvironment();
        byte[] modelBytes = readModelFromRaw(context);
        session = env.createSession(modelBytes);
    }

    private byte[] readModelFromRaw(Context context) throws IOException {
        InputStream input = context.getResources().openRawResource(R.raw.antispoof_model);
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();

        int nRead;
        byte[] data = new byte[16384];
        while ((nRead = input.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }

        buffer.flush();
        return buffer.toByteArray();
    }

    

    public float[] runInference(Bitmap inputBitmap) throws OrtException {
        // ONNX expects: shape [1, 3, H, W], e.g., [1, 3, 80, 80]
        int inputHeight = inputBitmap.getHeight();
        int inputWidth = inputBitmap.getWidth();
    
        float[] inputTensor = new float[1 * 3 * inputHeight * inputWidth];
    
        int idx = 0;
        for (int y = 0; y < inputHeight; y++) {
            for (int x = 0; x < inputWidth; x++) {
                int pixel = inputBitmap.getPixel(x, y);
    
                // Normalize RGB [0,1] and convert HWC -> CHW (channel first)
                float r = ((pixel >> 16) & 0xFF) / 255.0f;
                float g = ((pixel >> 8) & 0xFF) / 255.0f;
                float b = (pixel & 0xFF) / 255.0f;
    
                inputTensor[idx] = r;
                inputTensor[idx + inputHeight * inputWidth] = g;
                inputTensor[idx + 2 * inputHeight * inputWidth] = b;
                idx++;
            }
        }
    
        long[] shape = {1, 3, inputHeight, inputWidth};
        OnnxTensor input = OnnxTensor.createTensor(env, FloatBuffer.wrap(inputTensor), shape);
    
        OrtSession.Result result = session.run(Collections.singletonMap(session.getInputNames().iterator().next(), input));
        float[][] logits = (float[][]) result.get(0).getValue();
        float[] softmax = applySoftmax(logits[0]);

        int predictedClass = getMaxIndex(softmax);
        float confidence = softmax[predictedClass];
        Log.d("AntiSpoofResults", "Predicted class: " + predictedClass + " with confidence: " + confidence);

        //Log.d("AntiSpoofResults", "ONNX Output Shape: " + output.length + "x" + output[0].length);
        Log.d("AntiSpoofResults", "Scores: " + Arrays.toString(softmax));
    
        return softmax;  // e.g., [real_score, fake_score]
    }

    private float[] applySoftmax(float[] logits) {
        float max = Float.NEGATIVE_INFINITY;
        for (float logit : logits) {
            if (logit > max) max = logit;
        }

        float sum = 0f;
        float[] expScores = new float[logits.length];
        for (int i = 0; i < logits.length; i++) {
            expScores[i] = (float) Math.exp(logits[i] - max); // subtract max for numerical stability
            sum += expScores[i];
        }

        for (int i = 0; i < expScores.length; i++) {
            expScores[i] /= sum;
        }

        return expScores;
    }

    private int getMaxIndex(float[] values) {
        int maxIndex = 0;
        float maxValue = values[0];
        for (int i = 1; i < values.length; i++) {
            if (values[i] > maxValue) {
                maxIndex = i;
                maxValue = values[i];
            }
        }
        return maxIndex;
    }
    
    

    public void close() throws OrtException {
        session.close();
        env.close();
    }
}

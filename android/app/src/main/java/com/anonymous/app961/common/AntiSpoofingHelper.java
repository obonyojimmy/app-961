package com.anonymous.app961.common;

import com.anonymous.app961.R;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.util.Log;

import ai.onnxruntime.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.FloatBuffer;
import java.util.Collections;
import java.util.Arrays;

public class AntiSpoofingHelper {
    private static final String TAG = "AntiSpoofHelper";

    private final OrtEnvironment env;
    private final OrtSession session;
    private final String inputName;

    public AntiSpoofingHelper(Context context) throws OrtException, IOException {
        env = OrtEnvironment.getEnvironment();
        byte[] modelBytes = readModelFromRaw(context);
        session = env.createSession(modelBytes);
        inputName = session.getInputNames().iterator().next();
    }

    private byte[] readModelFromRaw(Context context) throws IOException {
        InputStream input = context.getResources().openRawResource(R.raw.antispoof_mn3);
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();

        int nRead;
        byte[] data = new byte[16384];
        while ((nRead = input.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }

        buffer.flush();
        return buffer.toByteArray();
    }

    public float[] predict(Bitmap bitmap) throws OrtException {
            Bitmap inputBitmap = Bitmap.createScaledBitmap(bitmap, 128, 128, true);
            int inputHeight = inputBitmap.getHeight();
            int inputWidth = inputBitmap.getWidth();
            //float[] inputTensor = preprocess(inputBitmap);
            //long[] shape = {1, 3, inputHeight, inputWidth};
            float[] inputTensor = new float[1 * 3 * inputHeight * inputWidth];
    
            /* int idx = 0;
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
            } */
            /* int idx = 0;
            for (int y = 0; y < inputHeight; y++) {
                for (int x = 0; x < inputWidth; x++) {
                    int pixel = inputBitmap.getPixel(x, y);
                    inputTensor[idx++] = (((pixel >> 16) & 0xFF) - 127.5f) / 128.0f; // R
                    inputTensor[idx++] = (((pixel >> 8) & 0xFF) - 127.5f) / 128.0f;  // G
                    inputTensor[idx++] = ((pixel & 0xFF) - 127.5f) / 128.0f;         // B
                }
            } */
            int size = inputHeight * inputWidth;
            int bOffset = 0;
            int gOffset = size;
            int rOffset = 2 * size;
            
            for (int y = 0; y < inputHeight; y++) {
                for (int x = 0; x < inputWidth; x++) {
                    int pixel = inputBitmap.getPixel(x, y);
                    int index = y * inputWidth + x;
            
                    inputTensor[bOffset + index] = (((pixel) & 0xFF) - 127.5f) / 128.0f;          // B
                    inputTensor[gOffset + index] = (((pixel >> 8) & 0xFF) - 127.5f) / 128.0f;     // G
                    inputTensor[rOffset + index] = (((pixel >> 16) & 0xFF) - 127.5f) / 128.0f;    // R

                }
            }
           // Fill inputTensor in CHW order (channel-first: R, G, B)
            /* for (int y = 0; y < inputHeight; y++) {
                for (int x = 0; x < inputWidth; x++) {
                    int pixel = inputBitmap.getPixel(x, y);

                    float r = ((pixel >> 16) & 0xFF) / 255.0f;
                    float g = ((pixel >> 8) & 0xFF) / 255.0f;
                    float b = (pixel & 0xFF) / 255.0f;

                    int offset = y * inputWidth + x;

                    // CHW format
                    inputTensor[0 * inputHeight * inputWidth + offset] = r; // Red channel
                    inputTensor[1 * inputHeight * inputWidth + offset] = g; // Green channel
                    inputTensor[2 * inputHeight * inputWidth + offset] = b; // Blue channel
                }
            } */

        
            long[] shape = {1, 3, inputHeight, inputWidth};
            OnnxTensor input = OnnxTensor.createTensor(env, FloatBuffer.wrap(inputTensor), shape);
            OrtSession.Result result = session.run(Collections.singletonMap(session.getInputNames().iterator().next(), input));
            float[][] output = (float[][]) result.get(0).getValue();
            //Log.d(TAG, "Raw model output: " + Arrays.toString(output[0]));
            //float[] probs = softmax(output[0]);
            float[] probs = applySoftmax(output[0]);
            int label = getMaxIndex(probs);
            float score = probs[label];
            Log.d(TAG, "Scores: " + Arrays.toString(probs));
            //Log.d(TAG, "Predicted class: " + label + " with confidence: " + score);
            //return new float[]{label, score};
            return probs; //new float[]{label, score};
            //return probs;
            //OnnxTensor input = OnnxTensor.createTensor(env, FloatBuffer.wrap(inputTensor), new long[]{1, 3, inputHeight, inputWidth});

            /*try {
             try (OrtSession.Result result = session.run(Collections.singletonMap(inputName, input))) {
                float[][] output = (float[][]) result.get(0).getValue();

                Log.d(TAG, "Raw model output: [" + output[0][0] + ", " + output[0][1] + "]");

                float[] probs = softmax(output[0]);
                //Log.d(TAG, "Softmax probabilities: [" + probs[0] + ", " + probs[1] + "]");
                Log.d(TAG, "Scores: " + Arrays.toString(probs));
                return probs;
                //int label = probs[0] > probs[1] ? 0 : 1;
                //float score = probs[label];

                //Log.d(TAG, "Predicted Label: " + label + " | Score: " + score);

                //return new float[]{label, score};
            }
        } catch (Exception e) {
            Log.e(TAG, "Prediction failed: ", e);
            return new float[]{-1, 0.0f};
        } */
    }

    private float[] preprocess(Bitmap bitmap) {
        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, 128, 128, true);

        int width = resizedBitmap.getWidth();
        int height = resizedBitmap.getHeight();
        float[] floatValues = new float[3 * width * height];
        int[] pixels = new int[width * height];
        resizedBitmap.getPixels(pixels, 0, width, 0, 0, width, height);

        // Fill floatValues in BGR CHW format
        for (int i = 0; i < pixels.length; ++i) {
            int pixel = pixels[i];
            int r = (pixel >> 16) & 0xFF;
            int g = (pixel >> 8) & 0xFF;
            int b = (pixel) & 0xFF;

            int row = i;
            floatValues[0 * width * height + row] = b / 255.0f;
            floatValues[1 * width * height + row] = g / 255.0f;
            floatValues[2 * width * height + row] = r / 255.0f;
        }

        return floatValues;
    }

    private float[] softmax(float[] logits) {
        float max = Math.max(logits[0], logits[1]);
        double exp0 = Math.exp(logits[0] - max);
        double exp1 = Math.exp(logits[1] - max);
        double sum = exp0 + exp1;

        return new float[]{
            (float) (exp0 / sum),
            (float) (exp1 / sum)
        };
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

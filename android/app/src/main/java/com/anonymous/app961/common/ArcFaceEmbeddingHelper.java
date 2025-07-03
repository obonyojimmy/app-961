package com.anonymous.app961.common;

import com.anonymous.app961.R;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Matrix;
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

public class ArcFaceEmbeddingHelper {
    private final OrtEnvironment env;
    private final OrtSession session;

    public ArcFaceEmbeddingHelper(Context context) throws OrtException, IOException {
        env = OrtEnvironment.getEnvironment();
        byte[] modelBytes = readModelFromRaw(context);
        session = env.createSession(modelBytes, new OrtSession.SessionOptions());
    }

    private byte[] readModelFromRaw(Context context) throws IOException {
        InputStream input = context.getResources().openRawResource(R.raw.mobilefacenet);
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();

        int nRead;
        byte[] data = new byte[16384];
        while ((nRead = input.read(data, 0, data.length)) != -1) {
            buffer.write(data, 0, nRead);
        }

        buffer.flush();
        return buffer.toByteArray();
    }

    public float[] runEmbedding(Bitmap faceBitmap) throws OrtException {
        Bitmap resized = Bitmap.createScaledBitmap(faceBitmap, 112, 112, true);

        float[] inputTensor = new float[1 * 3 * 112 * 112];
        int idx = 0;
        for (int y = 0; y < 112; y++) {
            for (int x = 0; x < 112; x++) {
                int pixel = resized.getPixel(x, y);
                inputTensor[idx++] = (((pixel >> 16) & 0xFF) - 127.5f) / 128.0f; // R
                inputTensor[idx++] = (((pixel >> 8) & 0xFF) - 127.5f) / 128.0f;  // G
                inputTensor[idx++] = ((pixel & 0xFF) - 127.5f) / 128.0f;         // B
            }
        }

        long[] shape = {1, 3, 112, 112};
        OnnxTensor input = OnnxTensor.createTensor(env, FloatBuffer.wrap(inputTensor), shape);
        OrtSession.Result result = session.run(Collections.singletonMap(session.getInputNames().iterator().next(), input));
        float[][] embedding = (float[][]) result.get(0).getValue();

        return embedding[0]; // 512-d float array
    }

    public void close() throws OrtException {
        session.close();
        env.close();
    }
}

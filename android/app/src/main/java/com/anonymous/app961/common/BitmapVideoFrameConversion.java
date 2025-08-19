package com.anonymous.app961.common;

import android.graphics.Bitmap;

import org.webrtc.JavaI420Buffer;
import org.webrtc.SurfaceTextureHelper;
import org.webrtc.VideoFrame;

import java.nio.ByteBuffer;

public class BitmapVideoFrameConversion {
    private SurfaceTextureHelper textureHelper;

    public BitmapVideoFrameConversion(SurfaceTextureHelper helper) {
        this.textureHelper = helper;
    }

    /**
     * Converts a VideoFrame to a Bitmap using Kotlin singleton YuvFrame helper class.
     */
    public Bitmap videoFrame2Bitmap(VideoFrame frame) {
        if (frame == null) return null;
        return YuvFrame.INSTANCE.bitmapFromVideoFrame(frame);
    }

    /**
     * Converts a Bitmap to a VideoFrame using WebRTC utilities.
     * This is a naive manual ARGB → I420 converter (for demo purposes).
     */
    public VideoFrame bitmap2VideoFrame(Bitmap bitmap, int width, int height) {
        if (bitmap == null) return null;

        JavaI420Buffer buffer = JavaI420Buffer.allocate(width, height);

        int[] argbPixels = new int[width * height];
        bitmap.getPixels(argbPixels, 0, width, 0, 0, width, height);

        ByteBuffer y = buffer.getDataY();
        ByteBuffer u = buffer.getDataU();
        ByteBuffer v = buffer.getDataV();
        int strideY = buffer.getStrideY();
        int strideU = buffer.getStrideU();
        int strideV = buffer.getStrideV();

        for (int j = 0; j < height; j++) {
            for (int i = 0; i < width; i++) {
                int color = argbPixels[j * width + i];
                int r = (color >> 16) & 0xff;
                int g = (color >> 8) & 0xff;
                int b = color & 0xff;

                int yVal = (int)(0.257 * r + 0.504 * g + 0.098 * b + 16);
                int uVal = (int)(-0.148 * r - 0.291 * g + 0.439 * b + 128);
                int vVal = (int)(0.439 * r - 0.368 * g - 0.071 * b + 128);

                y.put(j * strideY + i, (byte) Math.max(0, Math.min(255, yVal)));

                if ((j % 2 == 0) && (i % 2 == 0)) {
                    int uvIndex = (j / 2) * strideU + (i / 2);
                    u.put(uvIndex, (byte) Math.max(0, Math.min(255, uVal)));
                    v.put(uvIndex, (byte) Math.max(0, Math.min(255, vVal)));
                }
            }
        }

        long timestampNs = System.nanoTime();
        return new VideoFrame(buffer, 0, timestampNs);
    }
}
import Foundation
import UIKit
import WebRTC

@objc class BitmapVideoFrameConversion: NSObject {
    
    private var pixelBufferPool: CVPixelBufferPool?
    
    @objc init(pixelBufferPool: CVPixelBufferPool? = nil) {
        self.pixelBufferPool = pixelBufferPool
    }
    
    @objc func videoFrame2Bitmap(_ frame: RTCVideoFrame?) -> UIImage? {
        guard let frame = frame else { return nil }
        return YuvFrame.bitmapFromVideoFrame(frame)
    }
    
    @objc func bitmap2VideoFrame(_ bitmap: UIImage, width: Int, height: Int) -> RTCVideoFrame? {
        guard let pixelBuffer = BitmapVideoFrameConversion.pixelBuffer(from: bitmap, width: width, height: height) else {
            return nil
        }
        
        let timeStampNs = Int64(Date().timeIntervalSince1970 * 1_000_000_000)
        let rtcBuffer = RTCCVPixelBuffer(pixelBuffer: pixelBuffer)
        return RTCVideoFrame(buffer: rtcBuffer, rotation: ._0, timeStampNs: timeStampNs)
    }
    
    static func pixelBuffer(from image: UIImage, width: Int, height: Int) -> CVPixelBuffer? {
        var pixelBuffer: CVPixelBuffer?
        let attrs: [String: Any] = [
            kCVPixelBufferCGImageCompatibilityKey as String: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
        ]
        let status = CVPixelBufferCreate(kCFAllocatorDefault,
                                         width,
                                         height,
                                         kCVPixelFormatType_32BGRA,
                                         attrs as CFDictionary,
                                         &pixelBuffer)
        
        guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
            return nil
        }
        
        CVPixelBufferLockBaseAddress(buffer, [])
        let context = CGContext(data: CVPixelBufferGetBaseAddress(buffer),
                                width: width,
                                height: height,
                                bitsPerComponent: 8,
                                bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
                                space: CGColorSpaceCreateDeviceRGB(),
                                bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue)
        
        if let cgImage = image.cgImage {
            context?.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        }
        CVPixelBufferUnlockBaseAddress(buffer, [])

        return buffer
    }
}

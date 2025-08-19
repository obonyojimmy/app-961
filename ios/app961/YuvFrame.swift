import Foundation
import UIKit
import CoreVideo
import WebRTC

@objc class YuvFrame: NSObject {
    
    @objc static func bitmapFromVideoFrame(_ videoFrame: RTCVideoFrame?) -> UIImage? {
        guard let frame = videoFrame else { return nil }
        
        let i420Buffer = frame.buffer.toI420()
        let width = i420Buffer.width
        let height = i420Buffer.height

        // Convert I420 to UIImage using CoreGraphics
        guard let image = convertI420BufferToUIImage(i420Buffer: i420Buffer) else {
            print("Failed to convert I420 to UIImage")
            return nil
        }

        return image
    }
    
    private static func convertI420BufferToUIImage(i420Buffer: RTCI420Buffer) -> UIImage? {
        // Convert I420 -> ARGB
        let width = i420Buffer.width
        let height = i420Buffer.height

        // Allocate ARGB buffer
        let bytesPerPixel = 4
        let argbBytes = UnsafeMutablePointer<UInt8>.allocate(capacity: width * height * bytesPerPixel)
        defer {
            argbBytes.deallocate()
        }

        // Convert manually or use Accelerate/vImage or CoreImage pipelines
        // Here: simple grayscale as placeholder
        for y in 0..<height {
            for x in 0..<width {
                let yIndex = y * i420Buffer.strideY + x
                let yVal = i420Buffer.dataY.advanced(by: yIndex).pointee

                let pixelIndex = (y * width + x) * bytesPerPixel
                argbBytes[pixelIndex] = yVal  // R
                argbBytes[pixelIndex + 1] = yVal  // G
                argbBytes[pixelIndex + 2] = yVal  // B
                argbBytes[pixelIndex + 3] = 255  // A
            }
        }

        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(data: argbBytes,
                                width: width,
                                height: height,
                                bitsPerComponent: 8,
                                bytesPerRow: width * bytesPerPixel,
                                space: colorSpace,
                                bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
        
        guard let cgImage = context?.makeImage() else {
            return nil
        }

        return UIImage(cgImage: cgImage)
    }
}

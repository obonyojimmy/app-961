import UIKit

extension UIImage {
    /// Converts UIImage to float32 array (CHW, normalized to [-1, 1])
    func toNormalizedCHW(resized size: CGSize) -> [Float]? {
        guard let resizedImage = self.resized(to: size),
              let cgImage = resizedImage.cgImage else { return nil }

        let width = Int(size.width)
        let height = Int(size.height)

        var floatArray = [Float](repeating: 0.0, count: 3 * width * height)

        let colorSpace = CGColorSpaceCreateDeviceRGB()
        let context = CGContext(data: nil,
                                width: width,
                                height: height,
                                bitsPerComponent: 8,
                                bytesPerRow: width * 4,
                                space: colorSpace,
                                bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)!

        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        guard let data = context.data else { return nil }

        let ptr = data.bindMemory(to: UInt8.self, capacity: width * height * 4)

        for y in 0..<height {
            for x in 0..<width {
                let index = (y * width + x) * 4

                let r = Float(ptr[index])
                let g = Float(ptr[index + 1])
                let b = Float(ptr[index + 2])

                let offset = y * width + x
                floatArray[0 * width * height + offset] = (r - 127.5) / 128.0
                floatArray[1 * width * height + offset] = (g - 127.5) / 128.0
                floatArray[2 * width * height + offset] = (b - 127.5) / 128.0
            }
        }

        return floatArray
    }

    func resized(to targetSize: CGSize) -> UIImage? {
        UIGraphicsBeginImageContextWithOptions(targetSize, false, 0.0)
        self.draw(in: CGRect(origin: .zero, size: targetSize))
        let result = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        return result
    }
}

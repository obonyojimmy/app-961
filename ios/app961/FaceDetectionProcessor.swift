import Foundation
import WebRTC
import UIKit

@objc(FaceDetectionProcessor)
class FaceDetectionProcessor: NSObject, VideoFrameProcessorDelegate {
    private var converter = BitmapVideoFrameConversion()
    private var latestFrame: UIImage?
    private let detector = FaceDetectionHelper()
    
    override init() {
        super.init()
    }

    @objc func capturer(_ capturer: RTCVideoCapturer!, didCapture frame: RTCVideoFrame!) -> RTCVideoFrame! {
        guard let inputImage = converter.videoFrame2Bitmap(frame) else {
            return frame
        }

        self.latestFrame = inputImage

        detector.detectFaces(image: inputImage) { [weak self] faces in
            guard let self = self else { return }

            // Draw contours
            let outputImage = self.drawContours(on: inputImage, faces: faces)

            // Emit to JS
            self.emitFaceData(faces: faces)

            // Optional: replace frame with modified one (or return original if not needed)
            if let modifiedFrame = self.converter.bitmap2VideoFrame(outputImage, width: Int(inputImage.size.width), height: Int(inputImage.size.height)) {
                return modifiedFrame
            }

        }

        return frame
    }

    private func drawContours(on image: UIImage, faces: [FaceData]) -> UIImage {
        UIGraphicsBeginImageContextWithOptions(image.size, false, 0.0)
        image.draw(at: .zero)

        guard let context = UIGraphicsGetCurrentContext() else {
            return image
        }

        context.setStrokeColor(UIColor.cyan.cgColor)
        context.setLineWidth(1.0)

        for face in faces {
            for contour in face.contours {
                for point in contour {
                    let circleRect = CGRect(x: point.x - 1, y: point.y - 1, width: 2, height: 2)
                    context.strokeEllipse(in: circleRect)
                }
            }
        }

        let resultImage = UIGraphicsGetImageFromCurrentImageContext() ?? image
        UIGraphicsEndImageContext()
        return resultImage
    }

    private func emitFaceData(faces: [FaceData]) {
        var faceArray: [[String: Any]] = []

        for face in faces {
            var faceMap: [String: Any] = [:]
            faceMap["smilingProbability"] = face.smilingProbability ?? -1
            faceMap["leftEyeOpenProbability"] = face.leftEyeOpenProbability ?? -1
            faceMap["rightEyeOpenProbability"] = face.rightEyeOpenProbability ?? -1
            faceMap["headEulerAngleX"] = face.headEulerAngleX
            faceMap["headEulerAngleY"] = face.headEulerAngleY
            faceMap["headEulerAngleZ"] = face.headEulerAngleZ
            faceArray.append(faceMap)
        }

        DispatchQueue.main.async {
            if let bridge = ReactNativeBridgeHolder.shared.bridge {
                bridge.enqueueJSCall("RCTDeviceEventEmitter", method: "emit", args: ["FaceProbabilities", faceArray], completion: nil)
            }
        }
    }
}

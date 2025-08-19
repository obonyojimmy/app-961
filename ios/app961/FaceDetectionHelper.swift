import Foundation
import UIKit
import MLKitFaceDetection
import MLKitVision

@objc class FaceDetectionHelper: NSObject {
    private let detector: FaceDetector

    override init() {
        let options = FaceDetectorOptions()
        options.performanceMode = .fast
        options.contourMode = .all
        options.classificationMode = .all
        self.detector = FaceDetector.faceDetector(options: options)
    }

    /// Asynchronously detects faces in the given UIImage
    func detectFaces(in image: UIImage, completion: @escaping ([Face]) -> Void) {
        guard let inputImage = self.inputImage(from: image) else {
            print("Failed to convert UIImage to MLKit InputImage")
            completion([])
            return
        }

        detector.process(inputImage) { faces, error in
            if let error = error {
                print("Face detection error: \(error)")
                completion([])
                return
            }
            completion(faces ?? [])
        }
    }

    /// Synchronously detects faces using DispatchSemaphore (blocking)
    @objc func detectFacesSync(_ image: UIImage) -> [Face] {
        guard let inputImage = self.inputImage(from: image) else {
            print("Failed to convert UIImage to MLKit InputImage")
            return []
        }

        let semaphore = DispatchSemaphore(value: 0)
        var detectedFaces: [Face] = []

        detector.process(inputImage) { faces, error in
            if let error = error {
                print("Face detection failed: \(error.localizedDescription)")
            } else {
                detectedFaces = faces ?? []
            }
            semaphore.signal()
        }

        _ = semaphore.wait(timeout: .now() + 2.0) // Timeout after 2 seconds
        return detectedFaces
    }

    private func inputImage(from image: UIImage) -> InputImage? {
        guard let cgImage = image.cgImage else { return nil }
        return InputImage(cgImage: cgImage, orientation: image.imageOrientation)
    }

    @objc func close() {
        detector.close()
    }
}

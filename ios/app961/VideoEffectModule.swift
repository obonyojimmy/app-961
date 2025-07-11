import Foundation
import WebRTC
import UIKit

@objc(VideoEffectModule)
class VideoEffectModule: NSObject {
    static var faceDetectionFactory: FaceDetectionProcessor?

    @objc
    func registerFaceDetectionMethod() {
        let processor = FaceDetectionProcessor()
        Self.faceDetectionFactory = processor
        ProcessorProvider.addProcessor(FaceDetectionProcessor.self, forName: "faceDetection")
    }

    @objc
    func extractFaceEmbedding(
        _ successCallback: @escaping RCTResponseSenderBlock,
        errorCallback: @escaping RCTResponseSenderBlock
    ) {
        guard let processor = Self.faceDetectionFactory else {
            errorCallback(["FaceDetection not initialized"])
            return
        }

        guard let latest = processor.latestFrame else {
            errorCallback(["No frame captured yet"])
            return
        }

        do {
            let embedder = try ArcFaceEmbeddingHelper()
            let embedding = try embedder.runEmbedding(bitmap: latest)
            embedder.close()

            let jsArray = embedding.map { Double($0) }
            successCallback([jsArray])
        } catch {
            errorCallback(["Embedding failed: \(error.localizedDescription)"])
        }
    }

    @objc
    func makeGreat(_ name: String, resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
        resolve("\(name) is great")
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}

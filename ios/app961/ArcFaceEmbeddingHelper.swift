import UIKit
import onnxruntime_objc

@objc class ArcFaceEmbeddingHelper: NSObject {
    private var env: ORTEnv
    private var session: ORTSession
    private var inputName: String

    override init() {
        do {
            env = try ORTEnv(loggingLevel: ORTLoggingLevel.warning)
            let modelData = try Self.loadModel(named: "mobilefacenet")
            session = try ORTSession(env: env, modelBytes: modelData, sessionOptions: nil)
            inputName = try session.inputNames().first as? String ?? "input"
        } catch {
            fatalError("Failed to initialize ArcFaceEmbeddingHelper: \(error)")
        }
    }

    private static func loadModel(named name: String) throws -> Data {
        guard let url = Bundle.main.url(forResource: name, withExtension: "ort") else {
            throw NSError(domain: "onnx", code: 2, userInfo: [NSLocalizedDescriptionKey: "Model not found"])
        }
        return try Data(contentsOf: url)
    }

    @objc func runEmbedding(from image: UIImage) -> [Float] {
        guard let inputTensor = image.toNormalizedCHW(resized: CGSize(width: 112, height: 112)) else {
            print("Failed to prepare input image")
            return []
        }

        do {
            let shape: [NSNumber] = [1, 3, 112, 112]
            let tensor = try ORTValue(tensorData: Data(buffer: UnsafeBufferPointer(start: inputTensor, count: inputTensor.count)),
                                      elementType: ORTTensorElementDataType.float,
                                      shape: shape)

            let result = try session.run(withInputs: [inputName: tensor],
                                         outputNames: try session.outputNames(),
                                         runOptions: nil)

            guard let outputTensor = result.first?.value as? ORTValue,
                  let outputArray = try outputTensor.tensorData() as? [Float] else {
                return []
            }

            return outputArray
        } catch {
            print("ONNX inference failed: \(error)")
            return []
        }
    }

    deinit {
        try? session.close()
    }
}

import Foundation
import UIKit
import onnxruntime_objc

@objc class AntiSpoofingHelper: NSObject {
    private var env: ORTEnv?
    private var session: ORTSession?
    private var inputName: String = "input" // fallback if not found

    override init() {
        super.init()

        do {
            try initializeSession()
        } catch {
            print("❌ Failed to initialize ONNX model: \(error)")
        }
    }

    private func initializeSession() throws {
        guard let modelPath = Bundle.main.path(forResource: "antispoof_mn3", ofType: "onnx") else {
            throw NSError(domain: "AntiSpoofingHelper", code: -1, userInfo: [NSLocalizedDescriptionKey: "Model not found"])
        }

        env = try ORTEnv(loggingLevel: ORTLoggingLevel.warning)
        let sessionOptions = ORTSessionOptions()
        sessionOptions.logSeverityLevel = ORTLoggingLevel.warning.rawValue

        session = try ORTSession(env: env!, modelPath: modelPath, sessionOptions: sessionOptions)

        if let name = try session?.inputNames().first as? String {
            inputName = name
        }
    }

    @objc func predict(_ bitmap: UIImage) throws -> [Float] {
        guard let resized = bitmap.resized(to: CGSize(width: 128, height: 128)),
              let chw = resized.toNormalizedCHW(resized: CGSize(width: 128, height: 128)) else {
            throw NSError(domain: "AntiSpoofingHelper", code: -2, userInfo: [NSLocalizedDescriptionKey: "Image preprocessing failed"])
        }

        let inputTensor = try ORTValue(tensorData: Data(buffer: UnsafeBufferPointer(start: chw, count: chw.count)),
                                       elementType: ORTTensorElementDataType.float,
                                       shape: [1, 3, 128, 128] as [NSNumber])

        let input = [inputName: inputTensor]
        let output = try session?.run(withInputs: input, outputNames: nil, runOptions: nil)

        guard let first = output?.first?.value as? [[[Float]]],
              let logits = first.first?.first else {
            throw NSError(domain: "AntiSpoofingHelper", code: -3, userInfo: [NSLocalizedDescriptionKey: "Invalid model output"])
        }

        let probs = softmax(logits)
        print("📊 Spoof Scores:", probs)
        return probs
    }

    private func softmax(_ logits: [Float]) -> [Float] {
        let maxVal = logits.max() ?? 0
        let exps = logits.map { expf($0 - maxVal) }
        let sumExp = exps.reduce(0, +)
        return exps.map { $0 / sumExp }
    }

    deinit {
        session = nil
        env = nil
    }
}

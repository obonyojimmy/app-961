#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoEffectModule, NSObject)

RCT_EXTERN_METHOD(registerFaceDetectionMethod)
RCT_EXTERN_METHOD(extractFaceEmbedding:(RCTResponseSenderBlock)successCallback
                  errorCallback:(RCTResponseSenderBlock)errorCallback)

RCT_EXTERN_METHOD(makeGreat:(NSString *)name
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

@end
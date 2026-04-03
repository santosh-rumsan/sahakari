let _apiUrl = 'indexdb'

export function configureSDK(config: { apiUrl: string }) {
  _apiUrl = config.apiUrl
}

export function getSDKApiUrl(): string {
  return _apiUrl
}

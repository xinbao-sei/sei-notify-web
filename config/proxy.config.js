export default {
    '/mocker.api': {
      target: 'http://10.4.32.53:7300/mock/5e1d8655537a66a0f4eccca2/notify',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/mocker.api': '' },
    },
    '/service.api': {
      target: 'http://10.4.208.86:8100/api-gateway',
      // target: 'http://10.8.6.33:8080/',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/service.api': '' },
    },
  }
